/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Conexão Meta OAuth e Descoberta de Ativos (PDF Seções 9, 10, 91)
 *
 * Responsável por:
 *   - Gerar URL de autorização OAuth 2.0 da Meta
 *   - Processar callback e trocar code por access_token de longa duração
 *   - Descobrir e persistir todos os ativos vinculados (Business, Ad Accounts, Pages, IG, Pixels)
 *   - Fornecer status consolidado para a Central de Integrações
 *   - Permitir desconexão segura
 */

import { db } from '../db';
import { getMetaAdsService } from '../adapters';

const META_OAUTH_SCOPES = [
  'ads_management',
  'ads_read',
  'business_management',
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic'
];

export interface DiscoveredAssets {
  businesses: Array<{ id: string; meta_business_id: string; name: string }>;
  adAccounts: Array<{ id: string; meta_account_id: string; name: string; currency: string }>;
  pages: Array<{ id: string; meta_page_id: string; name: string }>;
  instagrams: Array<{ id: string; meta_instagram_id: string; username: string }>;
  pixels: Array<{ id: string; meta_pixel_id: string; name: string; status: string }>;
}

export interface IntegrationStatus {
  meta: {
    connected: boolean;
    status: string;
    lastSyncAt: string | null;
  };
  assets: {
    businesses: number;
    adAccounts: number;
    pages: number;
    instagrams: number;
    pixels: number;
  };
}

export class MetaConnectionService {
  /**
   * Gera a URL de redirecionamento para o OAuth da Meta.
   * Em sandbox, retorna uma URL simulada. Em produção, usa app_id real.
   */
  getOAuthUrl(empresaId: string): string {
    const appId = process.env.META_APP_ID || 'sandbox_app_id';
    const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/auth/meta/callback';
    const scopes = META_OAUTH_SCOPES.join(',');

    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${empresaId}&response_type=code`;
  }

  /**
   * Processa o callback OAuth: troca o code por um token de longa duração e salva.
   * Em sandbox, gera um token simulado.
   */
  async processOAuthCallback(empresaId: string, authCode: string) {
    const isSandbox = process.env.NODE_ENV === 'test' || (process.env.ACTIVE_META_ADAPTER || 'sandbox') === 'sandbox';

    let accessToken: string;
    let metaUserId: string;

    if (isSandbox) {
      // Sandbox: token simulado determinístico
      accessToken = `sandbox_token_${empresaId}_${Date.now()}`;
      metaUserId = `sandbox_user_${empresaId}`;
    } else {
      // Produção: trocar code por token via Graph API
      const tokenResponse = await this.exchangeCodeForToken(authCode);
      accessToken = tokenResponse.access_token;
      metaUserId = tokenResponse.user_id;
    }

    // Persiste ou atualiza a integração
    const existing = await db.integracaoMeta.findFirst({
      where: { empresa_id: empresaId }
    });

    if (existing) {
      return db.integracaoMeta.update({
        where: { id: existing.id },
        data: {
          access_token: accessToken,
          meta_user_id: metaUserId,
          status: 'CONECTADO',
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // ~60 dias
        }
      });
    }

    return db.integracaoMeta.create({
      data: {
        empresa_id: empresaId,
        access_token: accessToken,
        meta_user_id: metaUserId,
        status: 'CONECTADO',
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      }
    });
  }

  /**
   * Descobre todos os ativos Meta vinculados e persiste no banco.
   */
  async discoverAndSaveAssets(empresaId: string): Promise<DiscoveredAssets> {
    const integracao = await db.integracaoMeta.findFirst({
      where: { empresa_id: empresaId, status: 'CONECTADO' }
    });

    if (!integracao) {
      throw new Error('Integração Meta não encontrada ou desconectada.');
    }

    const metaService = getMetaAdsService();
    const token = integracao.access_token;

    // Descobrir ativos em paralelo
    const [rawBusinesses, rawAccounts, rawPages, rawInstagrams] = await Promise.all([
      metaService.getBusinessPortfolios(token),
      metaService.getAdAccounts(token),
      metaService.getPages(token),
      metaService.getInstagramAccounts(token),
    ]);

    // Persistir Business Portfolios
    const businesses = [];
    for (const biz of rawBusinesses) {
      const saved = await db.metaBusiness.create({
        data: {
          empresa_id: empresaId,
          meta_business_id: biz.id,
          name: biz.name,
          status: 'CONECTADO',
        }
      });
      businesses.push(saved);
    }

    // Persistir Ad Accounts
    const adAccounts = [];
    for (const acc of rawAccounts) {
      const saved = await db.metaAdAccount.create({
        data: {
          empresa_id: empresaId,
          meta_account_id: acc.id,
          name: acc.name,
          currency: acc.currency,
          timezone: acc.timezone,
          status: acc.account_status || 'ACTIVE',
        }
      });
      adAccounts.push(saved);
    }

    // Persistir Pages
    const pages = [];
    for (const page of rawPages) {
      const saved = await db.metaPage.create({
        data: {
          empresa_id: empresaId,
          meta_page_id: page.id,
          name: page.name,
          is_connected: true,
        }
      });
      pages.push(saved);
    }

    // Persistir Instagram
    const instagrams = [];
    for (const ig of rawInstagrams) {
      const saved = await db.metaInstagram.create({
        data: {
          empresa_id: empresaId,
          meta_instagram_id: ig.id,
          username: ig.username,
          is_connected: true,
        }
      });
      instagrams.push(saved);
    }

    // Descobrir Pixels (precisa de ad account)
    const pixels = [];
    if (adAccounts.length > 0) {
      const rawPixels = await metaService.getPixels(token, adAccounts[0].meta_account_id);
      for (const px of rawPixels) {
        const saved = await db.metaPixel.create({
          data: {
            empresa_id: empresaId,
            meta_pixel_id: px.id,
            name: px.name,
            status: px.status,
            last_event_at: px.last_event_at ? new Date(px.last_event_at) : null,
          }
        });
        pixels.push(saved);
      }
    }

    // Atualizar timestamp de última sincronização
    await db.integracaoMeta.updateMany({
      where: { empresa_id: empresaId, status: 'CONECTADO' },
      data: { last_sync_at: new Date() }
    });

    return { businesses, adAccounts, pages, instagrams, pixels };
  }

  /**
   * Retorna status consolidado de integração para a Central de Integrações (PDF Seção 10).
   */
  async getIntegrationStatus(empresaId: string): Promise<IntegrationStatus> {
    const integracao = await db.integracaoMeta.findFirst({
      where: { empresa_id: empresaId },
      orderBy: { created_at: 'desc' }
    });

    const [bizCount, accCount, pageCount, igCount, pixelCount] = await Promise.all([
      db.metaBusiness.count({ where: { empresa_id: empresaId } }),
      db.metaAdAccount.count({ where: { empresa_id: empresaId } }),
      db.metaPage.count({ where: { empresa_id: empresaId } }),
      db.metaInstagram.count({ where: { empresa_id: empresaId } }),
      db.metaPixel.count({ where: { empresa_id: empresaId } }),
    ]);

    return {
      meta: {
        connected: integracao?.status === 'CONECTADO',
        status: integracao?.status || 'DESCONECTADO',
        lastSyncAt: integracao?.last_sync_at?.toISOString() || null,
      },
      assets: {
        businesses: bizCount,
        adAccounts: accCount,
        pages: pageCount,
        instagrams: igCount,
        pixels: pixelCount,
      }
    };
  }

  /**
   * Desconecta a integração Meta e limpa os ativos descobertos.
   */
  async disconnect(empresaId: string): Promise<void> {
    await db.metaPixel.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaInstagram.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaPage.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaAdAccount.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaBusiness.deleteMany({ where: { empresa_id: empresaId } });

    await db.integracaoMeta.updateMany({
      where: { empresa_id: empresaId },
      data: { status: 'DESCONECTADO', access_token: '' }
    });
  }

  /**
   * Troca o authorization code por um access token de longa duração (Produção).
   */
  private async exchangeCodeForToken(code: string): Promise<{ access_token: string; user_id: string }> {
    const appId = process.env.META_APP_ID!;
    const appSecret = process.env.META_APP_SECRET!;
    const redirectUri = process.env.META_REDIRECT_URI!;
    const apiVersion = process.env.META_API_VERSION || 'v20.0';

    // Passo 1: Trocar code por short-lived token
    const shortRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
    );
    const shortData = await shortRes.json() as any;

    if (!shortData.access_token) {
      throw new Error(`Erro ao obter token curto: ${JSON.stringify(shortData)}`);
    }

    // Passo 2: Trocar por long-lived token
    const longRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortData.access_token}`
    );
    const longData = await longRes.json() as any;

    if (!longData.access_token) {
      throw new Error(`Erro ao obter token longo: ${JSON.stringify(longData)}`);
    }

    // Passo 3: Buscar user_id
    const meRes = await fetch(`https://graph.facebook.com/${apiVersion}/me?access_token=${longData.access_token}`);
    const meData = await meRes.json() as any;

    return {
      access_token: longData.access_token,
      user_id: meData.id || 'unknown',
    };
  }
}
