import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { campaignWizardService } from '../src/lib/services/campaign-wizard-service';

describe('Task 16: Wizard Guiado de Criação de Campanhas de Vendas (PDF Seções 2, 5, 14, 15, 16, 18, 19, 20)', () => {
  let testEmpresaId: string;

  beforeAll(async () => {
    const testEmpresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Campanha Teste',
        slug_prefiro: `pizzaria-wizard-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        ticket_medio: 65.0,
        raio_atendimento: 8.0,
        produto_mais_vendido: 'Combo Família Especial',
        produtos_chave: JSON.stringify(['Pizza Calabresa', 'Pizza Margherita', 'Combo Família']),
        publico_alvo: 'Famílias e jovens apreciadores de pizza artesanal',
        dias_fortes: 'quinta, sexta, sábado, domingo',
        horario_forte_inicio: '18:30',
        horario_forte_fim: '23:00',
        integracoes_meta: {
          create: {
            access_token: 'EAAB_test_wizard_token',
            status: 'CONECTADO'
          }
        },
        meta_ad_accounts: {
          create: {
            meta_account_id: 'act_wizard_12345',
            name: 'Conta Anúncios Wizard Test',
            status: 'ACTIVE'
          }
        }
      }
    });
    testEmpresaId = testEmpresa.id;
  });

  afterAll(async () => {
    if (testEmpresaId) {
      await db.anuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.conjuntoAnuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.campanha.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.criativo.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaAdAccount.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.integracaoMeta.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.empresa.delete({ where: { id: testEmpresaId } });
    }
  });

  it('1. Deve recomendar orçamento diário inteligente com base na memória do negócio (PDF Seção 18 e 19)', async () => {
    const recomendacao = await campaignWizardService.recomendarOrcamento(testEmpresaId);

    expect(recomendacao).toBeDefined();
    expect(recomendacao.orcamentoDiarioRecomendado).toBeGreaterThanOrEqual(40);
    expect(recomendacao.orcamentoDiarioRecomendado).toBeLessThanOrEqual(200);
    expect(recomendacao.justificativa).toContain('Feira de Santana');
    expect(recomendacao.justificativa).toContain('65');
    expect(recomendacao.opcoesRapidas).toBeInstanceOf(Array);
    expect(recomendacao.opcoesRapidas.length).toBeGreaterThanOrEqual(3);
  });

  it('2. Deve interpretar intenção escrita livremente pelo usuário via IA (PDF Seção 15)', async () => {
    const prompt = 'Quero vender mais pizzas no fim de semana aproveitando o combo família';
    const interpretacao = await campaignWizardService.interpretarIntencao(testEmpresaId, prompt);

    expect(interpretacao).toBeDefined();
    expect(interpretacao.produtoFoco.toLowerCase()).toMatch(/(pizza|combo)/i);
    expect(interpretacao.objetivoNegocio).toBeDefined();
    expect(interpretacao.sugestaoGancho).toBeDefined();
    expect(interpretacao.sugestaoPublico).toBeDefined();
  });

  it('3. Deve criar estrutura completa na Meta (Campanha -> Conjunto -> Anúncio) e persistir no banco (PDF Seção 20)', async () => {
    const resultado = await campaignWizardService.criarCampanhaCompleta(testEmpresaId, {
      nomeCampanha: 'Campanha Fim de Semana - Pizza Família',
      produtoNome: 'Combo Família Especial',
      orcamentoDiario: 80.0,
      tipoOrcamento: 'DAILY',
      cidade: 'Feira de Santana',
      raioKm: 8,
      urlDestino: 'https://prefirodelivery.com/pizzaria-teste/combo-familia',
      criativo: {
        titulo: 'Fim de Semana com Pizza Especial em Casa',
        textoPrincipal: 'Peça hoje o Combo Família com borda recheada grátis e receba em menos de 35 minutos quentinha na sua porta!',
        descricao: 'Borda grátis hoje',
        cta: 'ORDER_NOW',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        focoEstrategia: 'BENEFICIO'
      }
    });

    expect(resultado.success).toBe(true);
    expect(resultado.campanhaId).toBeDefined();
    expect(resultado.metaCampaignId).toBeDefined();
    expect(resultado.metaAdSetId).toBeDefined();
    expect(resultado.metaAdId).toBeDefined();

    // Valida persistência no banco
    const dbCampanha = await db.campanha.findUnique({
      where: { id: resultado.campanhaId },
      include: {
        conjuntos: {
          include: {
            anuncios: {
              include: { criativo: true }
            }
          }
        }
      }
    });

    expect(dbCampanha).not.toBeNull();
    expect(dbCampanha?.empresa_id).toBe(testEmpresaId);
    expect(dbCampanha?.objetivo).toBe('OUTCOME_SALES');
    expect(dbCampanha?.orcamento_diario).toBe(80.0);
    expect(dbCampanha?.conjuntos.length).toBe(1);
    expect(dbCampanha?.conjuntos[0].publico_alvo_desc).toContain('Feira de Santana');
    expect(dbCampanha?.conjuntos[0].anuncios.length).toBe(1);
    expect(dbCampanha?.conjuntos[0].anuncios[0].criativo).not.toBeNull();
  });

  it('4. Deve validar regras de segurança e rejeitar orçamentos abaixo do limite mínimo (PDF Seção 18 e 43)', async () => {
    await expect(
      campaignWizardService.criarCampanhaCompleta(testEmpresaId, {
        nomeCampanha: 'Campanha Inválida',
        produtoNome: 'Item',
        orcamentoDiario: 5.0, // Abaixo do mínimo de R$ 10,00
        tipoOrcamento: 'DAILY',
        cidade: 'Feira de Santana',
        raioKm: 5,
        urlDestino: 'https://prefirodelivery.com/pizzaria-teste',
        criativo: {
          titulo: 'Inválido',
          textoPrincipal: 'Texto',
          cta: 'ORDER_NOW'
        }
      })
    ).rejects.toThrow(/mínimo/i);
  });

  it('5. Deve listar todas as campanhas da empresa com detalhes para visualização (PDF Seção 58)', async () => {
    const campanhas = await campaignWizardService.listarCampanhas(testEmpresaId);

    expect(campanhas).toBeInstanceOf(Array);
    expect(campanhas.length).toBeGreaterThanOrEqual(1);
    expect(campanhas[0].nome).toBe('Campanha Fim de Semana - Pizza Família');
    expect(campanhas[0].conjuntosCount).toBe(1);
    expect(campanhas[0].anunciosCount).toBe(1);
  });
});
