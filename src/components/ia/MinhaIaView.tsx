'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MinhaIaViewProps {
  empresaId: string;
}

export default function MinhaIaView({ empresaId }: MinhaIaViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) return;

    fetch(`/api/minha-ia?empresaId=${empresaId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.visao) {
          setData(json.visao);
        }
      })
      .catch(err => console.error('Erro ao carregar Minha IA:', err))
      .finally(() => setLoading(false));
  }, [empresaId]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
        <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
        Consultando diagnósticos da Minha IA...
      </div>
    );
  }

  const kpis = data?.kpis7dias;
  const grupos = data?.grupos;

  return (
    <div className="space-y-6">
      {/* Resumo dos últimos 7 dias (PDF Seção 13) */}
      <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl md:text-2xl font-bold text-white">Minha IA — Diagnóstico Executivo</h2>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Sua publicidade está saudável. Acompanhe a visão analítica dos últimos 7 dias.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/aprovacoes?empresaId=${empresaId}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>🤝</span>
              <span>Centro de Aprovações</span>
            </Link>
            <Link
              href={`/automacoes?empresaId=${empresaId}`}
              className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl border border-gray-700 transition-all"
            >
              ⚙️ Guardrails
            </Link>
          </div>
        </div>

        {/* 3 KPIs de Topo dos últimos 7 dias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800">
            <span className="text-xs font-medium text-gray-400 uppercase">Investimento (7 dias)</span>
            <p className="text-2xl font-bold text-white mt-1">
              R$ {kpis?.investimento ? kpis.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </p>
            <span className="text-[11px] text-gray-500">Média de R$ {(kpis?.investimento / 7 || 0).toFixed(2)}/dia</span>
          </div>

          <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800">
            <span className="text-xs font-medium text-emerald-400 uppercase">Vendas Reais Faturadas</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              R$ {kpis?.vendas ? kpis.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </p>
            <span className="text-[11px] text-emerald-500/80">Pedidos Prefiro Delivery integrados</span>
          </div>

          <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800">
            <span className="text-xs font-medium text-blue-400 uppercase">Retorno Real (ROAS)</span>
            <p className="text-2xl font-bold text-blue-400 mt-1">{kpis?.roas || 0}x</p>
            <span className="text-[11px] text-blue-500/80">Para cada R$ 1 investido, voltaram R$ {kpis?.roas || 0}</span>
          </div>
        </div>
      </div>

      {/* 3 Grupos Estratégicos (PDF Seção 13 e 62) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Está indo bem */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-emerald-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-white text-base">Está indo bem</h3>
            <span className="text-xs text-gray-500 ml-auto">{grupos?.estaIndoBem?.length || 0}</span>
          </div>

          {grupos?.estaIndoBem && grupos.estaIndoBem.length > 0 ? (
            grupos.estaIndoBem.map((r: any) => (
              <div
                key={r.id}
                className="bg-gray-900 rounded-2xl border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    🟢 Performance Alta
                  </span>
                  <span className="text-[11px] text-gray-500">{(r.nivel_confianca * 100).toFixed(0)}% confiança</span>
                </div>
                <h4 className="font-bold text-white text-sm">{r.titulo}</h4>
                <p className="text-gray-300 text-xs leading-relaxed">{r.analise}</p>
                <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-[11px] text-gray-400">
                  💡 <strong className="text-white">Ação:</strong> {r.acao_sugerida}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 text-center text-gray-500 text-xs">
              Nenhuma campanha com destaque positivo no momento.
            </div>
          )}
        </div>

        {/* 2. Precisa de atenção */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-amber-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="font-bold text-white text-base">Precisa de atenção</h3>
            <span className="text-xs text-gray-500 ml-auto">{grupos?.precisaAtencao?.length || 0}</span>
          </div>

          {grupos?.precisaAtencao && grupos.precisaAtencao.length > 0 ? (
            grupos.precisaAtencao.map((r: any) => (
              <div
                key={r.id}
                className="bg-gray-900 rounded-2xl border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    ⚠️ Atenção Recomendada
                  </span>
                  <span className="text-[11px] text-gray-500">{(r.nivel_confianca * 100).toFixed(0)}% confiança</span>
                </div>
                <h4 className="font-bold text-white text-sm">{r.titulo}</h4>
                <p className="text-gray-300 text-xs leading-relaxed">{r.analise}</p>
                <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-[11px] text-amber-300">
                  💡 <strong className="text-white">Recomendação:</strong> {r.acao_sugerida}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 text-center text-gray-500 text-xs">
              Nenhum alerta crítico ativo nas campanhas.
            </div>
          )}
        </div>

        {/* 3. Oportunidades (PDF Seção 62) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-blue-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <h3 className="font-bold text-white text-base">Oportunidades</h3>
            <span className="text-xs text-gray-500 ml-auto">{grupos?.oportunidades?.length || 0}</span>
          </div>

          {grupos?.oportunidades && grupos.oportunidades.length > 0 ? (
            grupos.oportunidades.map((r: any) => (
              <div
                key={r.id}
                className="bg-gray-900 rounded-2xl border border-blue-500/20 p-5 hover:border-blue-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                      🚀 Oportunidade de Escala
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">Potencial: {r.impacto_prev}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{r.titulo}</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">{r.analise}</p>
                  <p className="text-gray-400 text-[11px]">
                    <strong>Motivo:</strong> {r.motivo}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <Link
                    href={`/aprovacoes?empresaId=${empresaId}`}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>Ir para Aprovações</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 text-center text-gray-500 text-xs">
              Nenhuma oportunidade de escala pendente no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
