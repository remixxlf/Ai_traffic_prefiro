import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { catalogCampaignService } from '../src/lib/services/catalog-campaign-service';

describe('Task 17: Experiência de Campanhas de Catálogo Dinâmico do Prefiro (PDF Seções 33, 34, 83, 84, 85)', () => {
  let testEmpresaId: string;
  let testProdutoPizzaId: string;
  let testProdutoBurgerId: string;

  beforeAll(async () => {
    // 1. Cria empresa com integração Meta
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria & Hamburgueria Catálogo Test',
        slug_prefiro: `catalogo-test-${Date.now()}`,
        segmento: 'Pizzaria & Hamburgueria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        raio_atendimento: 8.0,
        ticket_medio: 70.0,
        integracoes_meta: {
          create: {
            access_token: 'EAAB_test_catalog_token',
            status: 'CONECTADO'
          }
        },
        meta_ad_accounts: {
          create: {
            meta_account_id: 'act_catalog_123',
            name: 'Conta Anúncios Catálogo',
            status: 'ACTIVE'
          }
        },
        meta_catalogos: {
          create: {
            meta_catalog_id: 'cat_meta_123',
            name: 'Catálogo Prefiro Delivery Test',
            status: 'SINCRONIZADO',
            total_products: 2,
            active_products: 2
          }
        }
      },
      include: {
        meta_catalogos: true
      }
    });
    testEmpresaId = empresa.id;
    const catalogoId = empresa.meta_catalogos[0].id;

    // 2. Cria produtos no catálogo local
    const p1 = await db.metaProduto.create({
      data: {
        empresa_id: testEmpresaId,
        catalogo_id: catalogoId,
        external_id: `prod_pizza_${Date.now()}`,
        nome: 'Pizza Calabresa Especial Família',
        descricao: 'Calabresa fatiada com cebola roxa e queijo derretido',
        preco: 79.90,
        preco_promocional: 69.90,
        categoria: 'Pizzas',
        disponibilidade: true,
        status: 'ATIVO',
        url_imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591'
      }
    });
    testProdutoPizzaId = p1.id;

    const p2 = await db.metaProduto.create({
      data: {
        empresa_id: testEmpresaId,
        catalogo_id: catalogoId,
        external_id: `prod_burger_${Date.now()}`,
        nome: 'Hambúrguer Artesanal Duplo Bacon',
        descricao: 'Dois blends de 150g com bacon crocante e queijo cheddar',
        preco: 45.00,
        preco_promocional: 39.90,
        categoria: 'Hambúrgueres',
        disponibilidade: true,
        status: 'ATIVO',
        url_imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
      }
    });
    testProdutoBurgerId = p2.id;
  });

  afterAll(async () => {
    if (testEmpresaId) {
      await db.anuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.conjuntoAnuncio.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.campanha.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.criativo.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaProduto.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaCatalogo.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.metaAdAccount.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.integracaoMeta.deleteMany({ where: { empresa_id: testEmpresaId } });
      await db.empresa.delete({ where: { id: testEmpresaId } });
    }
  });

  it('1. Deve criar campanha de anúncio rápido a partir de produto individual (PDF Seção 83)', async () => {
    const resultado = await catalogCampaignService.anunciarProduto({
      empresaId: testEmpresaId,
      produtoId: testProdutoPizzaId,
      orcamentoDiario: 50.0
    });

    expect(resultado.success).toBe(true);
    expect(resultado.campanhaId).toBeDefined();
    expect(resultado.metaCampaignId).toBeDefined();

    // Valida no banco
    const campanha = await db.campanha.findUnique({
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

    expect(campanha).not.toBeNull();
    expect(campanha?.tipo_anuncio).toBe('CATALOGO_PRODUTO');
    expect(campanha?.nome).toContain('Pizza Calabresa Especial');
    expect(campanha?.orcamento_diario).toBe(50.0);
    expect(campanha?.conjuntos[0].anuncios[0].criativo?.url_midia).toContain('unsplash');
    expect(campanha?.conjuntos[0].anuncios[0].criativo?.titulo).toContain('Pizza Calabresa Especial');
  });

  it('2. Deve criar campanha de catálogo por categoria de produtos (PDF Seção 84)', async () => {
    const resultado = await catalogCampaignService.anunciarCategoria({
      empresaId: testEmpresaId,
      categoria: 'Hambúrgueres',
      orcamentoDiario: 40.0
    });

    expect(resultado.success).toBe(true);
    expect(resultado.campanhaId).toBeDefined();

    const campanha = await db.campanha.findUnique({
      where: { id: resultado.campanhaId }
    });

    expect(campanha?.tipo_anuncio).toBe('CATALOGO_CATEGORIA');
    expect(campanha?.nome).toContain('Hambúrgueres');
    expect(campanha?.orcamento_diario).toBe(40.0);
  });

  it('3. Deve criar campanha para todo o cardápio sincronizado (PDF Seção 85)', async () => {
    const resultado = await catalogCampaignService.anunciarTodoCardapio({
      empresaId: testEmpresaId,
      orcamentoDiario: 60.0
    });

    expect(resultado.success).toBe(true);
    expect(resultado.campanhaId).toBeDefined();

    const campanha = await db.campanha.findUnique({
      where: { id: resultado.campanhaId }
    });

    expect(campanha?.tipo_anuncio).toBe('CATALOGO_COMPLETO');
    expect(campanha?.nome).toContain('Cardápio Completo');
    expect(campanha?.orcamento_diario).toBe(60.0);
  });

  it('4. Deve validar integridade e rejeitar produto inexistente ou orçamento abaixo do mínimo', async () => {
    // Orçamento inválido
    await expect(
      catalogCampaignService.anunciarProduto({
        empresaId: testEmpresaId,
        produtoId: testProdutoPizzaId,
        orcamentoDiario: 5.0
      })
    ).rejects.toThrow(/mínimo/i);

    // Produto inexistente
    await expect(
      catalogCampaignService.anunciarProduto({
        empresaId: testEmpresaId,
        produtoId: 'prod_inexistente_9999',
        orcamentoDiario: 50.0
      })
    ).rejects.toThrow(/não encontrado/i);
  });
});
