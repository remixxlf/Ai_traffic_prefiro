/**
 * Plataforma de Gestão de Tráfego com IA
 * Wizard Guiado de Criação de Campanhas de Vendas
 * (PDF Seções 2, 5, 14, 15, 16, 17, 18, 19, 20)
 */

import { db } from '../db';
import { getMetaAdsService } from '../adapters';

export interface CriativoCampanhaInput {
  titulo: string;
  textoPrincipal: string;
  descricao?: string;
  cta: string;
  imageUrl?: string;
  focoEstrategia?: string;
}

export interface CriarCampanhaPayload {
  nomeCampanha: string;
  produtoNome: string;
  orcamentoDiario: number;
  tipoOrcamento?: 'DAILY' | 'LIFETIME';
  cidade?: string;
  raioKm?: number;
  urlDestino?: string;
  criativo: CriativoCampanhaInput;
}

export interface RecomendacaoOrcamento {
  orcamentoDiarioRecomendado: number;
  justificativa: string;
  opcoesRapidas: number[];
}

export interface InterpretacaoCampanha {
  produtoFoco: string;
  objetivoNegocio: string;
  sugestaoGancho: string;
  sugestaoPublico: string;
  sugestaoOrcamento?: number;
}

export class CampaignWizardService {
  /**
   * Recomenda orçamento diário inteligente com base na Memória do Negócio (PDF Seções 18 e 19)
   */
  async recomendarOrcamento(empresaId: string): Promise<RecomendacaoOrcamento> {
    const empresa = await db.empresa.findUnique({
      where: { id: empresaId }
    });

    const ticketMedio = empresa?.ticket_medio || 55.0;
    const raio = empresa?.raio_atendimento || 7.0;
    const cidade = empresa?.cidade || 'sua região';
    const segmento = empresa?.segmento || 'Restaurante / Delivery';

    // Regra da IA: cálculo proporcional ao ticket médio para cobrir 1 a 2 pedidos/dia de aprendizado
    const baseCalculada = Math.round((ticketMedio * 1.25) / 5) * 5;
    const orcamentoDiarioRecomendado = Math.max(40, Math.min(baseCalculada, 200));

    const justificativa = `Considerando seu segmento (${segmento}) em ${cidade}, seu ticket médio de R$ ${ticketMedio.toFixed(2)} e raio de atendimento de ${raio}km, recomendamos começar com R$ ${orcamentoDiarioRecomendado.toFixed(2)} por dia para gerar pedidos consistentes e alimentar o aprendizado da Meta.`;

    const opcoesRapidas = [
      50,
      orcamentoDiarioRecomendado,
      Math.max(100, Math.round(orcamentoDiarioRecomendado * 1.5 / 10) * 10),
      200
    ].filter((val, idx, arr) => arr.indexOf(val) === idx).sort((a, b) => a - b);

    return {
      orcamentoDiarioRecomendado,
      justificativa,
      opcoesRapidas
    };
  }

  /**
   * Interpreta texto livre digitado pelo usuário para extrair produto, público e estratégia (PDF Seção 15)
   */
  async interpretarIntencao(empresaId: string, promptTexto: string): Promise<InterpretacaoCampanha> {
    const empresa = await db.empresa.findUnique({
      where: { id: empresaId }
    });

    // Heurística robusta com fallback inteligente
    const lower = promptTexto.toLowerCase();
    let produtoFoco = 'Destaque do Cardápio';

    if (lower.includes('pizza') || lower.includes('combo')) {
      if (lower.includes('combo família') || lower.includes('combo familia')) {
        produtoFoco = 'Combo Família Especial';
      } else if (lower.includes('calabresa')) {
        produtoFoco = 'Pizza Calabresa Artesanal';
      } else {
        produtoFoco = 'Pizza Especial da Casa';
      }
    } else if (lower.includes('hambúrguer') || lower.includes('hamburguer') || lower.includes('burger')) {
      produtoFoco = 'Hambúrguer Artesanal';
    } else if (empresa?.produto_mais_vendido) {
      produtoFoco = empresa.produto_mais_vendido;
    }

    const cidade = empresa?.cidade || 'sua cidade';
    const raio = empresa?.raio_atendimento || 8;

    return {
      produtoFoco,
      objetivoNegocio: 'Gerar Vendas Online no Delivery (Prefiro Delivery)',
      sugestaoGancho: lower.includes('fim de semana') || lower.includes('final de semana')
        ? 'Aproveite o fim de semana com sabor especial e entrega rápida quentinha!'
        : 'Sabor irresistível preparado na hora com entrega rápida!',
      sugestaoPublico: `Pessoas num raio de ${raio}km em ${cidade} interessadas em gastronomia e pedidos para viagem`
    };
  }

  /**
   * Criação Automática da Estrutura Meta (Campanha -> Conjunto -> Anúncio) (PDF Seção 20)
   */
  async criarCampanhaCompleta(empresaId: string, payload: CriarCampanhaPayload) {
    if (payload.orcamentoDiario < 10.0) {
      throw new Error('O orçamento diário deve ser no mínimo de R$ 10,00 para garantir veiculação na Meta.');
    }

    const empresa = await db.empresa.findUnique({
      where: { id: empresaId },
      include: {
        integracoes_meta: true,
        meta_ad_accounts: true
      }
    });

    if (!empresa) {
      throw new Error(`Empresa com ID ${empresaId} não encontrada.`);
    }

    const accessToken = empresa.integracoes_meta[0]?.access_token || 'mock_access_token';
    const adAccountId = empresa.meta_ad_accounts[0]?.meta_account_id || 'act_sandbox_account';
    const metaService = getMetaAdsService();

    const cidade = payload.cidade || empresa.cidade || 'Local';
    const raio = payload.raioKm || empresa.raio_atendimento || 8;

    // 1. Criar Campanha na Meta (Objetivo: Vendas)
    const metaCampaign = await metaService.createCampaign(accessToken, adAccountId, {
      name: payload.nomeCampanha,
      objective: 'OUTCOME_SALES',
      daily_budget: payload.orcamentoDiario,
      status: 'ACTIVE'
    });

    // 2. Criar Conjunto de Anúncios na Meta
    const adSetName = `Conjunto - ${cidade} (${raio}km)`;
    const metaAdSet = await metaService.createAdSet(accessToken, adAccountId, {
      campaign_id: metaCampaign.id,
      name: adSetName,
      daily_budget: payload.orcamentoDiario,
      targeting: {
        geo_locations: {
          cities: [cidade]
        }
      }
    });

    // 3. Criar Anúncio na Meta
    const adName = `Anúncio - ${payload.produtoNome}`;
    const metaAd = await metaService.createAd(accessToken, adAccountId, {
      adset_id: metaAdSet.id,
      name: adName,
      creative_data: {
        title: payload.criativo.titulo,
        body: payload.criativo.textoPrincipal,
        image_url: payload.criativo.imageUrl,
        call_to_action: payload.criativo.cta || 'ORDER_NOW'
      }
    });

    // 4. Salvar Criativo no Banco (Biblioteca de Criativos)
    const criativoDb = await db.criativo.create({
      data: {
        empresa_id: empresaId,
        nome: `Criativo - ${payload.produtoNome}`,
        tipo: 'IMAGEM',
        titulo: payload.criativo.titulo,
        texto_principal: payload.criativo.textoPrincipal,
        descricao: payload.criativo.descricao || null,
        cta: payload.criativo.cta || 'ORDER_NOW',
        url_midia: payload.criativo.imageUrl || null,
        foco_estrategia: payload.criativo.focoEstrategia || 'BENEFICIO'
      }
    });

    // 5. Persistir hierarquia completa de Campanha no Banco
    const publicoDesc = `Raio de ${raio}km em ${cidade} (Clientes e Moradores Locais)`;
    const dbCampanha = await db.campanha.create({
      data: {
        empresa_id: empresaId,
        meta_campaign_id: metaCampaign.id,
        nome: payload.nomeCampanha,
        objetivo: 'OUTCOME_SALES',
        status: 'ACTIVE',
        orcamento_diario: payload.orcamentoDiario,
        tipo_anuncio: 'PADRAO',
        conjuntos: {
          create: {
            empresa_id: empresaId,
            meta_adset_id: metaAdSet.id,
            nome: adSetName,
            status: 'ACTIVE',
            orcamento_diario: payload.orcamentoDiario,
            publico_alvo_desc: publicoDesc,
            anuncios: {
              create: {
                empresa_id: empresaId,
                meta_ad_id: metaAd.id,
                nome: adName,
                status: 'ACTIVE',
                criativo_id: criativoDb.id
              }
            }
          }
        }
      },
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

    return {
      success: true,
      campanhaId: dbCampanha.id,
      metaCampaignId: metaCampaign.id,
      metaAdSetId: metaAdSet.id,
      metaAdId: metaAd.id,
      campanha: dbCampanha
    };
  }

  /**
   * Listagem de Campanhas da Empresa (PDF Seção 58)
   */
  async listarCampanhas(empresaId: string) {
    const campanhas = await db.campanha.findMany({
      where: { empresa_id: empresaId },
      include: {
        conjuntos: {
          include: {
            anuncios: {
              include: { criativo: true }
            }
          }
        },
        metricas: {
          orderBy: { data: 'desc' },
          take: 1
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return campanhas.map(c => ({
      id: c.id,
      nome: c.nome,
      status: c.status,
      objetivo: c.objetivo,
      orcamentoDiario: c.orcamento_diario,
      tipoAnuncio: c.tipo_anuncio,
      conjuntosCount: c.conjuntos.length,
      anunciosCount: c.conjuntos.reduce((total, conj) => total + conj.anuncios.length, 0),
      conjuntos: c.conjuntos,
      ultimaMetrica: c.metricas[0] || null,
      createdAt: c.created_at
    }));
  }
}

export const campaignWizardService = new CampaignWizardService();
