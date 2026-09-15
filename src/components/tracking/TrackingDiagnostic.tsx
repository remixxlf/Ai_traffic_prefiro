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
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-48 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl" />
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
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-medium uppercase">Meta Pixel</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              diag?.pixelStatus === 'ATIVO'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {diag?.pixelStatus === 'ATIVO' ? '🟢 Funcionando' : '🔴 Inativo'}
            </span>
          </div>
          <p className="text-lg font-bold text-white mt-3">Pixel Conectado</p>
          <span className="text-xs text-gray-500">Último evento: {diag?.ultimoEvento || 'Sem registro'}</span>
        </div>

        {/* Conversion API */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-medium uppercase">Conversion API</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              diag?.capiStatus === 'ATIVA'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              {diag?.capiStatus === 'ATIVA' ? '🟢 Ativa' : '🟡 Desativada'}
            </span>
          </div>
          <p className="text-lg font-bold text-white mt-3">Envio Server-Side</p>
          <span className="text-xs text-gray-500">Resistente a bloqueadores de anúncios</span>
        </div>

        {/* Evento Purchase */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-medium uppercase">Evento Purchase</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              diag?.purchaseStatus === 'RECEBENDO_EVENTOS'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              {diag?.purchaseStatus === 'RECEBENDO_EVENTOS' ? '🟢 Recebendo' : '🟡 Pendente'}
            </span>
          </div>
          <p className="text-lg font-bold text-white mt-3">Validação de Compras</p>
          <span className="text-xs text-gray-500">Essencial para otimização de vendas</span>
        </div>
      </div>

      {/* Eventos Detectados (PDF Seção 55) */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="font-semibold text-white text-base mb-2">Eventos de Rastreamento Detectados</h3>
        <p className="text-gray-400 text-xs mb-4">Eventos monitorados continuamente pelo Pixel e Conversion API:</p>
        <div className="flex flex-wrap gap-2">
          {['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'].map(evt => {
            const detected = diag?.eventosDetectados.includes(evt);
            return (
              <span
                key={evt}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  detected
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
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
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-blue-400 text-xs font-semibold uppercase">Score de Tráfego</span>
            <h3 className="text-xl font-bold text-white mt-0.5">Saúde Geral da Estrutura</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-white">{score?.scoreTrafego.scoreGeral || 0}</span>
            <span className="text-gray-400 text-sm">/100</span>
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
              <div key={s.label} className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center">
                <span className="text-gray-400 text-[11px] block">{s.label}</span>
                <span className="text-lg font-bold text-white mt-1 block">{s.val}</span>
                <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${s.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist dos 11 Itens de Auditoria da Conta (PDF Seção 11) */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-base">Auditoria da Estrutura Meta (11 Itens)</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            audit?.statusConta === 'EXCELENTE'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            Status: {audit?.statusConta}
          </span>
        </div>

        <div className="divide-y divide-gray-800">
          {audit?.itens.map(item => (
            <div key={item.item} className="p-4 flex items-center justify-between hover:bg-gray-800/30">
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {item.status ? '✓' : '✕'}
                </span>
                <div>
                  <h4 className="text-white font-medium text-sm">{item.item}</h4>
                  <p className="text-gray-400 text-xs">{item.detalhe}</p>
                </div>
              </div>

              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                item.status ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
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
