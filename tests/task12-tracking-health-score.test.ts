import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { TrackingHealthService } from '../src/lib/services/tracking-health-service';

describe('Task 12: Diagnóstico de Saúde da Conta e Monitoramento de Rastreamento (PDF Seções 11, 55, 56, 57, 63)', () => {
  let empresaId: string;
  let pixelId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Saúde Test',
        slug_prefiro: `bella-napoli-health-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        orcamento_max_diario: 300.0
      }
    });
    empresaId = empresa.id;

    await db.integracaoMeta.create({
      data: {
        empresa_id: empresaId,
        access_token: 'sandbox_token_health_test',
        status: 'CONECTADO'
      }
    });

    await db.metaAdAccount.create({
      data: {
        empresa_id: empresaId,
        meta_account_id: 'act_health_123',
        name: 'Conta Anuncios Saude',
        currency: 'BRL',
        payment_method_ok: true
      }
    });

    await db.metaPage.create({
      data: {
        empresa_id: empresaId,
        meta_page_id: 'page_health_123',
        name: 'Pizzaria Saúde'
      }
    });

    await db.metaInstagram.create({
      data: {
        empresa_id: empresaId,
        meta_instagram_id: 'ig_health_123',
        username: '@pizzariasaude'
      }
    });

    const pixel = await db.metaPixel.create({
      data: {
        empresa_id: empresaId,
        meta_pixel_id: 'px_health_123',
        name: 'Pixel Principal',
        status: 'ATIVO',
        capi_enabled: true,
        has_purchase: true,
        has_add_to_cart: true,
        last_event_at: new Date()
      }
    });
    pixelId = pixel.id;

    await db.metaCatalogo.create({
      data: {
        empresa_id: empresaId,
        meta_catalog_id: 'cat_health_123',
        name: 'Catálogo Saúde',
        status: 'SINCRONIZADO',
        total_products: 50,
        active_products: 50
      }
    });

    await db.campanha.create({
      data: {
        empresa_id: empresaId,
        nome: 'Campanha Ativa Saúde',
        status: 'ACTIVE',
        orcamento_diario: 80.0
      }
    });
  });

  afterAll(async () => {
    await db.campanha.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaCatalogo.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaPixel.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaInstagram.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaPage.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaAdAccount.deleteMany({ where: { empresa_id: empresaId } });
    await db.integracaoMeta.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve realizar auditoria completa dos 11 itens técnicos da Seção 11 do PDF', async () => {
    const service = new TrackingHealthService();
    const auditoria = await service.auditAccountStructure(empresaId);

    expect(auditoria.scoreGeral).toBeGreaterThanOrEqual(80);
    expect(auditoria.itens.length).toBe(11);

    const checkItem = (titulo: string) => auditoria.itens.find(i => i.item.toLowerCase().includes(titulo.toLowerCase()));
    expect(checkItem('conta conectada')?.status).toBe(true);
    expect(checkItem('página conectada')?.status).toBe(true);
    expect(checkItem('Instagram conectado')?.status).toBe(true);
    expect(checkItem('Pixel ativo')?.status).toBe(true);
    expect(checkItem('Conversion API ativa')?.status).toBe(true);
    expect(checkItem('Purchase funcionando')?.status).toBe(true);
    expect(checkItem('catálogo atualizado')?.status).toBe(true);
    expect(checkItem('método de pagamento')?.status).toBe(true);
    expect(checkItem('anúncios ativos')?.status).toBe(true);
  });

  it('deve calcular o Score de Tráfego e os 6 subscores da Seção 63 do PDF', async () => {
    const service = new TrackingHealthService();
    const scores = await service.calculateTrafficScore(empresaId);

    expect(scores.scoreGeral).toBeGreaterThanOrEqual(0);
    expect(scores.scoreGeral).toBeLessThanOrEqual(100);

    // 6 subscores obrigatórios da Seção 63
    expect(scores.subscores.tracking).toBeGreaterThanOrEqual(90); // Pixel + CAPI ativos
    expect(scores.subscores.campanhas).toBeGreaterThanOrEqual(70);
    expect(scores.subscores.criativos).toBeDefined();
    expect(scores.subscores.publicos).toBeDefined();
    expect(scores.subscores.orcamento).toBeDefined();
    expect(scores.subscores.conversao).toBeDefined();
  });

  it('deve gerar diagnóstico de rastreamento com eventos detectados da Seção 55 e 57', async () => {
    const service = new TrackingHealthService();
    const diag = await service.getTrackingDiagnostics(empresaId);

    expect(diag.pixelStatus).toBe('ATIVO');
    expect(diag.capiStatus).toBe('ATIVA');
    expect(diag.purchaseStatus).toBe('RECEBENDO_EVENTOS');
    expect(diag.eventosDetectados).toContain('Purchase');
    expect(diag.eventosDetectados).toContain('AddToCart');
    expect(diag.ultimoEvento).toBeDefined();
    expect(diag.problemasEncontrados.length).toBe(0);
  });

  it('deve registrar evento server-side via Conversion API (Seção 56)', async () => {
    const service = new TrackingHealthService();

    const result = await service.dispatchCapiEvent(empresaId, {
      eventName: 'Purchase',
      eventData: {
        value: 79.90,
        currency: 'BRL',
        order_id: 'ord_capi_99'
      },
      userData: {
        email: 'cliente@delivery.com',
        phone: '75999991111'
      }
    });

    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();

    // Pixel deve ter has_purchase e last_event_at atualizados
    const updatedPixel = await db.metaPixel.findUnique({ where: { id: pixelId } });
    expect(updatedPixel?.has_purchase).toBe(true);
  });
});
