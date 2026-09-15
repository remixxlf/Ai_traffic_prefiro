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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
        <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
        Consultando diagnósticos da Minha IA...
      </div>
    );
  }

  const kpis = data?.kpis7dias;
  const grupos = data?.grupos;

  return (
    <div className="space-y-6">
      {/* Resumo dos últimos 7 dias (PDF Seção 13) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Minha IA — Diagnóstico Executivo</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Sua publicidade está saudável. Acompanhe a visão analítica dos últimos 7 dias.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/aprovacoes?empresaId=${empresaId}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>🤝</span>
              <span>Centro de Aprovações</span>
            </Link>
            <Link
              href={`/automacoes?empresaId=${empresaId}`}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all shadow-sm hover:border-slate-300"
            >
              ⚙️ Guardrails
            </Link>
          </div>
        </div>

        {/* 3 KPIs de Topo dos últimos 7 dias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase">Investimento (7 dias)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              R$ {kpis?.investimento ? kpis.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">Média de R$ {(kpis?.investimento / 7 || 0).toFixed(2)}/dia</span>
          </div>

          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/60">
            <span className="text-xs font-semibold text-emerald-700 uppercase">Vendas Reais Faturadas</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              R$ {kpis?.vendas ? kpis.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Pedidos Prefiro Delivery integrados</span>
          </div>

          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200/60">
            <span className="text-xs font-semibold text-indigo-700 uppercase">Retorno Real (ROAS)</span>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{kpis?.roas || 0}x</p>
            <span className="text-[11px] text-indigo-600 font-medium">Para cada R$ 1 investido, voltaram R$ {kpis?.roas || 0}</span>
          </div>
        </div>
      </div>

      {/* 3 Grupos Estratégicos (PDF Seção 13 e 62) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Está indo bem */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-slate-900 text-base">Está indo bem</h3>
            <span className="text-xs text-slate-500 ml-auto font-semibold">{grupos?.estaIndoBem?.length || 0}</span>
          </div>

          {grupos?.estaIndoBem && grupos.estaIndoBem.length > 0 ? (
            grupos.estaIndoBem.map((r: any) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-emerald-100 p-5 hover:shadow-md transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    🟢 Performance Alta
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{(r.nivel_confianca * 100).toFixed(0)}% confiança</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{r.titulo}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{r.analise}</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  💡 <strong className="text-slate-900">Ação:</strong> {r.acao_sugerida}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs font-medium shadow-sm">
              Nenhuma campanha com destaque positivo no momento.
            </div>
          )}
        </div>

        {/* 2. Precisa de atenção */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">Precisa de atenção</h3>
            <span className="text-xs text-slate-500 ml-auto font-semibold">{grupos?.precisaAtencao?.length || 0}</span>
          </div>

          {grupos?.precisaAtencao && grupos.precisaAtencao.length > 0 ? (
            grupos.precisaAtencao.map((r: any) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-amber-100 p-5 hover:shadow-md transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                    ⚠️ Atenção Recomendada
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{(r.nivel_confianca * 100).toFixed(0)}% confiança</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{r.titulo}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{r.analise}</p>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-amber-900">
                  💡 <strong className="text-slate-900">Recomendação:</strong> {r.acao_sugerida}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs font-medium shadow-sm">
              Nenhum alerta crítico ativo nas campanhas.
            </div>
          )}
        </div>

        {/* 3. Oportunidades (PDF Seção 62) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-indigo-200">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="font-bold text-slate-900 text-base">Oportunidades</h3>
            <span className="text-xs text-slate-500 ml-auto font-semibold">{grupos?.oportunidades?.length || 0}</span>
          </div>

          {grupos?.oportunidades && grupos.oportunidades.length > 0 ? (
            grupos.oportunidades.map((r: any) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-indigo-100 p-5 hover:shadow-md transition-all space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
                      🚀 Oportunidade de Escala
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">Potencial: {r.impacto_prev}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{r.titulo}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{r.analise}</p>
                  <p className="text-slate-500 text-[11px]">
                    <strong>Motivo:</strong> {r.motivo}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/aprovacoes?empresaId=${empresaId}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>Ir para Aprovações</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs font-medium shadow-sm">
              Nenhuma oportunidade de escala pendente no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
