'use client';

import { useState, useEffect } from 'react';

/**
 * Central de Integrações (PDF Seção 10)
 * Tela: Configurações → Integrações → Meta
 * 
 * Exibe o status de cada ativo Meta com indicadores visuais:
 *   🟢 Conectado  |  🟡 Pendente  |  🔴 Desconectado
 */

interface IntegrationsPanelProps {
  empresaId: string;
}

interface IntegrationStatus {
  meta: { connected: boolean; status: string; lastSyncAt: string | null };
  assets: { businesses: number; adAccounts: number; pages: number; instagrams: number; pixels: number };
}

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: string; label: string }> = {
    CONECTADO: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🟢', label: 'Conectado' },
    PENDENTE: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🟡', label: 'Pendente' },
    DESCONECTADO: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔴', label: 'Desconectado' },
  };
  const cfg = config[status] || config.DESCONECTADO;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const AssetRow = ({ label, count, icon }: { label: string; count: number; icon: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="text-gray-300 text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-white font-medium text-sm">{count}</span>
      {count > 0 ? (
        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
      ) : (
        <span className="w-2 h-2 bg-gray-600 rounded-full" />
      )}
    </div>
  </div>
);

export default function IntegrationsPanel({ empresaId }: IntegrationsPanelProps) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/integracoes?empresaId=${empresaId}`);
      const data = await res.json();
      if (data.success) {
        setStatus({ meta: data.meta, assets: data.assets });
      }
    } catch (err) {
      console.error('Erro ao carregar status de integrações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [empresaId]);

  const handleConnect = () => {
    window.location.href = `/api/auth/meta?empresaId=${empresaId}`;
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar a Meta? Todos os ativos vinculados serão removidos.')) return;

    setDisconnecting(true);
    try {
      await fetch(`/api/integracoes?empresaId=${empresaId}`, { method: 'DELETE' });
      await fetchStatus();
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-48 mb-4" />
        <div className="h-4 bg-gray-800 rounded w-64 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Meta Ads</h3>
              <p className="text-gray-500 text-xs">Facebook & Instagram Ads</p>
            </div>
          </div>
          <StatusBadge status={status?.meta.status || 'DESCONECTADO'} />
        </div>

        {status?.meta.lastSyncAt && (
          <p className="text-gray-500 text-xs mt-3">
            Última sincronização: {new Date(status.meta.lastSyncAt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>

      {/* Assets */}
      {status?.meta.connected && (
        <div className="px-6 py-2">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 mt-3">Ativos Vinculados</p>
          <AssetRow label="Portfólios de Negócios" count={status.assets.businesses} icon="🏢" />
          <AssetRow label="Contas de Anúncio" count={status.assets.adAccounts} icon="📊" />
          <AssetRow label="Páginas do Facebook" count={status.assets.pages} icon="📄" />
          <AssetRow label="Contas do Instagram" count={status.assets.instagrams} icon="📸" />
          <AssetRow label="Pixels de Rastreamento" count={status.assets.pixels} icon="🎯" />
        </div>
      )}

      {/* Actions */}
      <div className="p-6 border-t border-gray-800">
        {status?.meta.connected ? (
          <div className="flex gap-3">
            <button
              onClick={fetchStatus}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-all"
            >
              🔄 Sincronizar Ativos
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-4 py-2.5 rounded-lg border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-950/30 transition-all disabled:opacity-50"
            >
              {disconnecting ? 'Desconectando...' : 'Desconectar'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Conectar com a Meta
          </button>
        )}
      </div>
    </div>
  );
}
