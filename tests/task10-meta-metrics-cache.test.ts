import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { MetaMetricsSyncWorker } from '../src/lib/workers/meta-metrics-worker';
import { MetricsQueryService } from '../src/lib/services/metrics-query-service';

describe('Task 10: Worker de Métricas da Meta & Snapshots Analíticos (PDF Seções 60, 70, 71, 73)', () => {
  let empresaId: string;
  let campanhaId: string;
  const metaCampaignId = `cmp_test_${Date.now()}`;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Métricas Test',
        slug_prefiro: `bella-napoli-met-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA'
      }
    });
    empresaId = empresa.id;

    await db.integracaoMeta.create({
      data: {
        empresa_id: empresaId,
        access_token: 'sandbox_token_metrics_test',
        status: 'CONECTADO'
      }
    });

    const camp = await db.campanha.create({
      data: {
        empresa_id: empresaId,
        meta_campaign_id: metaCampaignId,
        nome: 'Campanha Pizza Família Especial',
        status: 'ACTIVE',
        orcamento_diario: 100.0
      }
    });
    campanhaId = camp.id;
  });

  afterAll(async () => {
    await db.campanhaMetrica.deleteMany({ where: { campanha_id: campanhaId } });
    await db.campanha.deleteMany({ where: { id: campanhaId } });
    await db.integracaoMeta.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve sincronizar e salvar snapshot diário com todos os campos da Seção 73 do PDF', async () => {
    const worker = new MetaMetricsSyncWorker();
    const result = await worker.syncCampanhaMetrics(campanhaId);

    expect(result.success).toBe(true);
    expect(result.snapshot).toBeDefined();

    // Validar os 13 campos analíticos do snapshot
    const snap = result.snapshot;
    expect(snap.campanha_id).toBe(campanhaId);
    expect(snap.investimento).toBeGreaterThan(0);
    expect(snap.impressoes).toBeGreaterThan(0);
    expect(snap.alcance).toBeGreaterThan(0);
    expect(snap.cliques).toBeGreaterThan(0);
    expect(snap.ctr).toBeGreaterThan(0);
    expect(snap.cpc).toBeGreaterThan(0);
    expect(snap.cpm).toBeGreaterThan(0);
    expect(snap.frequencia).toBeGreaterThan(0);
    expect(snap.conversoes).toBeGreaterThan(0);
    expect(snap.cpa).toBeGreaterThan(0);
    expect(snap.roas).toBeGreaterThan(0);
  });

  it('deve garantir idempotência de snapshots diários via upsert sem duplicar registros (Seção 71)', async () => {
    const worker = new MetaMetricsSyncWorker();

    // Executa a sincronização uma segunda vez no mesmo dia
    const secondRun = await worker.syncCampanhaMetrics(campanhaId);
    expect(secondRun.success).toBe(true);

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const snapshots = await db.campanhaMetrica.findMany({
      where: {
        campanha_id: campanhaId,
        data: hoje
      }
    });

    // Deve haver apenas 1 registro único para hoje
    expect(snapshots.length).toBe(1);
  });

  it('MetricsQueryService deve ler métricas cacheadas no banco sem depender da Meta API (Seção 71)', async () => {
    const queryService = new MetricsQueryService();
    const metrics = await queryService.getEmpresaMetricsSummary(empresaId, 'last_7d');

    expect(metrics).toBeDefined();
    expect(metrics.investimentoTotal).toBeGreaterThan(0);
    expect(metrics.conversoesTotal).toBeGreaterThan(0);
    expect(metrics.roasMedio).toBeGreaterThan(0);
    expect(metrics.cpaMedio).toBeGreaterThan(0);
    expect(metrics.campanhas.length).toBe(1);
    expect(metrics.campanhas[0].nome).toBe('Campanha Pizza Família Especial');
  });

  it('deve realizar análise comparativa de períodos (Hoje x Ontem e 7d x 7d anteriores) (Seção 60)', async () => {
    const queryService = new MetricsQueryService();

    // Inserir métrica do período anterior para teste comparativo
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    seteDiasAtras.setUTCHours(0, 0, 0, 0);

    await db.campanhaMetrica.create({
      data: {
        campanha_id: campanhaId,
        data: seteDiasAtras,
        investimento: 700.0,
        impressoes: 35000,
        alcance: 25000,
        cliques: 1000,
        ctr: 2.85,
        cpc: 0.70,
        cpm: 20.0,
        frequencia: 1.4,
        conversoes: 70,
        vendas: 70,
        receita: 4900.0,
        cpa: 10.0,
        roas: 7.0
      }
    });

    const comparativo = await queryService.getComparativeAnalysis(empresaId, '7d_vs_previous_7d');

    expect(comparativo).toBeDefined();
    expect(comparativo.atual).toBeDefined();
    expect(comparativo.anterior).toBeDefined();
    expect(comparativo.variacaoPercentual).toBeDefined();
    expect(typeof comparativo.variacaoPercentual.investimento).toBe('number');
  });
});
