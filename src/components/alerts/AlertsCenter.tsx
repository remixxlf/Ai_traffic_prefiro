'use client';

import { useState, useEffect } from 'react';

interface AlertsCenterProps {
  empresaId: string;
}

export default function AlertsCenter({ empresaId }: AlertsCenterProps) {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alertas?empresaId=${empresaId}`);
      const json = await res.json();
      if (json.success) {
        setAlertas(json.alertas);
      }
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) fetchAlertas();
  }, [empresaId]);

  const handleMarkAsRead = async (alertaId: string) => {
    try {
      const res = await fetch('/api/alertas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertaId })
      });
      const json = await res.json();
      if (json.success) {
        setAlertas(prev =>
          prev.map(a => (a.id === alertaId ? { ...a, lido: true } : a))
        );
      }
    } catch (err) {
      console.error('Erro ao marcar lido:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
        <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
        Carregando central de notificações e alertas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <h2 className="text-xl font-bold text-slate-900">Central de Alertas & Incidentes</h2>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Monitoramento de status da conta, faturamento, Pixel, CAPI e oscilações bruscas de CPA e ROAS.
          </p>
        </div>
      </div>

      {alertas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-100">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum incidente ativo</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Sua conta de anúncios, catálogo e integrações de rastreamento estão operando dentro da normalidade.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {alertas.map(a => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                a.lido
                  ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                  : a.nivel === 'CRITICO'
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      a.nivel === 'CRITICO'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : a.nivel === 'ATENCAO'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {a.nivel}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{a.titulo}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{a.mensagem}</p>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {new Date(a.created_at).toLocaleString('pt-BR')}
                </span>
              </div>

              {!a.lido && (
                <button
                  onClick={() => handleMarkAsRead(a.id)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm rounded-xl transition-all self-end sm:self-center hover:border-slate-300"
                >
                  Marcar como Lido
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
