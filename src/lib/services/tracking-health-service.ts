/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Diagnóstico de Saúde da Conta e Monitoramento de Rastreamento (Pixel & CAPI)
 * (PDF Seções 11, 55, 56, 57, 63)
 */

import { db } from '../db';
import { normalizeAndHashEmail, normalizeAndHashPhone } from './customer-audience-service';

export interface AccountAuditItem {
  item: string;
  status: boolean;
  detalhe: string;
  peso: number;
}

export interface AccountAuditResult {
  scoreGeral: number;
  itens: AccountAuditItem[];
  statusConta: 'EXCELENTE' | 'BOM' | 'ATENCAO' | 'CRITICO';
}

export interface TrafficScoreResult {
  scoreGeral: number;
  subscores: {
    tracking: number;
    campanhas: number;
    criativos: number;
    publicos: number;
    orcamento: number;
    conversao: number;
  };
}

export interface TrackingDiagnosticsResult {
  pixelStatus: 'ATIVO' | 'INATIVO' | 'DESCONECTADO';
  capiStatus: 'ATIVA' | 'INATIVA';
  purchaseStatus: 'RECEBENDO_EVENTOS' | 'SEM_EVENTOS';
  eventosDetectados: string[];
  ultimoEvento: string;
  problemasEncontrados: string[];
}

export interface CapiEventPayload {
  eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';
  eventData?: Record<string, any>;
  userData?: {
    email?: string;
    phone?: string;
  };
}

export class TrackingHealthService {
  /**
   * Auditoria completa dos 11 itens estruturais da conta (PDF Seção 11)
   */
  async auditAccountStructure(empresaId: string): Promise<AccountAuditResult> {
    const [
      integracao,
      adAccount,
      pages,
      instagrams,
      pixels,
      catalogo,
      campanhasAtivas,
      metricasRecentes
    ] = await Promise.all([
      db.integracaoMeta.findFirst({ where: { empresa_id: empresaId } }),
      db.metaAdAccount.findFirst({ where: { empresa_id: empresaId } }),
      db.metaPage.count({ where: { empresa_id: empresaId, is_connected: true } }),
      db.metaInstagram.count({ where: { empresa_id: empresaId, is_connected: true } }),
      db.metaPixel.findFirst({ where: { empresa_id: empresaId } }),
      db.metaCatalogo.findFirst({ where: { empresa_id: empresaId } }),
      db.campanha.count({ where: { empresa_id: empresaId, status: 'ACTIVE' } }),
      db.campanhaMetrica.count({ where: { campanha: { empresa_id: empresaId } } })
    ]);

    const pixelAtivo = pixels?.status === 'ATIVO';
    const capiAtiva = !!pixels?.capi_enabled;
    const purchaseOk = !!pixels?.has_purchase;
    const catalogoOk = catalogo?.status === 'SINCRONIZADO';
    const pagamentoOk = adAccount?.payment_method_ok ?? false;
    const eventosRecentes = pixels?.last_event_at
      ? (Date.now() - pixels.last_event_at.getTime()) < 24 * 60 * 60 * 1000
      : false;

    const itens: AccountAuditItem[] = [
      { item: 'Conta conectada', status: integracao?.status === 'CONECTADO', detalhe: integracao?.status || 'Desconectado', peso: 10 },
      { item: 'Página conectada', status: pages > 0, detalhe: `${pages} página(s) vinculada(s)`, peso: 10 },
      { item: 'Instagram conectado', status: instagrams > 0, detalhe: `${instagrams} conta(s) vinculada(s)`, peso: 10 },
      { item: 'Pixel ativo', status: pixelAtivo, detalhe: pixels?.name || 'Não configurado', peso: 15 },
      { item: 'Conversion API ativa', status: capiAtiva, detalhe: capiAtiva ? 'Rastreamento server-side ativo' : 'Desativado', peso: 10 },
      { item: 'Purchase funcionando', status: purchaseOk, detalhe: purchaseOk ? 'Eventos de compra confirmados' : 'Pendente de validação', peso: 15 },
      { item: 'Catálogo atualizado', status: catalogoOk, detalhe: catalogo ? `${catalogo.active_products || 0} produtos` : 'Não vinculado', peso: 10 },
      { item: 'Método de pagamento válido', status: pagamentoOk, detalhe: pagamentoOk ? 'Forma de pagamento ativa' : 'Pendente', peso: 10 },
      { item: 'Anúncios ativos', status: campanhasAtivas > 0, detalhe: `${campanhasAtivas} campanha(s) rodando`, peso: 5 },
      { item: 'Qualidade dos eventos', status: eventosRecentes, detalhe: eventosRecentes ? 'Eventos nas últimas 24h' : 'Sem eventos recentes', peso: 2.5 },
      { item: 'Histórico recente', status: metricasRecentes > 0, detalhe: `${metricasRecentes} snapshot(s) armazenado(s)`, peso: 2.5 }
    ];

    const totalPontosPossiveis = itens.reduce((acc, i) => acc + i.peso, 0);
    const pontosObtidos = itens.filter(i => i.status).reduce((acc, i) => acc + i.peso, 0);
    const scoreGeral = Math.round((pontosObtidos / totalPontosPossiveis) * 100);

    let statusConta: AccountAuditResult['statusConta'] = 'EXCELENTE';
    if (scoreGeral < 50) statusConta = 'CRITICO';
    else if (scoreGeral < 75) statusConta = 'ATENCAO';
    else if (scoreGeral < 90) statusConta = 'BOM';

    return {
      scoreGeral,
      itens,
      statusConta
    };
  }

  /**
   * Cálculo do Score de Tráfego e dos 6 subscores (PDF Seção 63)
   */
  async calculateTrafficScore(empresaId: string): Promise<TrafficScoreResult> {
    const [pixels, campanhas, criativos, publicos, empresa, metricas] = await Promise.all([
      db.metaPixel.findFirst({ where: { empresa_id: empresaId } }),
      db.campanha.findMany({ where: { empresa_id: empresaId } }),
      db.criativo.count({ where: { empresa_id: empresaId } }),
      db.publico.count({ where: { empresa_id: empresaId } }),
      db.empresa.findUnique({ where: { id: empresaId } }),
      db.campanhaMetrica.findMany({
        where: { campanha: { empresa_id: empresaId } },
        orderBy: { data: 'desc' },
        take: 10
      })
    ]);

    // Subscore: Tracking (Pixel + CAPI + Purchase)
    let tracking = 30;
    if (pixels?.status === 'ATIVO') tracking += 30;
    if (pixels?.capi_enabled) tracking += 20;
    if (pixels?.has_purchase) tracking += 20;

    // Subscore: Campanhas
    const ativas = campanhas.filter(c => c.status === 'ACTIVE').length;
    let scoreCampanhas = ativas > 0 ? 80 : 40;
    if (campanhas.length > 2) scoreCampanhas += 10;

    // Subscore: Criativos
    const scoreCriativos = criativos >= 5 ? 90 : criativos >= 2 ? 75 : 60;

    // Subscore: Públicos
    const scorePublicos = publicos >= 3 ? 90 : publicos >= 1 ? 80 : 50;

    // Subscore: Orçamento (segurança e teto)
    const scoreOrcamento = empresa?.orcamento_max_diario ? 88 : 70;

    // Subscore: Conversão
    const totalConversoes = metricas.reduce((acc, m) => acc + m.conversoes, 0);
    const scoreConversao = totalConversoes > 15 ? 85 : totalConversoes > 0 ? 75 : 60;

    const subscores = {
      tracking: Math.min(100, tracking),
      campanhas: Math.min(100, scoreCampanhas),
      criativos: Math.min(100, scoreCriativos),
      publicos: Math.min(100, scorePublicos),
      orcamento: Math.min(100, scoreOrcamento),
      conversao: Math.min(100, scoreConversao)
    };

    const mediaGeral = Math.round(
      (subscores.tracking +
        subscores.campanhas +
        subscores.criativos +
        subscores.publicos +
        subscores.orcamento +
        subscores.conversao) / 6
    );

    return {
      scoreGeral: mediaGeral,
      subscores
    };
  }

  /**
   * Diagnóstico detalhado de rastreamento (PDF Seções 55 e 57)
   */
  async getTrackingDiagnostics(empresaId: string): Promise<TrackingDiagnosticsResult> {
    const pixel = await db.metaPixel.findFirst({
      where: { empresa_id: empresaId }
    });

    const eventosDetectados: string[] = ['PageView'];
    if (pixel?.status === 'ATIVO') eventosDetectados.push('ViewContent');
    if (pixel?.has_add_to_cart) eventosDetectados.push('AddToCart');
    if (pixel?.has_purchase) eventosDetectados.push('InitiateCheckout', 'Purchase');

    const problemasEncontrados: string[] = [];
    if (!pixel) {
      problemasEncontrados.push('Pixel não configurado.');
    } else {
      if (pixel.status !== 'ATIVO') problemasEncontrados.push('Pixel inativo na Meta.');
      if (!pixel.capi_enabled) problemasEncontrados.push('Conversion API desativada.');
      if (!pixel.has_purchase) problemasEncontrados.push('Nenhum evento Purchase detectado nos últimos dias.');
    }

    let ultimoEventoTexto = 'Sem registros';
    if (pixel?.last_event_at) {
      const diffMin = Math.round((Date.now() - pixel.last_event_at.getTime()) / (1000 * 60));
      ultimoEventoTexto = diffMin <= 1 ? 'Agora mesmo' : `${diffMin} minutos atrás`;
    }

    return {
      pixelStatus: pixel ? (pixel.status as any) : 'DESCONECTADO',
      capiStatus: pixel?.capi_enabled ? 'ATIVA' : 'INATIVA',
      purchaseStatus: pixel?.has_purchase ? 'RECEBENDO_EVENTOS' : 'SEM_EVENTOS',
      eventosDetectados,
      ultimoEvento: ultimoEventoTexto,
      problemasEncontrados
    };
  }

  /**
   * Envia evento server-side via Conversion API (PDF Seção 56)
   */
  async dispatchCapiEvent(empresaId: string, payload: CapiEventPayload): Promise<{ success: boolean; eventId: string }> {
    const pixel = await db.metaPixel.findFirst({
      where: { empresa_id: empresaId }
    });

    const eventId = `capi_evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Hash dos identificadores de usuário (LGPD)
    const hashedEmail = payload.userData?.email ? normalizeAndHashEmail(payload.userData.email) : undefined;
    const hashedPhone = payload.userData?.phone ? normalizeAndHashPhone(payload.userData.phone) : undefined;

    // Em sandbox ou produção: atualizar carimbo e flags do Pixel local
    if (pixel) {
      const updateData: Record<string, any> = {
        last_event_at: new Date()
      };

      if (payload.eventName === 'Purchase') {
        updateData.has_purchase = true;
      }
      if (payload.eventName === 'AddToCart') {
        updateData.has_add_to_cart = true;
      }

      await db.metaPixel.update({
        where: { id: pixel.id },
        data: updateData
      });
    }

    // Se estiver em modo Produção, envia para a Graph API da Meta
    if ((process.env.ACTIVE_META_ADAPTER || 'sandbox') !== 'sandbox') {
      const integracao = await db.integracaoMeta.findFirst({
        where: { empresa_id: empresaId, status: 'CONECTADO' }
      });

      if (integracao?.access_token && pixel?.meta_pixel_id) {
        try {
          const apiVersion = process.env.META_API_VERSION || 'v20.0';
          await fetch(`https://graph.facebook.com/${apiVersion}/${pixel.meta_pixel_id}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: integracao.access_token,
              data: [
                {
                  event_name: payload.eventName,
                  event_time: Math.floor(Date.now() / 1000),
                  event_id: eventId,
                  user_data: {
                    em: hashedEmail ? [hashedEmail] : undefined,
                    ph: hashedPhone ? [hashedPhone] : undefined
                  },
                  custom_data: payload.eventData
                }
              ]
            })
          });
        } catch (err) {
          console.warn('Falha no envio HTTP do CAPI:', err);
        }
      }
    }

    return {
      success: true,
      eventId
    };
  }
}
