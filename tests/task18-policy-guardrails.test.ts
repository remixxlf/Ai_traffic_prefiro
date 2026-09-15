import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { policyEngineService } from '../src/lib/services/policy-engine-service';

describe('Task 18: Policy Engine, Guardrails de Segurança & Níveis de Automação (PDF Seções 41, 42, 43, 44, 76, 77)', () => {
  let testEmpresaId: string;
  let testCampanhaId: string;
  let testConjuntoId: string;
  let testAnuncioId: string;

  beforeAll(async () => {
    // 1. Cria empresa com modo de operação ASSISTIDO e teto diário de R$ 300,00
    const empresa = await db.empresa.create({
      data: {
        nome: 'Restaurante Guardrails Test',
        slug_prefiro: `guardrails-test-${Date.now()}`,
        segmento: 'Hamburgueria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        modo_operacao: 'ASSISTIDO',
        orcamento_max_diario: 300.0,
        integracoes_meta: {
          create: {
            access_token: 'EAAB_test_policy_token',
            status: 'CONECTADO'
          }
        },
        meta_ad_accounts: {
          create: {
            meta_account_id: 'act_policy_123',
            name: 'Conta Policy Engine',
            status: 'ACTIVE'
          }
        }
      }
    });
    testEmpresaId = empresa.id;

    // 2. Cria campanha ativa com R$ 100/dia
    const campanha = await db.campanha.create({
      data: {
        empresa_id: testEmpresaId,
        meta_campaign_id: `cmp_policy_${Date.now()}`,
        nome: 'Campanha Teste Guardrails',
        objetivo: 'OUTCOME_SALES',
        status: 'ACTIVE',
        orcamento_diario: 100.0,
        conjuntos: {
          create: {
            empresa_id: testEmpresaId,
            meta_adset_id: `adset_policy_${Date.now()}`,
            nome: 'Conjunto Teste Guardrails',
            status: 'ACTIVE',
            orcamento_diario: 100.0,
            anuncios: {
              create: {
                empresa_id: testEmpresaId,
                meta_ad_id: `ad_policy_${Date.now()}`,
                nome: 'Anúncio Teste Guardrails',
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
    testConjuntoId = campanha.conjuntos[0].id;
    testAnuncioId = campanha.conjuntos[0].anuncios[0].id;

    // 3. Cadastra Regra Determinística (PDF Seção 44)
    await db.automacao.create({
      data: {
        empresa_id: testEmpresaId,
        nome: 'Proteção de CPA Alto (Pausar Anúncio)',
        ativa: true,
        condicao: JSON.stringify({ cpa_gt: 30.0, investimento_gt: 150.0 }),
        acao: JSON.stringify({ tipo: 'PAUSAR_ANUNCIO' })
      }
    });
  });

  afterAll(async () => {
    if (testEmpresaId) {
      await db.automacaoExecucao.deleteMany();
      await db.automacao.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.aprovacao.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.auditoria.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.anuncioMetrica.deleteMany();
      await db.anuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.conjuntoAnuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.campanha.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaAdAccount.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.integracaoMeta.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.empresa.delete({ where: { id: testEmpresaId } });
    }
  });

  it('1. Deve bloquear tentativa de aumento de orçamento superior a 20% por ação (PDF Seções 43 e 76)', async () => {
    // Orçamento atual: R$ 100. Proposta: R$ 130 (+30% > 20% permitido)
    const resultado = await policyEngineService.avaliarAcao({
      empresaId: testEmpresaId,
      tipoAcao: 'AUMENTAR_ORCAMENTO',
      entidadeTipo: 'CAMPANHA',
      entidadeId: testCampanhaId,
      valorProposto: 130.0,
      motivo: 'IA identificou bom ROAS e sugere escala agressiva'
    });

    expect(resultado.permitido).toBe(false);
    expect(resultado.status).toBe('BLOQUEADO');
    expect(resultado.motivoBloqueio).toMatch(/20%/);
  });

  it('2. Deve bloquear aumento que exceda o teto orçamentário diário da empresa (PDF Seção 43)', async () => {
    // Teto diário da empresa: R$ 300. Tentativa de fixar R$ 350.
    const resultado = await policyEngineService.avaliarAcao({
      empresaId: testEmpresaId,
      tipoAcao: 'AUMENTAR_ORCAMENTO',
      entidadeTipo: 'CAMPANHA',
      entidadeId: testCampanhaId,
      valorProposto: 350.0,
      motivo: 'Tentativa de ultrapassar teto global'
    });

    expect(resultado.permitido).toBe(false);
    expect(resultado.status).toBe('BLOQUEADO');
    expect(resultado.motivoBloqueio).toMatch(/teto/i);
  });

  it('3. Em modo ASSISTIDO, deve encaminhar ação válida para o Centro de Aprovações como PENDENTE (PDF Seções 41 e 66)', async () => {
    // Orçamento atual: R$ 100. Proposta: R$ 115 (+15% <= 20% e <= R$ 300 teto)
    const resultado = await policyEngineService.avaliarAcao({
      empresaId: testEmpresaId,
      tipoAcao: 'AUMENTAR_ORCAMENTO',
      entidadeTipo: 'CAMPANHA',
      entidadeId: testCampanhaId,
      valorProposto: 115.0,
      motivo: 'Aumento seguro de 15% para horário de pico'
    });

    expect(resultado.permitido).toBe(true);
    expect(resultado.status).toBe('PENDENTE_APROVACAO');
    expect(resultado.aprovacaoId).toBeDefined();

    // Valida registro na tabela Aprovacao
    const aprovacao = await db.aprovacao.findUnique({
      where: { id: resultado.aprovacaoId }
    });
    expect(aprovacao).not.toBeNull();
    expect(aprovacao?.status).toBe('PENDENTE');
    expect(aprovacao?.acao_tipo).toBe('AUMENTAR_ORCAMENTO');
  });

  it('4. Em modo AUTOMATICO, deve executar alteração válida diretamente e registrar em Auditoria (PDF Seções 41 e 65)', async () => {
    // Atualiza empresa para modo AUTOMATICO
    await policyEngineService.atualizarModoOperacao(testEmpresaId, 'AUTOMATICO', 400.0);

    // Orçamento atual: R$ 100. Proposta: R$ 118 (+18% <= 20%)
    const resultado = await policyEngineService.avaliarAcao({
      empresaId: testEmpresaId,
      tipoAcao: 'AUMENTAR_ORCAMENTO',
      entidadeTipo: 'CAMPANHA',
      entidadeId: testCampanhaId,
      valorProposto: 118.0,
      motivo: 'Otimização autônoma de orçamento em janela favorável'
    });

    expect(resultado.permitido).toBe(true);
    expect(resultado.status).toBe('EXECUTADO');

    // Valida atualização no banco
    const campanhaAtualizada = await db.campanha.findUnique({
      where: { id: testCampanhaId }
    });
    expect(campanhaAtualizada?.orcamento_diario).toBe(118.0);

    // Valida registro auditável na tabela Auditoria
    const auditoria = await db.auditoria.findFirst({
      where: {
        empresa_id: testEmpresaId,
        origem: 'AUTOMACAO',
        entidade_id: testCampanhaId
      },
      orderBy: { created_at: 'desc' }
    });
    expect(auditoria).not.toBeNull();
    expect(auditoria?.valor_novo).toBe('118');
  });

  it('5. Deve avaliar e disparar regra determinística: Se CPA > R$ 30 e gasto > R$ 150 -> Pausar Anúncio (PDF Seção 44)', async () => {
    // Insere métrica crítica no anúncio: gasto R$ 180, CPA R$ 38 (> R$ 30)
    await db.anuncioMetrica.create({
      data: {
        anuncio_id: testAnuncioId,
        data: new Date(),
        investimento: 180.0,
        impressoes: 5000,
        cliques: 120,
        cpa: 45.0, // 180 / 4 = 45 > 30
        roas: 1.2
      }
    });

    const execucoes = await policyEngineService.avaliarRegrasDeterministicas(testEmpresaId);

    expect(execucoes).toBeInstanceOf(Array);
    expect(execucoes.length).toBeGreaterThanOrEqual(1);
    expect(execucoes[0].acaoExecutada).toBe('PAUSAR_ANUNCIO');

    // Verifica que o anúncio foi pausado
    const anuncio = await db.anuncio.findUnique({
      where: { id: testAnuncioId }
    });
    expect(anuncio?.status).toBe('PAUSED');
  });
});
