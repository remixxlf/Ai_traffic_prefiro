import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { MetaConnectionService } from '../src/lib/services/meta-connection-service';

describe('Task 5: Conexão Meta OAuth e Descoberta de Ativos (PDF Seções 9, 10, 91)', () => {
  let empresaId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: { nome: 'Pizzaria OAuth Test', segmento: 'Pizzaria', cidade: 'Salvador' }
    });
    empresaId = empresa.id;
  });

  afterAll(async () => {
    await db.metaPixel.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaInstagram.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaPage.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaAdAccount.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaBusiness.deleteMany({ where: { empresa_id: empresaId } });
    await db.integracaoMeta.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve gerar a URL de autorização OAuth da Meta com as permissões corretas', () => {
    const service = new MetaConnectionService();
    const url = service.getOAuthUrl(empresaId);

    expect(url).toContain('facebook.com');
    expect(url).toContain('ads_management');
    expect(url).toContain('ads_read');
    expect(url).toContain('business_management');
    expect(url).toContain(empresaId);
  });

  it('deve processar o callback OAuth e salvar o token de acesso criptografado', async () => {
    const service = new MetaConnectionService();

    const integracao = await service.processOAuthCallback(empresaId, 'sandbox_auth_code_123');

    expect(integracao.id).toBeDefined();
    expect(integracao.access_token).toBeDefined();
    expect(integracao.access_token.length).toBeGreaterThan(0);
    expect(integracao.status).toBe('CONECTADO');
  });

  it('deve descobrir e persistir todos os ativos Meta da conta (portfolios, contas, páginas, IG, pixels)', async () => {
    const service = new MetaConnectionService();

    const assets = await service.discoverAndSaveAssets(empresaId);

    expect(assets.businesses.length).toBeGreaterThan(0);
    expect(assets.adAccounts.length).toBeGreaterThan(0);
    expect(assets.pages.length).toBeGreaterThan(0);
    expect(assets.instagrams.length).toBeGreaterThan(0);
    expect(assets.pixels.length).toBeGreaterThan(0);

    // Verificar persistência no banco
    const savedBusinesses = await db.metaBusiness.findMany({ where: { empresa_id: empresaId } });
    expect(savedBusinesses.length).toBe(assets.businesses.length);

    const savedAccounts = await db.metaAdAccount.findMany({ where: { empresa_id: empresaId } });
    expect(savedAccounts.length).toBe(assets.adAccounts.length);
    expect(savedAccounts[0].currency).toBe('BRL');

    const savedPixels = await db.metaPixel.findMany({ where: { empresa_id: empresaId } });
    expect(savedPixels.length).toBe(assets.pixels.length);
    expect(savedPixels[0].status).toBe('ATIVO');
  });

  it('deve retornar o status consolidado de todas as integrações para a Central de Integrações', async () => {
    const service = new MetaConnectionService();

    const status = await service.getIntegrationStatus(empresaId);

    expect(status.meta.connected).toBe(true);
    expect(status.meta.status).toBe('CONECTADO');
    expect(status.assets.businesses).toBeGreaterThan(0);
    expect(status.assets.adAccounts).toBeGreaterThan(0);
    expect(status.assets.pages).toBeGreaterThan(0);
    expect(status.assets.instagrams).toBeGreaterThan(0);
    expect(status.assets.pixels).toBeGreaterThan(0);
  });

  it('deve permitir desconectar a integração Meta e limpar os ativos', async () => {
    const service = new MetaConnectionService();

    await service.disconnect(empresaId);

    const status = await service.getIntegrationStatus(empresaId);
    expect(status.meta.connected).toBe(false);
    expect(status.meta.status).toBe('DESCONECTADO');
  });
});
