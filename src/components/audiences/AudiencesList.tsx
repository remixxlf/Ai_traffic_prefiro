'use client';

import { useState, useEffect } from 'react';

/**
 * Biblioteca de Públicos (PDF Seções 21, 22, 23, 25, 26, 89, 92)
 * 
 * Exibe a lista de públicos da empresa com nomes amigáveis de negócio:
 *   - "Meus clientes" (Custom Audience)
 *   - "Pessoas semelhantes aos meus clientes" (Lookalike)
 *   - "Público local" (Geográfico)
 *   - Sugestão inteligente de Lookalike quando há base suficiente (Seção 26)
 */

interface AudiencesListProps {
  empresaId: string;
}

interface PublicoItem {
  id: string;
  meta_audience_id: string | null;
  nome: string;
  tipo: string;
  origem: string | null;
  descricao: string | null;
  tamanho_estimado: number | null;
  cidade: string | null;
  raio_km: number | null;
  created_at: string;
}

export default function AudiencesList({ empresaId }: AudiencesListProps) {
  const [publicos, setPublicos] = useState<PublicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lookalikeEligibility, setLookalikeEligibility] = useState<{ elegivel: boolean; mensagem: string } | null>(null);

  const fetchAudiences = async () => {
    setLoading(true);
    try {
      const [pubRes, lookRes] = await Promise.all([
        fetch(`/api/publicos?empresaId=${empresaId}`),
        fetch(`/api/publicos/lookalike?empresaId=${empresaId}`)
      ]);

      const pubData = await pubRes.json();
      const lookData = await lookRes.json();

      if (pubData.success) {
        setPublicos(pubData.publicos);
      }
      if (lookData.success) {
        setLookalikeEligibility(lookData);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de públicos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
  }, [empresaId]);

  const handleSyncClientes = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/publicos/sync-clientes?empresaId=${empresaId}`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback(`✅ ${json.mensagem} (${json.detalhes.audiencesCreated.join(', ')})`);
        await fetchAudiences();
      } else {
        setFeedback(`❌ Erro: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`❌ Erro: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateLookalike = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/publicos/lookalike?empresaId=${empresaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratio: 0.01 })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`✅ Público Semelhante criado com sucesso: "${json.publico.nome}"`);
        await fetchAudiences();
      } else {
        setFeedback(`❌ Erro: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`❌ Erro: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateGeo = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/publicos/geografico?empresaId=${empresaId}`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback(`✅ Público Geográfico local criado: "${json.publico.nome}"`);
        await fetchAudiences();
      } else {
        setFeedback(`❌ Erro: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`❌ Erro: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasLookalike = publicos.some(p => p.tipo === 'LOOKALIKE');

  return (
    <div className="space-y-6">
      {/* Sugestão Inteligente de Lookalike (PDF Seção 26) */}
      {lookalikeEligibility?.elegivel && !hasLookalike && (
        <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="text-base font-bold text-white">Recomendação da IA: Público Semelhante</h3>
              </div>
              <p className="text-blue-200 text-sm mt-1.5">
                {lookalikeEligibility.mensagem}
              </p>
            </div>

            <button
              onClick={handleCreateLookalike}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition-all shadow-md disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              Criar público semelhante
            </button>
          </div>
        </div>
      )}

      {/* Header & Ações Principais */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <h2 className="text-xl font-bold text-white">Biblioteca de Públicos</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                🔒 LGPD & Hashing SHA-256
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Públicos inteligentes gerados a partir do histórico real de clientes e raio do delivery.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleCreateGeo}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-lg bg-gray-800 text-gray-200 text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              📍 Criar Público Local
            </button>
            <button
              onClick={handleSyncClientes}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              🔄 Sincronizar Clientes
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200">
            {feedback}
          </div>
        )}
      </div>

      {/* Lista de Públicos na Biblioteca (PDF Seção 23) */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-base">Públicos Disponíveis para Anúncios</h3>
          <span className="text-gray-400 text-xs">{publicos.length} públicos configurados</span>
        </div>

        <div className="divide-y divide-gray-800">
          {publicos.length > 0 ? (
            publicos.map(p => (
              <div key={p.id} className="p-5 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-white font-medium text-base">{p.nome}</h4>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      p.tipo === 'LOOKALIKE'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : p.tipo === 'GEOGRAFICO'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {p.tipo === 'LOOKALIKE'
                        ? 'Semelhante (Lookalike)'
                        : p.tipo === 'GEOGRAFICO'
                        ? 'Geográfico Local'
                        : 'Público de Clientes'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{p.descricao || 'Público otimizado para campanhas'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>Origem: {p.origem || 'Meta Ads'}</span>
                    <span>•</span>
                    <span>Alcance Estimado: ~{p.tamanho_estimado?.toLocaleString('pt-BR') || 0} pessoas</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Pronto para Anúncios
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhum público configurado. Use as ações acima para gerar públicos automaticamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
