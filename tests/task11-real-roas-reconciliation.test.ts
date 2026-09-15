import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { RealSalesReconciliationService } from '../src/lib/services/real-sales-service';

describe('Task 11: Ingestão de Vendas Prefiro Delivery e Cálculo do ROAS Real (PDF Seções 52, 53, 73)', () => {
  let empresaId: string;
  let campanhaId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria ROAS Real Test',
        slug_prefiro: `bella-napoli-roas-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        ticket_medio: 78.0
      }
    });
    empresaId = empresa.id;

    const camp = await db.campanha.create({
      data: {
        empresa_id: empresaId,
        meta_campaign_id: `cmp_roas_${Date.now()}`,
        nome: 'Campanha Pizza Família Real',
        status: 'ACTIVE',
        orcamento_diario: 100.0
      }
    });
    campanhaId = camp.id;

    // Criar métrica com dados brutos da Meta para o dia de hoje
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    await db.campanhaMetrica.create({
      data: {
        campanha_id: campanhaId,
        data: hoje,
        investimento: 200.0,
        impressoes: 10000,
        alcance: 7000,
        cliques: 400,
        ctr: 4.0,
        cpc: 0.50,
        cpm: 20.0,
        frequencia: 1.4,
        conversoes: 20, // Conversões que a Meta alega
        vendas: 20,
        receita: 1400.0, // Receita estimada pela Meta
        cpa: 10.0,
        roas: 7.0 // ROAS informado pela Meta
      }
    });
  });

  afterAll(async () => {
    await db.campanhaMetrica.deleteMany({ where: { campanha_id: campanhaId } });
    await db.campanha.deleteMany({ where: { id: campanhaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve cruzar os pedidos reais da Prefiro Delivery com os dados de anúncios (PDF Seção 52)', async () => {
    const service = new RealSalesReconciliationService();

    const resultado = await service.reconcileCompanySales(empresaId);

    expect(resultado.success).toBe(true);
    expect(resultado.pedidosReais).toBeGreaterThan(0);
    expect(resultado.receitaReal).toBeGreaterThan(0);
    expect(resultado.investimentoTotal).toBe(200.0);
  });

  it('deve calcular o ROAS Real e Custo Real por Pedido com precisão (PDF Seção 53)', async () => {
    const service = new RealSalesReconciliationService();

    const resultado = await service.reconcileCompanySales(empresaId);

    // ROAS Real = Receita Real / Investimento
    const roasEsperado = Number((resultado.receitaReal / resultado.investimentoTotal).toFixed(2));
    expect(resultado.roasReal).toBe(roasEsperado);

    // Custo Real por Pedido = Investimento / Pedidos Reais
    const cpaRealEsperado = Number((resultado.investimentoTotal / resultado.pedidosReais).toFixed(2));
    expect(resultado.custoRealPorPedido).toBe(cpaRealEsperado);
  });

  it('deve expor a diferença explícita entre Conversões Meta e Pedidos Reais (PDF Seção 52)', async () => {
    const service = new RealSalesReconciliationService();

    const comparativo = await service.getComparisonReport(empresaId);

    expect(comparativo.meta).toBeDefined();
    expect(comparativo.real).toBeDefined();
    expect(comparativo.meta.conversoes).toBe(20);
    expect(comparativo.real.pedidos).toBeGreaterThan(0);
    expect(comparativo.discrepanciaPercentual).toBeDefined();
    expect(typeof comparativo.discrepanciaPercentual.roas).toBe('number');
  });

  it('deve atualizar os snapshots na tabela campanha_metrica com os valores reais (PDF Seção 73)', async () => {
    const service = new RealSalesReconciliationService();
    await service.reconcileCompanySales(empresaId);

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const metricaAtualizada = await db.campanhaMetrica.findUnique({
      where: {
        campanha_id_data: {
          campanha_id: campanhaId,
          data: hoje
        }
      }
    });

    expect(metricaAtualizada).not.toBeNull();
    expect(metricaAtualizada!.pedidos_reais).toBeGreaterThan(0);
    expect(metricaAtualizada!.receita_real).toBeGreaterThan(0);
    expect(metricaAtualizada!.roas_real).toBeGreaterThan(0);
    expect(metricaAtualizada!.cpa_real).toBeGreaterThan(0);
  });
});
