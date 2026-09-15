'use client';

import { useState, useEffect } from 'react';

interface ReportsViewProps {
  empresaId: string;
}

export default function ReportsView({ empresaId }: ReportsViewProps) {
  const [tab, setTab] = useState<'DIARIO' | 'SEMANAL'>('DIARIO');
  const [diario, setDiario] = useState<any>(null);
  const [semanal, setSemanal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/relatorios/diario?empresaId=${empresaId}`).then(r => r.json()),
      fetch(`/api/relatorios/semanal?empresaId=${empresaId}`).then(r => r.json())
    ])
      .then(([resD, resS]) => {
        if (resD.success) setDiario(resD.relatorio);
        if (resS.success) setSemanal(resS.relatorio);
      })
      .catch(err => console.error('Erro ao buscar relatórios:', err))
      .finally(() => setLoading(false));
  }, [empresaId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
        <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
        Consolidando relatórios analíticos da IA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab('DIARIO')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            tab === 'DIARIO'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
        >
          📅 Resumo de Ontem (Diário)
        </button>
        <button
          onClick={() => setTab('SEMANAL')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            tab === 'SEMANAL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
        >
          📊 Relatório Semanal Consolidado
        </button>
      </div>

      {/* Relatório Diário (PDF Seção 50) */}
      {tab === 'DIARIO' && diario && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Fechamento de Desempenho Diário
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Resultados apurados cruzando dados do Meta Ads com faturamento real da Prefiro Delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 uppercase block font-semibold">Investido</span>
              <p className="text-lg font-bold text-slate-900 mt-1">R$ {diario.investido?.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] text-emerald-700 uppercase block font-semibold">Receita Real</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">R$ {diario.receita?.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 uppercase block font-semibold">Pedidos</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{diario.pedidos}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] text-indigo-700 uppercase block font-semibold">ROAS Real</span>
              <p className="text-lg font-bold text-indigo-700 mt-1">{diario.roas}x</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 md:col-span-1">
              <span className="text-[11px] text-slate-500 uppercase block font-semibold">Custo / Pedido</span>
              <p className="text-lg font-bold text-slate-900 mt-1">R$ {diario.custoPorPedido?.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/60 space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 uppercase block">
                🌟 Destaque de Ontem
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">{diario.destaque}</p>
            </div>

            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 space-y-1.5">
              <span className="text-xs font-bold text-amber-800 uppercase block">
                ⚠️ Ponto de Atenção
              </span>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">{diario.pontoAtencao}</p>
            </div>
          </div>
        </div>
      )}

      {/* Relatório Semanal (PDF Seção 51) */}
      {tab === 'SEMANAL' && semanal && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Análise dos Últimos 7 Dias
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Visão macro comparativa para tomada de decisões estratégicas de escala.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block font-semibold">Investimento Total</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                R$ {semanal.resumo?.investimento?.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-emerald-700 block font-semibold">Faturamento Total</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                R$ {semanal.resumo?.faturamento?.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-indigo-700 block font-semibold">ROAS Médio</span>
              <p className="text-xl font-bold text-indigo-700 mt-1">{semanal.resumo?.roas}x</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block font-semibold">Evolução</span>
              <p className="text-xs font-bold text-emerald-700 mt-2">
                {semanal.resumo?.evolucaoVsSemanaAnterior}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Recomendações da IA para a Próxima Semana:</h3>
            <div className="space-y-2">
              {semanal.oportunidades?.map((op: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center gap-2"
                >
                  <span className="text-indigo-600">💡</span>
                  <span>{op}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
