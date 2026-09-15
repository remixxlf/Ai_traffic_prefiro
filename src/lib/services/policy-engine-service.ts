/**
 * Plataforma de Gestão de Tráfego com IA
 * Policy Engine, Guardrails de Segurança & Níveis de Automação
 * (PDF Seções 41, 42, 43, 44, 76, 77)
 */

import { db } from '../db';
import { getMetaAdsService } from '../adapters';

export type ModoOperacao = 'MANUAL' | 'ASSISTIDO' | 'AUTOMATICO';
export type TipoAcao =
  | 'AUMENTAR_ORCAMENTO'
  | 'REDUZIR_ORCAMENTO'
  | 'PAUSAR_ANUNCIO'
  | 'PAUSAR_CAMPANHA'
  | 'REATIVAR_CAMPANHA';

export interface AvaliarAcaoInput {
  empresaId: string;
  tipoAcao: TipoAcao;
  entidadeTipo: 'CAMPANHA' | 'CONJUNTO' | 'ANUNCIO';
  entidadeId: string;
  valorProposto?: number;
  motivo: string;
}

export interface ResultadoAvaliacao {
  permitido: boolean;
  status: 'BLOQUEADO' | 'PENDENTE_APROVACAO' | 'EXECUTADO' | 'INFORMATIVO';
  motivoBloqueio?: string;
  aprovacaoId?: string;
  detalhes?: any;
}

export class PolicyEngineService {
  /**
   * Atualiza o modo de operação da empresa e o teto diário global (PDF Seções 41 e 43)
   */
  async atualizarModoOperacao(empresaId: string, modo: ModoOperacao, orcamentoMaxDiario?: number) {
    return db.empresa.update({
      where: { id: empresaId },
      data: {
        modo_operacao: modo,
        ...(orcamentoMaxDiario ? { orcamento_max_diario: orcamentoMaxDiario } : {})
      }
    });
  }

  /**
   * Obtém a configuração de automação e guardrails da empresa
   */
  async obterConfiguracao(empresaId: string) {
    const empresa = await db.empresa.findUnique({
      where: { id: empresaId },
      select: {
        modo_operacao: true,
        orcamento_max_diario: true
      }
    });

    const automacoes = await db.automacao.findMany({
      where: { empresa_id: empresaId }
    });

    const pendentesAprovacao = await db.aprovacao.count({
      where: { empresa_id: empresaId, status: 'PENDENTE' }
    });

    return {
      modoOperacao: (empresa?.modo_operacao as ModoOperacao) || 'ASSISTIDO',
      orcamentoMaxDiario: empresa?.orcamento_max_diario || 500.0,
      regras: automacoes,
      pendentesAprovacao
    };
  }

  /**
   * Avalia e executa uma ação da IA respeitando os Guardrails e o Modo de Operação
   * (PDF Seções 41, 43, 76, 77)
   */
  async avaliarAcao(input: AvaliarAcaoInput): Promise<ResultadoAvaliacao> {
    const empresa = await db.empresa.findUnique({
      where: { id: input.empresaId },
      include: {
        integracoes_meta: true
      }
    });

    if (!empresa) {
      throw new Error('Empresa não encontrada.');
    }

    const modo = (empresa.modo_operacao as ModoOperacao) || 'ASSISTIDO';
    const tetoGlobal = empresa.orcamento_max_diario || 500.0;
    let valorAnterior = 0;

    // 1. CHECAGEM DE GUARDRAILS RÍGIDOS
    if (input.tipoAcao === 'AUMENTAR_ORCAMENTO') {
      const valorProposto = input.valorProposto || 0;

      // Guardrail 1: Teto Diário Global da Empresa (PDF Seção 43)
      if (valorProposto > tetoGlobal) {
        return {
          permitido: false,
          status: 'BLOQUEADO',
          motivoBloqueio: `Orçamento proposto de R$ ${valorProposto.toFixed(2)} excede o teto diário global de R$ ${tetoGlobal.toFixed(2)}.`
        };
      }

      // Guardrail 2: Aumento Máximo de 20% por ação (PDF Seções 43 e 76)
      if (input.entidadeTipo === 'CAMPANHA') {
        const campanha = await db.campanha.findUnique({
          where: { id: input.entidadeId }
        });

        if (campanha && campanha.orcamento_diario) {
          valorAnterior = campanha.orcamento_diario;
          const pctAumento = (valorProposto - valorAnterior) / valorAnterior;

          if (pctAumento > 0.2001) {
            return {
              permitido: false,
              status: 'BLOQUEADO',
              motivoBloqueio: `Aumento de ${(pctAumento * 100).toFixed(1)}% excede o limite máximo permitido de 20% por ação (PDF Seções 43 e 76).`
            };
          }
        }
      }
    }

    // 2. AVALIAÇÃO DO MODO DE OPERAÇÃO (PDF Seção 41)
    if (modo === 'MANUAL') {
      return {
        permitido: true,
        status: 'INFORMATIVO',
        detalhes: 'Modo MANUAL ativo. Ação recomendada pela IA, mas nenhuma alteração foi realizada automaticamente.'
      };
    }

    if (modo === 'ASSISTIDO') {
      // Modo Assistido: Gera item no Centro de Aprovações (PDF Seção 66)
      const aprovacao = await db.aprovacao.create({
        data: {
          empresa_id: input.empresaId,
          titulo: `Sugestão de ${input.tipoAcao.replace('_', ' ')}`,
          descricao: input.motivo,
          acao_tipo: input.tipoAcao,
          payload: JSON.stringify({
            entidadeTipo: input.entidadeTipo,
            entidadeId: input.entidadeId,
            valorProposto: input.valorProposto,
            valorAnterior
          }),
          status: 'PENDENTE'
        }
      });

      return {
        permitido: true,
        status: 'PENDENTE_APROVACAO',
        aprovacaoId: aprovacao.id
      };
    }

    // 3. MODO AUTOMÁTICO (PDF Seção 41 e 42)
    // Ação aprovada pelo Policy Engine executada diretamente
    const metaService = getMetaAdsService();
    const accessToken = empresa.integracoes_meta[0]?.access_token || 'mock_token';

    if (input.tipoAcao === 'AUMENTAR_ORCAMENTO' || input.tipoAcao === 'REDUZIR_ORCAMENTO') {
      const campanha = await db.campanha.update({
        where: { id: input.entidadeId },
        data: { orcamento_diario: input.valorProposto }
      });

      if (campanha.meta_campaign_id) {
        await metaService.updateCampaignBudget(accessToken, campanha.meta_campaign_id, input.valorProposto!);
      }

      await db.auditoria.create({
        data: {
          empresa_id: input.empresaId,
          origem: 'AUTOMACAO',
          entidade_tipo: input.entidadeTipo,
          entidade_id: input.entidadeId,
          campo: 'orcamento_diario',
          valor_anterior: String(valorAnterior),
          valor_novo: String(input.valorProposto),
          motivo: input.motivo
        }
      });
    } else if (input.tipoAcao === 'PAUSAR_ANUNCIO') {
      await db.anuncio.update({
        where: { id: input.entidadeId },
        data: { status: 'PAUSED' }
      });

      await db.auditoria.create({
        data: {
          empresa_id: input.empresaId,
          origem: 'AUTOMACAO',
          entidade_tipo: 'ANUNCIO',
          entidade_id: input.entidadeId,
          campo: 'status',
          valor_anterior: 'ACTIVE',
          valor_novo: 'PAUSED',
          motivo: input.motivo
        }
      });
    }

    return {
      permitido: true,
      status: 'EXECUTADO',
      detalhes: {
        valorNovo: input.valorProposto,
        mensagem: 'Ação executada com sucesso pelo modo autônomo com guardrails.'
      }
    };
  }

  /**
   * Avalia regras determinísticas configuradas e executa proteção de orçamento (PDF Seção 44)
   * Ex: Se CPA > R$ 30 e Investimento > R$ 150 -> Pausar Anúncio
   */
  async avaliarRegrasDeterministicas(empresaId: string) {
    const automacoes = await db.automacao.findMany({
      where: { empresa_id: empresaId, ativa: true }
    });

    const execucoesRealizadas: Array<{ acaoExecutada: string; alvoId: string; motivo: string }> = [];

    for (const aut of automacoes) {
      let condicao: any = {};
      let acao: any = {};

      try {
        condicao = JSON.parse(aut.condicao);
        acao = JSON.parse(aut.acao);
      } catch (e) {
        continue;
      }

      // Regra de CPA Alto e Gasto Alto
      if (condicao.cpa_gt && condicao.investimento_gt) {
        const anuncios = await db.anuncio.findMany({
          where: { empresa_id: empresaId, status: 'ACTIVE' },
          include: {
            metricas: {
              orderBy: { data: 'desc' },
              take: 1
            }
          }
        });

        for (const ad of anuncios) {
          const metrica = ad.metricas[0];
          if (metrica && metrica.investimento >= condicao.investimento_gt && metrica.cpa >= condicao.cpa_gt) {
            // Dispara ação
            if (acao.tipo === 'PAUSAR_ANUNCIO') {
              await db.anuncio.update({
                where: { id: ad.id },
                data: { status: 'PAUSED' }
              });

              await db.automacaoExecucao.create({
                data: {
                  automacao_id: aut.id,
                  alvo_id: ad.id,
                  status: 'SUCESSO',
                  detalhes: `Pausado automaticamente: CPA de R$ ${metrica.cpa.toFixed(2)} (> R$ ${condicao.cpa_gt}) e Investimento de R$ ${metrica.investimento.toFixed(2)}.`
                }
              });

              await db.auditoria.create({
                data: {
                  empresa_id: empresaId,
                  origem: 'AUTOMACAO',
                  entidade_tipo: 'ANUNCIO',
                  entidade_id: ad.id,
                  campo: 'status',
                  valor_anterior: 'ACTIVE',
                  valor_novo: 'PAUSED',
                  motivo: `Regra determinística disparada: CPA R$ ${metrica.cpa.toFixed(2)} > R$ ${condicao.cpa_gt}`
                }
              });

              execucoesRealizadas.push({
                acaoExecutada: 'PAUSAR_ANUNCIO',
                alvoId: ad.id,
                motivo: `CPA R$ ${metrica.cpa.toFixed(2)} excedeu teto de R$ ${condicao.cpa_gt}`
              });
            }
          }
        }
      }
    }

    return execucoesRealizadas;
  }
}

export const policyEngineService = new PolicyEngineService();
