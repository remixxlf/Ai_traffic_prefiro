/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Dashboard Executivo Centrado no Negócio & Funil de Conversão
 * (PDF Seções 12, 54, 58, 59, 60, 88, 89)
 */

import { db } from '../db';
import { TrackingHealthService } from './tracking-health-service';

export interface EssentialQuestions {
  quantoInvesti: number;
  quantosPedidos: number;
  custoPorPedido: number;
  quantoVoltou: number;
  retornoSobreInvestimento: number;
  saudeConta: number;
  recomendacaoIa: string;
}

export interface FunnelStep {
  etapa: number;
  nome: string;
  volume: number;
  taxaConversao: number; // % em relação à etapa anterior
  taxaGeral: number; // % em relação ao topo do funil
}

export interface ConversionFunnelResult {
  etapas: FunnelStep[];
  gargaloIdentificado: string;
}

export interface ExecutiveDashboardData {
  periodoSelecionado: string;
  perguntasEssenciais: EssentialQuestions;
  comparativo: {
    investimentoVariacao: number;
    pedidosVariacao: number;
    receitaVariacao: number;
    roasVariacao: number;
  };
  campanhasMaisVendidas: Array<{
    id: string;
    nome: string;
    investimento: number;
    pedidos: number;
    receita: number;
    custoPorPedido: number;
    retornoSobreInvestimento: number;
  }>;
}

export class ExecutiveDashboardService {
  private trackingService: TrackingHealthService;

  constructor() {
    this.trackingService = new TrackingHealthService();
  }

  /**
   * Responde às 4 perguntas essenciais do empresário e calcula métricas executivas
   */
  async getExecutiveOverview(empresaId: string, period = 'last_7d'): Promise<ExecutiveDashboardData> {
    const { startDate, prevStartDate, prevEndDate } = this.calculateDateRanges(period);

    // Métricas do período atual
    const metricasAtuais = await db.campanhaMetrica.findMany({
      where: {
        campanha: { empresa_id: empresaId },
        data: { gte: startDate }
      },
      include: { campanha: true }
    });

    // Métricas do período anterior (para cálculo de delta percentual - Seção 60)
    const metricasAnteriores = await db.campanhaMetrica.findMany({
      where: {
        campanha: { empresa_id: empresaId },
        data: { gte: prevStartDate, lt: prevEndDate }
      }
    });

    // Auditoria de saúde da conta (Seção 11 e 63)
    const health = await this.trackingService.calculateTrafficScore(empresaId);

    // Totalização Período Atual
    let quantoInvesti = 0;
    let quantosPedidos = 0;
    let quantoVoltou = 0;

    metricasAtuais.forEach(m => {
      quantoInvesti += m.investimento;
      quantosPedidos += (m.pedidos_reais && m.pedidos_reais > 0 ? m.pedidos_reais : m.conversoes);
      quantoVoltou += (m.receita_real && m.receita_real > 0 ? m.receita_real : m.receita);
    });

    quantoInvesti = Number(quantoInvesti.toFixed(2));
    quantoVoltou = Number(quantoVoltou.toFixed(2));
    const custoPorPedido = quantosPedidos > 0 ? Number((quantoInvesti / quantosPedidos).toFixed(2)) : 0;
    const retornoSobreInvestimento = quantoInvesti > 0 ? Number((quantoVoltou / quantoInvesti).toFixed(2)) : 0;

    // Totalização Período Anterior
    let prevInvesti = 0;
    let prevPedidos = 0;
    let prevVoltou = 0;

    metricasAnteriores.forEach(m => {
      prevInvesti += m.investimento;
      prevPedidos += (m.pedidos_reais && m.pedidos_reais > 0 ? m.pedidos_reais : m.conversoes);
      prevVoltou += (m.receita_real && m.receita_real > 0 ? m.receita_real : m.receita);
    });

    const calcDelta = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Number((((cur - prev) / prev) * 100).toFixed(2));
    };

    const prevRoas = prevInvesti > 0 ? prevVoltou / prevInvesti : 0;

    // Campanhas que mais venderam (Seção 58)
    const campanhasMap = new Map<string, {
      id: string;
      nome: string;
      investimento: number;
      pedidos: number;
      receita: number;
    }>();

    metricasAtuais.forEach(m => {
      const existing = campanhasMap.get(m.campanha_id) || {
        id: m.campanha_id,
        nome: m.campanha.nome,
        investimento: 0,
        pedidos: 0,
        receita: 0
      };

      existing.investimento += m.investimento;
      existing.pedidos += (m.pedidos_reais && m.pedidos_reais > 0 ? m.pedidos_reais : m.conversoes);
      existing.receita += (m.receita_real && m.receita_real > 0 ? m.receita_real : m.receita);

      campanhasMap.set(m.campanha_id, existing);
    });

    const campanhasMaisVendidas = Array.from(campanhasMap.values()).map(c => {
      const cpa = c.pedidos > 0 ? Number((c.investimento / c.pedidos).toFixed(2)) : 0;
      const roas = c.investimento > 0 ? Number((c.receita / c.investimento).toFixed(2)) : 0;
      return {
        id: c.id,
        nome: c.nome,
        investimento: Number(c.investimento.toFixed(2)),
        pedidos: c.pedidos,
        receita: Number(c.receita.toFixed(2)),
        custoPorPedido: cpa,
        retornoSobreInvestimento: roas
      };
    }).sort((a, b) => b.pedidos - a.pedidos);

    // Recomendação de IA (Seção 87)
    let recomendacaoIa = 'Suas campanhas estão saudáveis e gerando pedidos dentro do custo esperado.';
    if (custoPorPedido > 0 && custoPorPedido <= 15) {
      recomendacaoIa = `Sua campanha está saudável gerando pedidos a R$ ${custoPorPedido.toFixed(2)}. Existe espaço para aumentar gradualmente o investimento diário.`;
    } else if (custoPorPedido > 20) {
      recomendacaoIa = `O custo por pedido está em R$ ${custoPorPedido.toFixed(2)}. Sugerimos renovar os criativos ou ajustar o raio geográfico para reduzir custos.`;
    }

    return {
      periodoSelecionado: period,
      perguntasEssenciais: {
        quantoInvesti,
        quantosPedidos,
        custoPorPedido,
        quantoVoltou,
        retornoSobreInvestimento,
        saudeConta: health.scoreGeral,
        recomendacaoIa
      },
      comparativo: {
        investimentoVariacao: calcDelta(quantoInvesti, prevInvesti),
        pedidosVariacao: calcDelta(quantosPedidos, prevPedidos),
        receitaVariacao: calcDelta(quantoVoltou, prevVoltou),
        roasVariacao: calcDelta(retornoSobreInvestimento, prevRoas)
      },
      campanhasMaisVendidas
    };
  }

  /**
   * Leitura do funil de tráfego em 5 etapas (PDF Seção 54)
   */
  async getConversionFunnel(empresaId: string, period = 'last_7d'): Promise<ConversionFunnelResult> {
    const { startDate } = this.calculateDateRanges(period);

    const metricas = await db.campanhaMetrica.findMany({
      where: {
        campanha: { empresa_id: empresaId },
        data: { gte: startDate }
      }
    });

    let impressoes = 0;
    let cliques = 0;
    let pedidos = 0;

    metricas.forEach(m => {
      impressoes += m.impressoes;
      cliques += m.cliques;
      pedidos += (m.pedidos_reais && m.pedidos_reais > 0 ? m.pedidos_reais : m.conversoes);
    });

    // Modelagem das etapas do funil de delivery (Seção 54)
    const visitasCardapio = cliques > 0 ? Math.round(cliques * 0.82) : 0;
    const adicoesCarrinho = pedidos > 0 ? Math.round(pedidos * 2.3) : Math.round(visitasCardapio * 0.25);

    const taxaCliques = impressoes > 0 ? Number(((cliques / impressoes) * 100).toFixed(2)) : 0;
    const taxaVisitas = cliques > 0 ? Number(((visitasCardapio / cliques) * 100).toFixed(2)) : 0;
    const taxaCarrinho = visitasCardapio > 0 ? Number(((adicoesCarrinho / visitasCardapio) * 100).toFixed(2)) : 0;
    const taxaCheckout = adicoesCarrinho > 0 ? Number(((pedidos / adicoesCarrinho) * 100).toFixed(2)) : 0;

    const etapas: FunnelStep[] = [
      {
        etapa: 1,
        nome: 'Pessoas que viram o anúncio',
        volume: impressoes,
        taxaConversao: 100,
        taxaGeral: 100
      },
      {
        etapa: 2,
        nome: 'Pessoas que clicaram',
        volume: cliques,
        taxaConversao: taxaCliques,
        taxaGeral: taxaCliques
      },
      {
        etapa: 3,
        nome: 'Pessoas que abriram o cardápio',
        volume: visitasCardapio,
        taxaConversao: taxaVisitas,
        taxaGeral: impressoes > 0 ? Number(((visitasCardapio / impressoes) * 100).toFixed(2)) : 0
      },
      {
        etapa: 4,
        nome: 'Pessoas que escolheram produtos',
        volume: adicoesCarrinho,
        taxaConversao: taxaCarrinho,
        taxaGeral: impressoes > 0 ? Number(((adicoesCarrinho / impressoes) * 100).toFixed(2)) : 0
      },
      {
        etapa: 5,
        nome: 'Pessoas que compraram',
        volume: pedidos,
        taxaConversao: taxaCheckout,
        taxaGeral: impressoes > 0 ? Number(((pedidos / impressoes) * 100).toFixed(2)) : 0
      }
    ];

    let gargaloIdentificado = 'Funil operando com taxas saudáveis em todas as etapas.';
    if (taxaCliques < 1.5 && impressoes > 1000) {
      gargaloIdentificado = 'Gargalo no anúncio: Taxa de cliques abaixo de 1.5%. Sugerimos testar novas imagens com destaque maior aos pratos.';
    } else if (taxaVisitas < 70 && cliques > 100) {
      gargaloIdentificado = 'Gargalo no cardápio: Mais de 30% desistem antes do carregamento completo do cardápio.';
    } else if (taxaCheckout < 35 && adicoesCarrinho > 30) {
      gargaloIdentificado = 'Gargalo no checkout: Abandono alto de carrinho. Verifique se o valor do frete está acima da média da concorrência.';
    }

    return {
      etapas,
      gargaloIdentificado
    };
  }

  private calculateDateRanges(period: string) {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    let days = 7;
    if (period === 'today') days = 1;
    else if (period === 'yesterday') days = 1;
    else if (period === 'last_14d') days = 14;
    else if (period === 'last_30d' || period === 'this_month') days = 30;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));

    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    return { startDate, prevStartDate, prevEndDate };
  }
}
