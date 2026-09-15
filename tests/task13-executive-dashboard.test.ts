import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { ExecutiveDashboardService } from '../src/lib/services/executive-dashboard-service';

describe('Task 13: Dashboard Executivo Centrado no Negócio & Funil de Conversão (PDF Seções 12, 54, 58, 59, 60, 88, 89)', () => {
  let empresaId: string;
  let campanhaId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Dashboard Test',
        slug_prefiro: `bella-napoli-dash-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        ticket_medio: 80.0
      }
    });
    empresaId = empresa.id;

    const camp = await db.campanha.create({
      data: {
        empresa_id: empresaId,
        nome: 'Campanha Pizza no Fim de Semana',
        status: 'ACTIVE',
        orcamento_diario: 120.0
      }
    });
    campanhaId = camp.id;

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    // Snapshot recente da campanha
    await db.campanhaMetrica.create({
      data: {
        campanha_id: campanhaId,
        data: hoje,
        investimento: 400.0,
        impressoes: 20000,
        alcance: 14000,
        cliques: 800,
        ctr: 4.0,
        cpc: 0.50,
        cpm: 20.0,
        frequencia: 1.43,
        conversoes: 35,
        vendas: 35,
        receita: 2800.0,
        cpa: 11.43,
        roas: 7.0,
        pedidos_reais: 32,
        receita_real: 2560.0,
        roas_real: 6.4,
        cpa_real: 12.50
      }
    });

    // Criar Pixel para o subscore de tracking
    await db.metaPixel.create({
      data: {
        empresa_id: empresaId,
        meta_pixel_id: 'px_dash_123',
        name: 'Pixel Dashboard',
        status: 'ATIVO',
        has_purchase: true,
        capi_enabled: true
      }
    });
  });

  afterAll(async () => {
    await db.campanhaMetrica.deleteMany({ where: { campanha_id: campanhaId } });
    await db.campanha.deleteMany({ where: { id: campanhaId } });
    await db.metaPixel.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve responder às 4 perguntas essenciais do empresário (PDF Seção 12)', async () => {
    const service = new ExecutiveDashboardService();
    const data = await service.getExecutiveOverview(empresaId, 'last_7d');

    expect(data.perguntasEssenciais).toBeDefined();
    // 1. Quanto investi?
    expect(data.perguntasEssenciais.quantoInvesti).toBe(400.0);
    // 2. Quantos pedidos entraram?
    expect(data.perguntasEssenciais.quantosPedidos).toBeGreaterThan(0);
    // 3. Qual o custo por pedido?
    expect(data.perguntasEssenciais.custoPorPedido).toBeGreaterThan(0);
    // 4. Quanto voltou em vendas?
    expect(data.perguntasEssenciais.quantoVoltou).toBeGreaterThan(0);
    // Retorno sobre investimento
    expect(data.perguntasEssenciais.retornoSobreInvestimento).toBeGreaterThan(0);
    // Saúde da conta
    expect(data.perguntasEssenciais.saudeConta).toBeGreaterThan(0);
  });

  it('deve construir o funil de tráfego em 5 etapas com taxas de conversão (PDF Seção 54)', async () => {
    const service = new ExecutiveDashboardService();
    const funil = await service.getConversionFunnel(empresaId, 'last_7d');

    expect(funil.etapas.length).toBe(5);

    // 1. Impressões (Visualizações)
    expect(funil.etapas[0].nome).toBe('Pessoas que viram o anúncio');
    expect(funil.etapas[0].volume).toBe(20000);

    // 2. Cliques no link
    expect(funil.etapas[1].nome).toBe('Pessoas que clicaram');
    expect(funil.etapas[1].volume).toBe(800);
    expect(funil.etapas[1].taxaConversao).toBe(4.0); // 800 / 20000 = 4%

    // 3. Visitas ao Cardápio
    expect(funil.etapas[2].nome).toBe('Pessoas que abriram o cardápio');
    expect(funil.etapas[2].volume).toBeGreaterThan(0);

    // 4. Adições ao Carrinho
    expect(funil.etapas[3].nome).toBe('Pessoas que escolheram produtos');
    expect(funil.etapas[3].volume).toBeGreaterThan(0);

    // 5. Pedidos Concluídos
    expect(funil.etapas[4].nome).toBe('Pessoas que compraram');
    expect(funil.etapas[4].volume).toBeGreaterThan(0);

    expect(funil.gargaloIdentificado).toBeDefined();
  });

  it('deve permitir seleção de filtros temporais da Seção 59 e análise comparativa (Seção 60)', async () => {
    const service = new ExecutiveDashboardService();

    const periodosValidos = ['today', 'yesterday', 'last_7d', 'last_14d', 'last_30d', 'this_month'];
    for (const periodo of periodosValidos) {
      const res = await service.getExecutiveOverview(empresaId, periodo);
      expect(res.periodoSelecionado).toBe(periodo);
      expect(res.comparativo).toBeDefined();
    }
  });

  it('deve listar as campanhas mais lucrativas em linguagem de negócio (PDF Seção 58 e 89)', async () => {
    const service = new ExecutiveDashboardService();
    const data = await service.getExecutiveOverview(empresaId, 'last_7d');

    expect(data.campanhasMaisVendidas.length).toBeGreaterThan(0);
    const top = data.campanhasMaisVendidas[0];
    expect(top.nome).toBe('Campanha Pizza no Fim de Semana');
    expect(top.pedidos).toBeGreaterThan(0);
    expect(top.retornoSobreInvestimento).toBeGreaterThan(0);
    expect(top.custoPorPedido).toBeGreaterThan(0);
  });
});
