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
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
        <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
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
            <h2 className="text-xl font-bold text-white">Central de Alertas & Incidentes</h2>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Monitoramento de status da conta, faturamento, Pixel, CAPI e oscilações bruscas de CPA e ROAS.
          </p>
        </div>
      </div>

      {alertas.length === 0 ? (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-gray-800 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-emerald-500/20">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Nenhum incidente ativo</h3>
            <p className="text-gray-400 text-xs max-w-md mx-auto">
              Sua conta de anúncios, catálogo e integrações de rastreamento estão operando dentro da normalidade.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {alertas.map(a => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                a.lido
                  ? 'bg-gray-900/40 border-gray-800/60 opacity-60'
                  : a.nivel === 'CRITICO'
                  ? 'bg-red-950/20 border-red-500/30'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      a.nivel === 'CRITICO'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : a.nivel === 'ATENCAO'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {a.nivel}
                  </span>
                  <h4 className="font-bold text-white text-sm">{a.titulo}</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{a.mensagem}</p>
                <span className="text-[11px] text-gray-500 block">
                  {new Date(a.created_at).toLocaleString('pt-BR')}
                </span>
              </div>

              {!a.lido && (
                <button
                  onClick={() => handleMarkAsRead(a.id)}
                  className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 rounded-xl transition-all self-end sm:self-center"
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
