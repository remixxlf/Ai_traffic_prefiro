'use client';

import { useState, useEffect } from 'react';

/**
 * Dashboard Executivo Centrado no Negócio & Funil de Conversão
 * (PDF Seções 12, 54, 58, 59, 60, 88, 89)
 */

interface ExecutiveDashboardProps {
  empresaId: string;
}

interface DashboardData {
  overview: {
    periodoSelecionado: string;
    perguntasEssenciais: {
      quantoInvesti: number;
      quantosPedidos: number;
      custoPorPedido: number;
      quantoVoltou: number;
      retornoSobreInvestimento: number;
      saudeConta: number;
      recomendacaoIa: string;
    };
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
  };
  funnel: {
    etapas: Array<{
      etapa: number;
      nome: string;
      volume: number;
      taxaConversao: number;
      taxaGeral: number;
    }>;
    gargaloIdentificado: string;
  };
}

const PERIODOS = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'last_7d', label: 'Últimos 7 dias' },
  { id: 'last_14d', label: 'Últimos 14 dias' },
  { id: 'last_30d', label: 'Últimos 30 dias' },
  { id: 'this_month', label: 'Este mês' }
];

export default function ExecutiveDashboard({ empresaId }: ExecutiveDashboardProps) {
  const [period, setPeriod] = useState('last_7d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (p = period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/executivo?empresaId=${empresaId}&period=${p}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(period);
  }, [empresaId, period]);

  const p = data?.overview.perguntasEssenciais;
  const comp = data?.overview.comparativo;
  const funnel = data?.funnel;

  const renderDelta = (delta: number | undefined, invert = false) => {
    if (delta === undefined) return null;
    const isPositive = delta > 0;
    const isGood = invert ? !isPositive : isPositive;
    return (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
        isGood 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
          : 'bg-rose-50 text-rose-700 border-rose-200/80'
      }`}>
        {isPositive ? `+${delta}%` : `${delta}%`} vs ant.
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros Temporais (PDF Seção 59) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visão do Seu Delivery</h1>
            <p className="text-slate-500 text-sm mt-1">
              Resultados de vendas e anúncios explicados em linguagem direta de negócio.
            </p>
          </div>

          {/* Seletor de Período (PDF Seção 59) */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            {PERIODOS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPeriod(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === opt.id
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recomendação da IA (PDF Seção 12 e 87) */}
        {p?.recomendacaoIa && (
          <div className="mt-5 p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Recomendação da IA</span>
              <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{p.recomendacaoIa}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm" />
          ))}
        </div>
      ) : (
        <>
          {/* As 4 Perguntas Essenciais do Empresário (PDF Seção 12) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Quanto investi? */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">1. Quanto investi?</span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">R$ {p?.quantoInvesti.toFixed(2)}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">em anúncios</span>
                {renderDelta(comp?.investimentoVariacao)}
              </div>
            </div>

            {/* 2. Quantos pedidos entraram? */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">2. Quantos pedidos entraram?</span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{p?.quantosPedidos || 0}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">no delivery</span>
                {renderDelta(comp?.pedidosVariacao)}
              </div>
            </div>

            {/* 3. Qual o custo por pedido? */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">3. Custo por pedido</span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">R$ {p?.custoPorPedido.toFixed(2)}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">por venda</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Meta: &lt; R$ 15</span>
              </div>
            </div>

            {/* 4. Quanto voltou em vendas? */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">4. Quanto voltou em vendas?</span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">R$ {p?.quantoVoltou.toFixed(2)}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-indigo-600 font-bold">Retorno: {p?.retornoSobreInvestimento}x</span>
                {renderDelta(comp?.receitaVariacao)}
              </div>
            </div>
          </div>

          {/* Funil de Tráfego em 5 Etapas (PDF Seção 54) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Funil de Tráfego do Delivery (5 Etapas)</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Acompanhe onde os clientes estão avançando ou abandonando o pedido.
                </p>
              </div>
            </div>

            {/* Etapas do Funil */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4">
              {funnel?.etapas.map(etapa => (
                <div key={etapa.etapa} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 relative">
                  <span className="text-xs font-bold text-indigo-600">Etapa {etapa.etapa}</span>
                  <h4 className="text-slate-800 text-xs font-semibold mt-1 line-clamp-1">{etapa.nome}</h4>
                  <p className="text-xl font-bold text-slate-900 mt-2">{etapa.volume.toLocaleString('pt-BR')}</p>
                  
                  <div className="mt-2 text-[11px] text-slate-500">
                    {etapa.etapa > 1 ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {etapa.taxaConversao}% de conversão
                      </span>
                    ) : (
                      <span className="bg-slate-200/60 text-slate-700 font-medium px-2 py-0.5 rounded-full">
                        100% de alcance
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Alerta de Gargalo Identificado (PDF Seção 54) */}
            {funnel?.gargaloIdentificado && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                <span className="text-lg">🔍</span>
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Diagnóstico do Funil</span>
                  <p className="text-xs text-amber-900 mt-0.5 font-medium">{funnel.gargaloIdentificado}</p>
                </div>
              </div>
            )}
          </div>

          {/* Campanhas Mais Lucrativas (PDF Seção 58) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Campanhas que Mais Venderam</h3>
              <span className="text-xs text-slate-500">ordenadas por pedidos gerados</span>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.overview.campanhasMaisVendidas && data.overview.campanhasMaisVendidas.length > 0 ? (
                data.overview.campanhasMaisVendidas.map(c => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{c.nome}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Investido: R$ {c.investimento.toFixed(2)}</span>
                        <span>•</span>
                        <span>Custo por pedido: R$ {c.custoPorPedido.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{c.pedidos} pedidos</p>
                      <span className="text-xs text-indigo-600 font-semibold">Retorno: {c.retornoSobreInvestimento}x</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Nenhuma campanha com dados de vendas no período selecionado.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
