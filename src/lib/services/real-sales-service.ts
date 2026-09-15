/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Ingestão de Vendas Prefiro Delivery e Cálculo do ROAS Real
 * (PDF Seções 52, 53, 73)
 */

import { db } from '../db';
import { getPrefiroDeliveryService } from '../adapters';

export interface ReconciliationResult {
  success: boolean;
  empresaId: string;
  pedidosReais: number;
  receitaReal: number;
  investimentoTotal: number;
  roasReal: number;
  custoRealPorPedido: number;
}

export interface ComparisonReport {
  empresaId: string;
  meta: {
    conversoes: number;
    receita: number;
    roas: number;
    cpa: number;
  };
  real: {
    pedidos: number;
    receita: number;
    roas: number;
    custoPorPedido: number;
  };
  discrepanciaPercentual: {
    pedidosVsConversoes: number;
    receita: number;
    roas: number;
  };
}

export class RealSalesReconciliationService {
  /**
   * Cruza pedidos faturados na Prefiro Delivery com os dados de anúncios da Meta (PDF Seções 52 e 53)
   */
  async reconcileCompanySales(empresaId: string): Promise<ReconciliationResult> {
    const empresa = await db.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      throw new Error(`Empresa ${empresaId} não encontrada.`);
    }

    // 1. Obter pedidos reais registrados na Prefiro Delivery
    const prefiroService = getPrefiroDeliveryService();
    const orders = await prefiroService.getOrders(empresa.slug_prefiro || 'bella-napoli');

    const pedidosReais = orders.length;
    const receitaReal = Number(orders.reduce((acc, o) => acc + o.total, 0).toFixed(2));

    // 2. Buscar métricas mais recentes de campanhas ativas da empresa
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const metricas = await db.campanhaMetrica.findMany({
      where: {
        campanha: { empresa_id: empresaId },
        data: hoje
      }
    });

    const investimentoTotal = Number(metricas.reduce((acc, m) => acc + m.investimento, 0).toFixed(2));

    const roasReal = investimentoTotal > 0
      ? Number((receitaReal / investimentoTotal).toFixed(2))
      : 0;

    const custoRealPorPedido = pedidosReais > 0
      ? Number((investimentoTotal / pedidosReais).toFixed(2))
      : 0;

    // 3. Atualizar cada snapshot com a atribuição dos dados reais (PDF Seção 73)
    if (metricas.length > 0) {
      for (const m of metricas) {
        // Distribuição proporcional com base no investimento de cada campanha
        const peso = investimentoTotal > 0 ? m.investimento / investimentoTotal : 1 / metricas.length;
        const campReceitaReal = Number((receitaReal * peso).toFixed(2));
        const campPedidosReais = Math.round(pedidosReais * peso);
        const campRoasReal = m.investimento > 0 ? Number((campReceitaReal / m.investimento).toFixed(2)) : 0;
        const campCpaReal = campPedidosReais > 0 ? Number((m.investimento / campPedidosReais).toFixed(2)) : 0;

        await db.campanhaMetrica.update({
          where: { id: m.id },
          data: {
            pedidos_reais: campPedidosReais,
            receita_real: campReceitaReal,
            roas_real: campRoasReal,
            cpa_real: campCpaReal
          }
        });
      }
    }

    return {
      success: true,
      empresaId,
      pedidosReais,
      receitaReal,
      investimentoTotal,
      roasReal,
      custoRealPorPedido
    };
  }

  /**
   * Gera relatório comparativo: Conversões Atribuídas pela Meta vs Pedidos Reais da Prefiro (PDF Seção 52)
   */
  async getComparisonReport(empresaId: string): Promise<ComparisonReport> {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const metricas = await db.campanhaMetrica.findMany({
      where: {
        campanha: { empresa_id: empresaId },
        data: hoje
      }
    });

    const metaConversoes = metricas.reduce((acc, m) => acc + m.conversoes, 0);
    const metaReceita = metricas.reduce((acc, m) => acc + m.receita, 0);
    const investimento = metricas.reduce((acc, m) => acc + m.investimento, 0);
    const metaRoas = investimento > 0 ? metaReceita / investimento : 0;
    const metaCpa = metaConversoes > 0 ? investimento / metaConversoes : 0;

    const realPedidos = metricas.reduce((acc, m) => acc + m.pedidos_reais, 0);
    const realReceita = metricas.reduce((acc, m) => acc + m.receita_real, 0);
    const realRoas = investimento > 0 ? realReceita / investimento : 0;
    const realCpa = realPedidos > 0 ? investimento / realPedidos : 0;

    const calcDelta = (realVal: number, metaVal: number) => {
      if (metaVal === 0) return realVal > 0 ? 100 : 0;
      return Number((((realVal - metaVal) / metaVal) * 100).toFixed(2));
    };

    return {
      empresaId,
      meta: {
        conversoes: metaConversoes,
        receita: Number(metaReceita.toFixed(2)),
        roas: Number(metaRoas.toFixed(2)),
        cpa: Number(metaCpa.toFixed(2))
      },
      real: {
        pedidos: realPedidos,
        receita: Number(realReceita.toFixed(2)),
        roas: Number(realRoas.toFixed(2)),
        custoPorPedido: Number(realCpa.toFixed(2))
      },
      discrepanciaPercentual: {
        pedidosVsConversoes: calcDelta(realPedidos, metaConversoes),
        receita: calcDelta(realReceita, metaReceita),
        roas: calcDelta(realRoas, metaRoas)
      }
    };
  }
}
