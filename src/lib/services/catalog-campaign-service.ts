/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Campanhas de Catálogo Dinâmico do Prefiro
 * (PDF Seções 33, 34, 83, 84, 85)
 */

import { db } from '../db';
import { getMetaAdsService } from '../adapters';

export interface AnunciarProdutoInput {
  empresaId: string;
  produtoId: string;
  orcamentoDiario: number;
}

export interface AnunciarCategoriaInput {
  empresaId: string;
  categoria: string;
  orcamentoDiario: number;
}

export interface AnunciarCardapioInput {
  empresaId: string;
  orcamentoDiario: number;
}

export class CatalogCampaignService {
  /**
   * 1. Experiência "Anunciar Produto" (PDF Seção 83)
   * Criação instantânea de anúncio focado em um prato específico do cardápio
   */
  async anunciarProduto(input: AnunciarProdutoInput) {
    if (input.orcamentoDiario < 10.0) {
      throw new Error('O orçamento diário deve ser no mínimo de R$ 10,00.');
    }

    const empresa = await db.empresa.findUnique({
      where: { id: input.empresaId },
      include: {
        integracoes_meta: true,
        meta_ad_accounts: true
      }
    });

    if (!empresa) {
      throw new Error('Empresa não encontrada.');
    }

    const produto = await db.metaProduto.findFirst({
      where: {
        id: input.produtoId,
        empresa_id: input.empresaId
      }
    });

    if (!produto) {
      throw new Error('Produto não encontrado ou não pertence a esta empresa.');
    }

    const accessToken = empresa.integracoes_meta[0]?.access_token || 'mock_catalog_token';
    const adAccountId = empresa.meta_ad_accounts[0]?.meta_account_id || 'act_catalog_account';
    const metaService = getMetaAdsService();

    const cidade = empresa.cidade || 'Local';
    const raio = empresa.raio_atendimento || 8;
    const precoEfetivo = produto.preco_promocional || produto.preco;

    const nomeCampanha = `Catálogo: ${produto.nome}`;
    const nomeConjunto = `Conjunto - ${produto.nome} (${cidade})`;
    const nomeAnuncio = `Anúncio - ${produto.nome}`;

    // Meta: Campanha
    const metaCamp = await metaService.createCampaign(accessToken, adAccountId, {
      name: nomeCampanha,
      objective: 'OUTCOME_SALES',
      daily_budget: input.orcamentoDiario,
      status: 'ACTIVE'
    });

    // Meta: Conjunto
    const metaAdSet = await metaService.createAdSet(accessToken, adAccountId, {
      campaign_id: metaCamp.id,
      name: nomeConjunto,
      daily_budget: input.orcamentoDiario,
      targeting: {
        geo_locations: { cities: [cidade] }
      }
    });

    // Meta: Anúncio
    const metaAd = await metaService.createAd(accessToken, adAccountId, {
      adset_id: metaAdSet.id,
      name: nomeAnuncio,
      creative_data: {
        title: produto.nome,
        body: `Peça agora ${produto.nome} por apenas R$ ${precoEfetivo.toFixed(2)} com entrega rápida!`,
        image_url: produto.url_imagem || undefined,
        call_to_action: 'ORDER_NOW'
      }
    });

    // DB: Criativo
    const criativo = await db.criativo.create({
      data: {
        empresa_id: input.empresaId,
        produto_id: produto.id,
        nome: `Criativo - ${produto.nome}`,
        tipo: 'IMAGEM',
        titulo: produto.nome,
        texto_principal: `Peça agora ${produto.nome} por apenas R$ ${precoEfetivo.toFixed(2)} com entrega rápida!`,
        descricao: produto.descricao || undefined,
        cta: 'ORDER_NOW',
        url_midia: produto.url_imagem,
        foco_estrategia: 'PRODUTO'
      }
    });

    // DB: Campanha + Conjunto + Anúncio
    const dbCampanha = await db.campanha.create({
      data: {
        empresa_id: input.empresaId,
        meta_campaign_id: metaCamp.id,
        nome: nomeCampanha,
        objetivo: 'OUTCOME_SALES',
        status: 'ACTIVE',
        orcamento_diario: input.orcamentoDiario,
        tipo_anuncio: 'CATALOGO_PRODUTO',
        conjuntos: {
          create: {
            empresa_id: input.empresaId,
            meta_adset_id: metaAdSet.id,
            nome: nomeConjunto,
            status: 'ACTIVE',
            orcamento_diario: input.orcamentoDiario,
            publico_alvo_desc: `Raio de ${raio}km em ${cidade} (Compradores de ${produto.categoria || 'Delivery'})`,
            anuncios: {
              create: {
                empresa_id: input.empresaId,
                meta_ad_id: metaAd.id,
                nome: nomeAnuncio,
                status: 'ACTIVE',
                criativo_id: criativo.id
              }
            }
          }
        }
      }
    });

    return {
      success: true,
      campanhaId: dbCampanha.id,
      metaCampaignId: metaCamp.id,
      metaAdSetId: metaAdSet.id,
      metaAdId: metaAd.id
    };
  }

  /**
   * 2. Experiência "Anunciar Categoria" (PDF Seção 84)
   * Criação de anúncio dinâmico para os produtos daquela categoria
   */
  async anunciarCategoria(input: AnunciarCategoriaInput) {
    if (input.orcamentoDiario < 10.0) {
      throw new Error('O orçamento diário deve ser no mínimo de R$ 10,00.');
    }

    const empresa = await db.empresa.findUnique({
      where: { id: input.empresaId },
      include: {
        integracoes_meta: true,
        meta_ad_accounts: true
      }
    });

    if (!empresa) {
      throw new Error('Empresa não encontrada.');
    }

    const produtos = await db.metaProduto.findMany({
      where: {
        empresa_id: input.empresaId,
        categoria: input.categoria,
        status: 'ATIVO'
      }
    });

    if (produtos.length === 0) {
      throw new Error(`Nenhum produto ativo encontrado na categoria ${input.categoria}.`);
    }

    const accessToken = empresa.integracoes_meta[0]?.access_token || 'mock_catalog_token';
    const adAccountId = empresa.meta_ad_accounts[0]?.meta_account_id || 'act_catalog_account';
    const metaService = getMetaAdsService();

    const cidade = empresa.cidade || 'Local';
    const nomeCampanha = `Catálogo: Categoria ${input.categoria}`;
    const nomeConjunto = `Conjunto - Categoria ${input.categoria}`;
    const nomeAnuncio = `Anúncio - Categoria ${input.categoria}`;

    const metaCamp = await metaService.createCampaign(accessToken, adAccountId, {
      name: nomeCampanha,
      objective: 'OUTCOME_SALES',
      daily_budget: input.orcamentoDiario,
      status: 'ACTIVE'
    });

    const metaAdSet = await metaService.createAdSet(accessToken, adAccountId, {
      campaign_id: metaCamp.id,
      name: nomeConjunto,
      daily_budget: input.orcamentoDiario,
      targeting: {
        geo_locations: { cities: [cidade] }
      }
    });

    const metaAd = await metaService.createAd(accessToken, adAccountId, {
      adset_id: metaAdSet.id,
      name: nomeAnuncio,
      creative_data: {
        title: `Confira nossas opções de ${input.categoria}`,
        body: `Veja as melhores opções de ${input.categoria} no nosso cardápio online com entrega rápida!`,
        image_url: produtos[0]?.url_imagem || undefined,
        call_to_action: 'ORDER_NOW'
      }
    });

    const criativo = await db.criativo.create({
      data: {
        empresa_id: input.empresaId,
        nome: `Criativo - Categoria ${input.categoria}`,
        tipo: 'IMAGEM',
        titulo: `Confira nossas opções de ${input.categoria}`,
        texto_principal: `Veja as melhores opções de ${input.categoria} no nosso cardápio online com entrega rápida!`,
        cta: 'ORDER_NOW',
        url_midia: produtos[0]?.url_imagem || null,
        foco_estrategia: 'PRODUTO'
      }
    });

    const dbCampanha = await db.campanha.create({
      data: {
        empresa_id: input.empresaId,
        meta_campaign_id: metaCamp.id,
        nome: nomeCampanha,
        objetivo: 'OUTCOME_SALES',
        status: 'ACTIVE',
        orcamento_diario: input.orcamentoDiario,
        tipo_anuncio: 'CATALOGO_CATEGORIA',
        conjuntos: {
          create: {
            empresa_id: input.empresaId,
            meta_adset_id: metaAdSet.id,
            nome: nomeConjunto,
            status: 'ACTIVE',
            orcamento_diario: input.orcamentoDiario,
            publico_alvo_desc: `Clientes de delivery interessados em ${input.categoria} em ${cidade}`,
            anuncios: {
              create: {
                empresa_id: input.empresaId,
                meta_ad_id: metaAd.id,
                nome: nomeAnuncio,
                status: 'ACTIVE',
                criativo_id: criativo.id
              }
            }
          }
        }
      }
    });

    return {
      success: true,
      campanhaId: dbCampanha.id,
      metaCampaignId: metaCamp.id,
      metaAdSetId: metaAdSet.id,
      metaAdId: metaAd.id
    };
  }

  /**
   * 3. Experiência "Anunciar Todo Cardápio" (PDF Seção 85)
   * Divulgação dinâmica do catálogo completo da loja
   */
  async anunciarTodoCardapio(input: AnunciarCardapioInput) {
    if (input.orcamentoDiario < 10.0) {
      throw new Error('O orçamento diário deve ser no mínimo de R$ 10,00.');
    }

    const empresa = await db.empresa.findUnique({
      where: { id: input.empresaId },
      include: {
        integracoes_meta: true,
        meta_ad_accounts: true,
        meta_catalogos: true
      }
    });

    if (!empresa) {
      throw new Error('Empresa não encontrada.');
    }

    const totalProdutosAtivos = await db.metaProduto.count({
      where: { empresa_id: input.empresaId, status: 'ATIVO' }
    });

    if (totalProdutosAtivos === 0) {
      throw new Error('Nenhum produto ativo no catálogo para anunciar.');
    }

    const accessToken = empresa.integracoes_meta[0]?.access_token || 'mock_catalog_token';
    const adAccountId = empresa.meta_ad_accounts[0]?.meta_account_id || 'act_catalog_account';
    const metaService = getMetaAdsService();

    const cidade = empresa.cidade || 'Local';
    const nomeCampanha = `Cardápio Completo - ${empresa.nome}`;
    const nomeConjunto = `Conjunto - Todo o Cardápio`;
    const nomeAnuncio = `Anúncio - Cardápio Completo`;

    const metaCamp = await metaService.createCampaign(accessToken, adAccountId, {
      name: nomeCampanha,
      objective: 'OUTCOME_SALES',
      daily_budget: input.orcamentoDiario,
      status: 'ACTIVE'
    });

    const metaAdSet = await metaService.createAdSet(accessToken, adAccountId, {
      campaign_id: metaCamp.id,
      name: nomeConjunto,
      daily_budget: input.orcamentoDiario,
      targeting: {
        geo_locations: { cities: [cidade] }
      }
    });

    const metaAd = await metaService.createAd(accessToken, adAccountId, {
      adset_id: metaAdSet.id,
      name: nomeAnuncio,
      creative_data: {
        title: `Cardápio Completo - ${empresa.nome}`,
        body: `Faça seu pedido diretamente no nosso cardápio online com entrega rápida e os melhores pratos!`,
        call_to_action: 'ORDER_NOW'
      }
    });

    const criativo = await db.criativo.create({
      data: {
        empresa_id: input.empresaId,
        nome: `Criativo - Cardápio Completo`,
        tipo: 'CARROSSEL',
        titulo: `Cardápio Completo - ${empresa.nome}`,
        texto_principal: `Faça seu pedido diretamente no nosso cardápio online com entrega rápida e os melhores pratos!`,
        cta: 'ORDER_NOW',
        foco_estrategia: 'PRODUTO'
      }
    });

    const dbCampanha = await db.campanha.create({
      data: {
        empresa_id: input.empresaId,
        meta_campaign_id: metaCamp.id,
        nome: nomeCampanha,
        objetivo: 'OUTCOME_SALES',
        status: 'ACTIVE',
        orcamento_diario: input.orcamentoDiario,
        tipo_anuncio: 'CATALOGO_COMPLETO',
        conjuntos: {
          create: {
            empresa_id: input.empresaId,
            meta_adset_id: metaAdSet.id,
            nome: nomeConjunto,
            status: 'ACTIVE',
            orcamento_diario: input.orcamentoDiario,
            publico_alvo_desc: `Público geral de delivery em ${cidade} (Catálogo Completo)`,
            anuncios: {
              create: {
                empresa_id: input.empresaId,
                meta_ad_id: metaAd.id,
                nome: nomeAnuncio,
                status: 'ACTIVE',
                criativo_id: criativo.id
              }
            }
          }
        }
      }
    });

    return {
      success: true,
      campanhaId: dbCampanha.id,
      metaCampaignId: metaCamp.id,
      metaAdSetId: metaAdSet.id,
      metaAdId: metaAd.id
    };
  }
}

export const catalogCampaignService = new CatalogCampaignService();
