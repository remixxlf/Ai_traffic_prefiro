'use client';

import { useState, useEffect } from 'react';

/**
 * Diagnóstico de Rastreamento & Saúde da Conta (PDF Seções 11, 55, 56, 57, 63)
 * Tela: Rastreamento
 */

interface TrackingDiagnosticProps {
  empresaId: string;
}

interface TrackingData {
  diagnostico: {
    pixelStatus: string;
    capiStatus: string;
    purchaseStatus: string;
    eventosDetectados: string[];
    ultimoEvento: string;
    problemasEncontrados: string[];
  };
}

interface ScoreData {
  auditoria: {
    scoreGeral: number;
    statusConta: string;
    itens: Array<{ item: string; status: boolean; detalhe: string; peso: number }>;
  };
  scoreTrafego: {
    scoreGeral: number;
    subscores: {
      tracking: number;
      campanhas: number;
      criativos: number;
      publicos: number;
      orcamento: number;
      conversao: number;
    };
  };
}

export default function TrackingDiagnostic({ empresaId }: TrackingDiagnosticProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [score, setScore] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trackRes, scoreRes] = await Promise.all([
        fetch(`/api/tracking?empresaId=${empresaId}`),
        fetch(`/api/score?empresaId=${empresaId}`)
      ]);

      const trackJson = await trackRes.json();
      const scoreJson = await scoreRes.json();

      if (trackJson.success) setTracking(trackJson);
      if (scoreJson.success) setScore(scoreJson);
    } catch (err) {
      console.error('Erro ao buscar diagnóstico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [empresaId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 animate-pulse shadow-sm">
        <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const diag = tracking?.diagnostico;
  const audit = score?.auditoria;
  const sub = score?.scoreTrafego.subscores;

  return (
    <div className="space-y-6">
      {/* Cards de Status do Rastreamento (PDF Seção 57) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pixel Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Meta Pixel</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              diag?.pixelStatus === 'ATIVO'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {diag?.pixelStatus === 'ATIVO' ? '🟢 Funcionando' : '🔴 Inativo'}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-3">Pixel Conectado</p>
          <span className="text-xs text-slate-400">Último evento: {diag?.ultimoEvento || 'Sem registro'}</span>
        </div>

        {/* Conversion API */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Conversion API</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              diag?.capiStatus === 'ATIVA'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {diag?.capiStatus === 'ATIVA' ? '🟢 Ativa' : '🟡 Desativada'}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-3">Envio Server-Side</p>
          <span className="text-xs text-slate-400">Resistente a bloqueadores de anúncios</span>
        </div>

        {/* Evento Purchase */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Evento Purchase</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              diag?.purchaseStatus === 'RECEBENDO_EVENTOS'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {diag?.purchaseStatus === 'RECEBENDO_EVENTOS' ? '🟢 Recebendo' : '🟡 Pendente'}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-3">Validação de Compras</p>
          <span className="text-xs text-slate-400">Essencial para otimização de vendas</span>
        </div>
      </div>

      {/* Eventos Detectados (PDF Seção 55) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-base mb-1">Eventos de Rastreamento Detectados</h3>
        <p className="text-slate-500 text-xs mb-4">Eventos monitorados continuamente pelo Pixel e Conversion API:</p>
        <div className="flex flex-wrap gap-2">
          {['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'].map(evt => {
            const detected = diag?.eventosDetectados.includes(evt);
            return (
              <span
                key={evt}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                  detected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span>{detected ? '✓' : '○'}</span>
                {evt}
              </span>
            );
          })}
        </div>
      </div>

      {/* Score de Tráfego e 6 Subscores (PDF Seção 63) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">Score de Tráfego</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Saúde Geral da Estrutura</h3>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-3xl font-black text-slate-900">{score?.scoreTrafego.scoreGeral || 0}</span>
            <span className="text-slate-400 text-sm font-semibold">/100</span>
          </div>
        </div>

        {/* 6 Subscores */}
        {sub && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Tracking', val: sub.tracking },
              { label: 'Campanhas', val: sub.campanhas },
              { label: 'Criativos', val: sub.criativos },
              { label: 'Públicos', val: sub.publicos },
              { label: 'Orçamento', val: sub.orcamento },
              { label: 'Conversão', val: sub.conversao }
            ].map(s => (
              <div key={s.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-500 text-[11px] font-semibold block">{s.label}</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">{s.val}</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${s.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist dos 11 Itens de Auditoria da Conta (PDF Seção 11) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Auditoria da Estrutura Meta (11 Itens)</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            audit?.statusConta === 'EXCELENTE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            Status: {audit?.statusConta}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {audit?.itens.map(item => (
            <div key={item.item} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {item.status ? '✓' : '✕'}
                </span>
                <div>
                  <h4 className="text-slate-900 font-semibold text-sm">{item.item}</h4>
                  <p className="text-slate-500 text-xs">{item.detalhe}</p>
                </div>
              </div>

              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                item.status ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}>
                {item.status ? 'Validado' : 'Atenção'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
