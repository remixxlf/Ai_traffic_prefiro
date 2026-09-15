import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { aiAssistantService } from '../src/lib/services/ai-assistant-service';
import { campaignWizardService } from '../src/lib/services/campaign-wizard-service';
import { catalogCampaignService } from '../src/lib/services/catalog-campaign-service';
import { policyEngineService } from '../src/lib/services/policy-engine-service';

describe('Task 20: Chat IA com Comandos em Linguagem Natural, Alertas, Relatórios & Homologação E2E (PDF Seções 47, 48, 49, 50, 51, 61, 67, 90, 95)', () => {
  let testEmpresaId: string;
  let testCampanhaId: string;
  let testProdutoId: string;

  beforeAll(async () => {
    // Cria empresa com memória do negócio completa
    const empresa = await db.empresa.create({
      data: {
        nome: 'Burger & Pizza House MVP E2E',
        slug_prefiro: `e2e-mvp-${Date.now()}`,
        segmento: 'Hamburgueria e Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        ticket_medio: 65.0,
        raio_atendimento: 8.0,
        produto_mais_vendido: 'Burger Especial Duplo',
        produtos_chave: JSON.stringify(['Burger Especial Duplo', 'Pizza Calabresa Família']),
        modo_operacao: 'ASSISTIDO',
        orcamento_max_diario: 500.0,
        integracoes_meta: {
          create: {
            access_token: 'EAAB_test_e2e_token',
            status: 'CONECTADO'
          }
        },
        meta_ad_accounts: {
          create: {
            meta_account_id: 'act_e2e_123',
            name: 'Conta Anúncios E2E',
            status: 'ACTIVE'
          }
        },
        meta_catalogos: {
          create: {
            meta_catalog_id: 'cat_e2e_123',
            name: 'Catálogo E2E',
            status: 'SINCRONIZADO'
          }
        }
      },
      include: {
        meta_catalogos: true
      }
    });
    testEmpresaId = empresa.id;

    // Cria produto no catálogo
    const prod = await db.metaProduto.create({
      data: {
        empresa_id: testEmpresaId,
        catalogo_id: empresa.meta_catalogos[0].id,
        external_id: `prod_e2e_${Date.now()}`,
        nome: 'Burger Especial Duplo Bacon',
        preco: 49.90,
        preco_promocional: 42.90,
        categoria: 'Hambúrgueres',
        disponibilidade: true,
        status: 'ATIVO',
        url_imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
      }
    });
    testProdutoId = prod.id;

    // Cria campanha com métricas para os testes de chat e relatório
    const camp = await db.campanha.create({
      data: {
        empresa_id: testEmpresaId,
        meta_campaign_id: `cmp_e2e_${Date.now()}`,
        nome: 'Campanha Burger Sexta-Feira',
        objetivo: 'OUTCOME_SALES',
        status: 'ACTIVE',
        orcamento_diario: 100.0,
        conjuntos: {
          create: {
            empresa_id: testEmpresaId,
            meta_adset_id: `adset_e2e_${Date.now()}`,
            nome: 'Conjunto Feira de Santana',
            status: 'ACTIVE',
            orcamento_diario: 100.0,
            anuncios: {
              create: {
                empresa_id: testEmpresaId,
                meta_ad_id: `ad_e2e_${Date.now()}`,
                nome: 'Anúncio Burger Bacon',
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });
    testCampanhaId = camp.id;

    // Insere métricas de ontem e da semana
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    await db.campanhaMetrica.create({
      data: {
        campanha_id: testCampanhaId,
        data: ontem,
        investimento: 340.0,
        impressoes: 12500,
        cliques: 480,
        ctr: 3.84,
        cpc: 0.70,
        cpm: 27.20,
        conversoes: 42,
        vendas: 42,
        receita: 2480.0,
        receita_real: 2480.0,
        pedidos_reais: 42,
        roas_real: 7.29,
        cpa_real: 8.09,
        cpa: 8.09,
        roas: 7.29
      }
    });
  });

  afterAll(async () => {
    if (testEmpresaId) {
      await db.alerta.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.auditoria.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.aprovacao.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.recomendacaoIa.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.campanhaMetrica.deleteMany();
      await db.anuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.conjuntoAnuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.campanha.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaProduto.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaCatalogo.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaAdAccount.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.integracaoMeta.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.empresa.delete({ where: { id: testEmpresaId } });
    }
  });

  it('1. Deve responder perguntas do lojista com IA atuando como Analista de Negócios (PDF Seções 47 e 49)', async () => {
    const resposta = await aiAssistantService.processarChat({
      empresaId: testEmpresaId,
      mensagem: 'Como estão minhas campanhas e onde estou vendendo mais?'
    });

    expect(resposta).toBeDefined();
    expect(resposta.texto).toBeDefined();
    expect(resposta.texto.length).toBeGreaterThan(20);
    expect(resposta.texto.toLowerCase()).toMatch(/(campanha|venda|roas|burger|pizza)/i);
  });

  it('2. Deve interpretar comandos em linguagem natural e montar sugestão estruturada (PDF Seção 48)', async () => {
    const comando = 'Quero investir R$ 3.000 este mês para vender mais hambúrguer';
    const interpretacao = await aiAssistantService.interpretarComandoNatural(testEmpresaId, comando);

    expect(interpretacao).toBeDefined();
    expect(interpretacao.tipo).toBe('CRIAR_CAMPANHA');
    expect(interpretacao.orcamentoDiario).toBe(100.0); // R$ 3000 / 30 dias = R$ 100/dia
    expect(interpretacao.produtoFoco.toLowerCase()).toContain('hambúrguer');
    expect(interpretacao.estrategia).toBeDefined();
    expect(interpretacao.publico).toBeDefined();
  });

  it('3. Deve gerar o Relatório Diário "Resumo de Ontem" com métricas de negócio (PDF Seção 50)', async () => {
    const relatorio = await aiAssistantService.gerarRelatorioDiario(testEmpresaId);

    expect(relatorio).toBeDefined();
    expect(relatorio.investido).toBe(340.0);
    expect(relatorio.receita).toBe(2480.0);
    expect(relatorio.pedidos).toBe(42);
    expect(relatorio.roas).toBeCloseTo(7.29, 1);
    expect(relatorio.custoPorPedido).toBeCloseTo(8.09, 1);
    expect(relatorio.destaque).toBeDefined();
    expect(relatorio.pontoAtencao).toBeDefined();
  });

  it('4. Deve gerar o Relatório Semanal Consolidado (PDF Seção 51)', async () => {
    const relatorioSemanal = await aiAssistantService.gerarRelatorioSemanal(testEmpresaId);

    expect(relatorioSemanal).toBeDefined();
    expect(relatorioSemanal.resumo).toBeDefined();
    expect(relatorioSemanal.melhoresCampanhas).toBeInstanceOf(Array);
    expect(relatorioSemanal.oportunidades).toBeInstanceOf(Array);
  });

  it('5. Deve gerenciar a Central de Alertas da conta (PDF Seção 61 e 67)', async () => {
    // 5.1 Emite alerta
    const alertaCriado = await aiAssistantService.criarAlerta({
      empresaId: testEmpresaId,
      tipo: 'QUEDA_ROAS',
      titulo: 'Queda de ROAS detectada no final de semana',
      mensagem: 'ROAS caiu temporariamente de 7,2x para 4,1x devido a chuva intensa na região.',
      nivel: 'ATENCAO'
    });

    expect(alertaCriado.id).toBeDefined();
    expect(alertaCriado.lido).toBe(false);

    // 5.2 Lista alertas
    const alertas = await aiAssistantService.listarAlertas(testEmpresaId);
    expect(alertas.length).toBeGreaterThanOrEqual(1);

    // 5.3 Marca como lido
    const atualizado = await aiAssistantService.marcarAlertaLido(alertaCriado.id);
    expect(atualizado.lido).toBe(true);
  });

  it('6. HOMOLOGAÇÃO E2E DO MVP: Validação Completa dos 5 Pilares do Sistema (PDF Seção 95)', async () => {
    // Pilar 1: Conectar (Verifica credenciais e conexões ativas)
    const empresa = await db.empresa.findUnique({
      where: { id: testEmpresaId },
      include: { integracoes_meta: true, meta_catalogos: true }
    });
    expect(empresa?.integracoes_meta[0].status).toBe('CONECTADO');
    expect(empresa?.meta_catalogos[0].status).toBe('SINCRONIZADO');

    // Pilar 2: Entender (Memória do Negócio presente)
    expect(empresa?.ticket_medio).toBe(65.0);
    expect(empresa?.cidade).toBe('Feira de Santana');

    // Pilar 3: Criar (Wizard de Campanha de Vendas)
    const campWizard = await campaignWizardService.criarCampanhaCompleta(testEmpresaId, {
      nomeCampanha: 'Campanha E2E Pilares',
      produtoNome: 'Combo E2E Burger',
      orcamentoDiario: 60.0,
      cidade: 'Feira de Santana',
      raioKm: 8,
      criativo: {
        titulo: 'Sabor E2E Incomparável',
        textoPrincipal: 'Peça online agora mesmo com entrega rápida!',
        cta: 'ORDER_NOW'
      }
    });
    expect(campWizard.success).toBe(true);
    expect(campWizard.campanhaId).toBeDefined();

    // Pilar 4: Anunciar Catálogo (Lançamento rápido a partir do produto do cardápio)
    const campCatalogo = await catalogCampaignService.anunciarProduto({
      empresaId: testEmpresaId,
      produtoId: testProdutoId,
      orcamentoDiario: 40.0
    });
    expect(campCatalogo.success).toBe(true);

    // Pilar 5: Melhorar & Guardrails (Policy Engine e IA)
    const avaliacaoPolicy = await policyEngineService.avaliarAcao({
      empresaId: testEmpresaId,
      tipoAcao: 'AUMENTAR_ORCAMENTO',
      entidadeTipo: 'CAMPANHA',
      entidadeId: campWizard.campanhaId,
      valorProposto: 70.0, // +16.6% <= 20%
      motivo: 'Otimização com excelente conversão'
    });
    expect(avaliacaoPolicy.permitido).toBe(true);
  });
});
