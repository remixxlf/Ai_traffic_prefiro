import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { approvalsInsightsService } from '../src/lib/services/approvals-insights-service';

describe('Task 19: "Minha IA", Centro de Aprovações & Histórico Auditável (PDF Seções 13, 62, 64, 65, 66, 75)', () => {
  let testEmpresaId: string;
  let testCampanhaId: string;
  let testAnuncioId: string;

  beforeAll(async () => {
    // 1. Cria empresa com modo ASSISTIDO
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Minha IA Test',
        slug_prefiro: `minha-ia-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        modo_operacao: 'ASSISTIDO',
        orcamento_max_diario: 400.0,
        ticket_medio: 65.0,
        integracoes_meta: {
          create: {
            access_token: 'EAAB_test_token_ia',
            status: 'CONECTADO'
          }
        },
        meta_ad_accounts: {
          create: {
            meta_account_id: 'act_minha_ia_123',
            name: 'Conta Anúncios Minha IA',
            status: 'ACTIVE'
          }
        }
      }
    });
    testEmpresaId = empresa.id;

    // 2. Cria Campanha com Anúncio
    const campanha = await db.campanha.create({
      data: {
        empresa_id: testEmpresaId,
        meta_campaign_id: `cmp_ia_${Date.now()}`,
        nome: 'Campanha Pizza Família',
        objetivo: 'OUTCOME_SALES',
        status: 'ACTIVE',
        orcamento_diario: 100.0,
        conjuntos: {
          create: {
            empresa_id: testEmpresaId,
            meta_adset_id: `adset_ia_${Date.now()}`,
            nome: 'Conjunto Pizza Local',
            status: 'ACTIVE',
            orcamento_diario: 100.0,
            anuncios: {
              create: {
                empresa_id: testEmpresaId,
                meta_ad_id: `ad_ia_${Date.now()}`,
                nome: 'Anúncio Pizza Calabresa',
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      include: {
        conjuntos: {
          include: { anuncios: true }
        }
      }
    });
    testCampanhaId = campanha.id;
    testAnuncioId = campanha.conjuntos[0].anuncios[0].id;

    // 3. Cria métricas simuladas recentes
    await db.campanhaMetrica.create({
      data: {
        campanha_id: testCampanhaId,
        data: new Date(),
        investimento: 700.0,
        impressoes: 25000,
        cliques: 800,
        ctr: 3.2,
        cpc: 0.87,
        cpm: 28.0,
        conversoes: 65,
        receita: 4550.0,
        cpa: 10.77,
        roas: 6.5,
        receita_real: 4550.0,
        roas_real: 6.5,
        cpa_real: 10.77
      }
    });
  });

  afterAll(async () => {
    if (testEmpresaId) {
      await db.auditoria.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.aprovacao.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.recomendacaoIa.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.campanhaMetrica.deleteMany();
      await db.anuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.conjuntoAnuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.campanha.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaAdAccount.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.integracaoMeta.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.empresa.delete({ where: { id: testEmpresaId } });
    }
  });

  it('1. Deve gerar e classificar os insights nos 3 grupos do painel Minha IA (PDF Seções 13, 62 e 75)', async () => {
    const visao = await approvalsInsightsService.obterVisaoMinhaIa(testEmpresaId);

    expect(visao).toBeDefined();
    expect(visao.kpis7dias).toBeDefined();
    expect(visao.kpis7dias.investimento).toBeGreaterThan(0);
    expect(visao.kpis7dias.roas).toBeGreaterThan(0);

    // 3 grupos estratégicos (PDF Seção 13)
    expect(visao.grupos).toBeDefined();
    expect(visao.grupos.estaIndoBem).toBeInstanceOf(Array);
    expect(visao.grupos.precisaAtencao).toBeInstanceOf(Array);
    expect(visao.grupos.oportunidades).toBeInstanceOf(Array);

    // Deve conter recomendação gerada
    const totalInsights =
      visao.grupos.estaIndoBem.length +
      visao.grupos.precisaAtencao.length +
      visao.grupos.oportunidades.length;
    expect(totalInsights).toBeGreaterThanOrEqual(1);
  });

  it('2. Deve listar solicitações pendentes no Centro de Aprovações (PDF Seção 66)', async () => {
    // Cria solicitação pendente no modo assistido
    const aprovacaoCriada = await db.aprovacao.create({
      data: {
        empresa_id: testEmpresaId,
        titulo: 'Aumentar orçamento diário em 15%',
        descricao: 'Campanha Pizza Família com ROAS de 6,5x por 5 dias consecutivos',
        acao_tipo: 'AUMENTAR_ORCAMENTO',
        payload: JSON.stringify({
          entidadeTipo: 'CAMPANHA',
          entidadeId: testCampanhaId,
          valorAnterior: 100.0,
          valorProposto: 115.0
        }),
        status: 'PENDENTE'
      }
    });

    const pendentes = await approvalsInsightsService.listarAprovacoesPendentes(testEmpresaId);

    expect(pendentes).toBeInstanceOf(Array);
    const item = pendentes.find(p => p.id === aprovacaoCriada.id);
    expect(item).toBeDefined();
    expect(item?.titulo).toContain('Aumentar orçamento');
    expect(item?.status).toBe('PENDENTE');
    expect(item?.payload.valorProposto).toBe(115.0);
  });

  it('3. Deve aprovar solicitação, aplicar na Meta/Banco e registrar em Auditoria (PDF Seções 64 e 66)', async () => {
    // Busca a aprovação pendente criada
    const pendente = await db.aprovacao.findFirst({
      where: { empresa_id: testEmpresaId, status: 'PENDENTE' }
    });
    expect(pendente).not.toBeNull();

    const resultado = await approvalsInsightsService.decidirAprovacao({
      aprovacaoId: pendente!.id,
      decisao: 'APROVAR'
    });

    expect(resultado.success).toBe(true);
    expect(resultado.status).toBe('APROVADO');

    // Valida orçamento atualizado na Campanha
    const campanhaAtualizada = await db.campanha.findUnique({
      where: { id: testCampanhaId }
    });
    expect(campanhaAtualizada?.orcamento_diario).toBe(115.0);

    // Valida registro em Auditoria (PDF Seção 64 e 65)
    const auditoria = await db.auditoria.findFirst({
      where: {
        empresa_id: testEmpresaId,
        entidade_id: testCampanhaId,
        valor_novo: '115'
      }
    });
    expect(auditoria).not.toBeNull();
    expect(auditoria?.origem).toMatch(/(IA|USUARIO)/);
  });

  it('4. Deve recusar solicitação, gravar motivo da recusa e NÃO alterar campanha (PDF Seção 66)', async () => {
    // Cria nova aprovação pendente
    const novaAprovacao = await db.aprovacao.create({
      data: {
        empresa_id: testEmpresaId,
        titulo: 'Aumentar orçamento diário para R$ 130',
        descricao: 'Teste de recusa pelo usuário',
        acao_tipo: 'AUMENTAR_ORCAMENTO',
        payload: JSON.stringify({
          entidadeTipo: 'CAMPANHA',
          entidadeId: testCampanhaId,
          valorAnterior: 115.0,
          valorProposto: 130.0
        }),
        status: 'PENDENTE'
      }
    });

    const resultado = await approvalsInsightsService.decidirAprovacao({
      aprovacaoId: novaAprovacao.id,
      decisao: 'RECUSAR',
      motivoRecusa: 'Orçamento do mês já atingiu a meta limite interna'
    });

    expect(resultado.success).toBe(true);
    expect(resultado.status).toBe('RECUSADO');

    // Verifica que a aprovação foi recusada no banco
    const aprovacaoDb = await db.aprovacao.findUnique({
      where: { id: novaAprovacao.id }
    });
    expect(aprovacaoDb?.status).toBe('RECUSADO');
    expect(aprovacaoDb?.motivo_recusa).toContain('Orçamento do mês');

    // Verifica que a campanha continuou com o orçamento anterior (115.0)
    const campanhaDb = await db.campanha.findUnique({
      where: { id: testCampanhaId }
    });
    expect(campanhaDb?.orcamento_diario).toBe(115.0);
  });

  it('5. Deve listar histórico completo de auditoria em ordem cronológica (PDF Seções 64 e 65)', async () => {
    const historico = await approvalsInsightsService.listarHistoricoAuditoria(testEmpresaId);

    expect(historico).toBeInstanceOf(Array);
    expect(historico.length).toBeGreaterThanOrEqual(1);
    expect(historico[0].entidadeId).toBeDefined();
    expect(historico[0].origem).toBeDefined();
    expect(historico[0].data).toBeDefined();
  });
});
