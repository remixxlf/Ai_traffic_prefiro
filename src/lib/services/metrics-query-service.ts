/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Consulta de Métricas Cacheadas e Análise Comparativa
 * (PDF Seções 60, 71, 73)
 */

import { db } from '../db';

export interface MetricsSummary {
  investimentoTotal: number;
  receitaTotal: number;
  vendasTotal: number;
  conversoesTotal: number;
  impressoesTotal: number;
  cliquesTotal: number;
  ctrMedio: number;
  cpaMedio: number;
  roasMedio: number;
  campanhas: Array<{
    id: string;
    nome: string;
    status: string;
    investimento: number;
    conversoes: number;
    cpa: number;
    roas: number;
  }>;
}

export interface ComparativeMetrics {
  atual: {
    investimento: number;
    receita: number;
    conversoes: number;
    roas: number;
    cpa: number;
  };
  anterior: {
    investimento: number;
    receita: number;
    conversoes: number;
    roas: number;
    cpa: number;
  };
  variacaoPercentual: {
    investimento: number;
    receita: number;
    conversoes: number;
    roas: number;
    cpa: number;
  };
}

export class MetricsQueryService {
  /**
   * Retorna o resumo consolidado de métricas lendo diretamente do banco interno (Cache - PDF Seção 71)
   */
  async getEmpresaMetricsSummary(empresaId: string, _period = 'last_7d'): Promise<MetricsSummary> {
    const campanhas = await db.campanha.findMany({
      where: { empresa_id: empresaId },
      include: {
        metricas: {
          orderBy: { data: 'desc' },
          take: 7
        }
      }
    });

    let investimentoTotal = 0;
    let receitaTotal = 0;
    let conversoesTotal = 0;
    let impressoesTotal = 0;
    let cliquesTotal = 0;

    const campanhasSummary = campanhas.map(c => {
      const campInvestimento = c.metricas.reduce((acc, m) => acc + m.investimento, 0);
      const campReceita = c.metricas.reduce((acc, m) => acc + m.receita, 0);
      const campConversoes = c.metricas.reduce((acc, m) => acc + m.conversoes, 0);
      const campImpressoes = c.metricas.reduce((acc, m) => acc + m.impressoes, 0);
      const campCliques = c.metricas.reduce((acc, m) => acc + m.cliques, 0);

      investimentoTotal += campInvestimento;
      receitaTotal += campReceita;
      conversoesTotal += campConversoes;
      impressoesTotal += campImpressoes;
      cliquesTotal += campCliques;

      const campCpa = campConversoes > 0 ? campInvestimento / campConversoes : 0;
      const campRoas = campInvestimento > 0 ? campReceita / campInvestimento : 0;

      return {
        id: c.id,
        nome: c.nome,
        status: c.status,
        investimento: Number(campInvestimento.toFixed(2)),
        conversoes: campConversoes,
        cpa: Number(campCpa.toFixed(2)),
        roas: Number(campRoas.toFixed(2))
      };
    });

    const ctrMedio = impressoesTotal > 0 ? (cliquesTotal / impressoesTotal) * 100 : 0;
    const cpaMedio = conversoesTotal > 0 ? investimentoTotal / conversoesTotal : 0;
    const roasMedio = investimentoTotal > 0 ? receitaTotal / investimentoTotal : 0;

    return {
      investimentoTotal: Number(investimentoTotal.toFixed(2)),
      receitaTotal: Number(receitaTotal.toFixed(2)),
      vendasTotal: conversoesTotal,
      conversoesTotal,
      impressoesTotal,
      cliquesTotal,
      ctrMedio: Number(ctrMedio.toFixed(2)),
      cpaMedio: Number(cpaMedio.toFixed(2)),
      roasMedio: Number(roasMedio.toFixed(2)),
      campanhas: campanhasSummary
    };
  }

  /**
   * Análise comparativa entre períodos (PDF Seção 60)
   */
  async getComparativeAnalysis(
    empresaId: string,
    _comparisonType: 'today_vs_yesterday' | '7d_vs_previous_7d' | '30d_vs_previous_30d' | 'month_vs_previous_month' = '7d_vs_previous_7d'
  ): Promise<ComparativeMetrics> {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const quatorzeDiasAtras = new Date(hoje);
    quatorzeDiasAtras.setDate(quatorzeDiasAtras.getDate() - 14);

    // Métricas do período atual (últimos 7 dias)
    const metricasAtuais = await db.campanhaMetrica.findMany({
      where: {
        campanha: { empresa_id: empresaId },
        data: { gte: seteDiasAtras }
      }
    });

    // Métricas do período anterior (7 dias anteriores)
    const metricasAnteriores = await db.campanhaMetrica.findMany({
      where: {
        campanha: { empresa_id: empresaId },
        data: { gte: quatorzeDiasAtras, lt: seteDiasAtras }
      }
    });

    const calcTotals = (list: typeof metricasAtuais) => {
      const inv = list.reduce((acc, m) => acc + m.investimento, 0);
      const rec = list.reduce((acc, m) => acc + m.receita, 0);
      const conv = list.reduce((acc, m) => acc + m.conversoes, 0);
      return {
        investimento: Number(inv.toFixed(2)),
        receita: Number(rec.toFixed(2)),
        conversoes: conv,
        roas: inv > 0 ? Number((rec / inv).toFixed(2)) : 0,
        cpa: conv > 0 ? Number((inv / conv).toFixed(2)) : 0
      };
    };

    const atual = calcTotals(metricasAtuais);
    const anterior = calcTotals(metricasAnteriores);

    const calcDelta = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Number((((cur - prev) / prev) * 100).toFixed(2));
    };

    return {
      atual,
      anterior,
      variacaoPercentual: {
        investimento: calcDelta(atual.investimento, anterior.investimento),
        receita: calcDelta(atual.receita, anterior.receita),
        conversoes: calcDelta(atual.conversoes, anterior.conversoes),
        roas: calcDelta(atual.roas, anterior.roas),
        cpa: calcDelta(atual.cpa, anterior.cpa)
      }
    };
  }
}
