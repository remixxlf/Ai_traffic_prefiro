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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 animate-pulse shadow-sm">
        <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
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
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="text-base font-bold text-slate-900">Recomendação da IA: Público Semelhante</h3>
              </div>
              <p className="text-indigo-900/80 text-sm mt-1.5 font-medium">
                {lookalikeEligibility.mensagem}
              </p>
            </div>

            <button
              onClick={handleCreateLookalike}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              Criar público semelhante
            </button>
          </div>
        </div>
      )}

      {/* Header & Ações Principais */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <h2 className="text-xl font-bold text-slate-900">Biblioteca de Públicos</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                🔒 LGPD & Hashing SHA-256
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Públicos inteligentes gerados a partir do histórico real de clientes e raio do delivery.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleCreateGeo}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-sm transition-all disabled:opacity-50 hover:border-slate-300"
            >
              📍 Criar Público Local
            </button>
            <button
              onClick={handleSyncClientes}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
            >
              🔄 Sincronizar Clientes
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            {feedback}
          </div>
        )}
      </div>

      {/* Lista de Públicos na Biblioteca (PDF Seção 23) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Públicos Disponíveis para Anúncios</h3>
          <span className="text-slate-500 text-xs font-medium">{publicos.length} públicos configurados</span>
        </div>

        <div className="divide-y divide-slate-100">
          {publicos.length > 0 ? (
            publicos.map(p => (
              <div key={p.id} className="p-5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-slate-900 font-semibold text-base">{p.nome}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      p.tipo === 'LOOKALIKE'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : p.tipo === 'GEOGRAFICO'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {p.tipo === 'LOOKALIKE'
                        ? 'Semelhante (Lookalike)'
                        : p.tipo === 'GEOGRAFICO'
                        ? 'Geográfico Local'
                        : 'Público de Clientes'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{p.descricao || 'Público otimizado para campanhas'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                    <span>Origem: {p.origem || 'Meta Ads'}</span>
                    <span>•</span>
                    <span>Alcance Estimado: ~{p.tamanho_estimado?.toLocaleString('pt-BR') || 0} pessoas</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    🟢 Pronto para Anúncios
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              Nenhum público configurado. Use as ações acima para gerar públicos automaticamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
