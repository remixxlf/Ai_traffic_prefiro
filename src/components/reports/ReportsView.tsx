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
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
        <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
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
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            tab === 'DIARIO'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📅 Resumo de Ontem (Diário)
        </button>
        <button
          onClick={() => setTab('SEMANAL')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            tab === 'SEMANAL'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📊 Relatório Semanal Consolidado
        </button>
      </div>

      {/* Relatório Diário (PDF Seção 50) */}
      {tab === 'DIARIO' && diario && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Fechamento de Desempenho Diário
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Resultados apurados cruzando dados do Meta Ads com faturamento real da Prefiro Delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 uppercase block font-medium">Investido</span>
              <p className="text-lg font-bold text-white mt-1">R$ {diario.investido?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-[11px] text-emerald-400 uppercase block font-medium">Receita Real</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">R$ {diario.receita?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 uppercase block font-medium">Pedidos</span>
              <p className="text-lg font-bold text-white mt-1">{diario.pedidos}</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-[11px] text-blue-400 uppercase block font-medium">ROAS Real</span>
              <p className="text-lg font-bold text-blue-400 mt-1">{diario.roas}x</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 col-span-2 md:col-span-1">
              <span className="text-[11px] text-purple-400 uppercase block font-medium">Custo / Pedido</span>
              <p className="text-lg font-bold text-purple-400 mt-1">R$ {diario.custoPorPedido?.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-950 p-5 rounded-2xl border border-emerald-500/20 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase block">
                🌟 Destaque de Ontem
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">{diario.destaque}</p>
            </div>

            <div className="bg-gray-950 p-5 rounded-2xl border border-amber-500/20 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase block">
                ⚠️ Ponto de Atenção
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">{diario.pontoAtencao}</p>
            </div>
          </div>
        </div>
      )}

      {/* Relatório Semanal (PDF Seção 51) */}
      {tab === 'SEMANAL' && semanal && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Análise dos Últimos 7 Dias
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Visão macro comparativa para tomada de decisões estratégicas de escala.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-xs text-gray-400 block font-medium">Investimento Total</span>
              <p className="text-xl font-bold text-white mt-1">
                R$ {semanal.resumo?.investimento?.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-xs text-emerald-400 block font-medium">Faturamento Total</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                R$ {semanal.resumo?.faturamento?.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-xs text-blue-400 block font-medium">ROAS Médio</span>
              <p className="text-xl font-bold text-blue-400 mt-1">{semanal.resumo?.roas}x</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-xs text-purple-400 block font-medium">Evolução</span>
              <p className="text-xs font-bold text-emerald-400 mt-2">
                {semanal.resumo?.evolucaoVsSemanaAnterior}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Recomendações da IA para a Próxima Semana:</h3>
            <div className="space-y-2">
              {semanal.oportunidades?.map((op: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 text-xs text-gray-300 flex items-center gap-2"
                >
                  <span className="text-blue-400">💡</span>
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
