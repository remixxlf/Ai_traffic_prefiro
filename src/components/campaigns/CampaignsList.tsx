'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CampaignItem {
  id: string;
  nome: string;
  status: string;
  objetivo: string;
  orcamentoDiario: number | null;
  tipoAnuncio: string;
  conjuntosCount: number;
  anunciosCount: number;
  ultimaMetrica: any;
  createdAt: string;
}

interface CampaignsListProps {
  empresaId: string;
}

export default function CampaignsList({ empresaId }: CampaignsListProps) {
  const [campanhas, setCampanhas] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) return;

    fetch(`/api/campanhas?empresaId=${empresaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.campanhas) {
          setCampanhas(data.campanhas);
        }
      })
      .catch(err => console.error('Erro ao listar campanhas:', err))
      .finally(() => setLoading(false));
  }, [empresaId]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
        <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
        Carregando campanhas ativas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Minhas Campanhas</h2>
          <p className="text-gray-400 text-sm">
            Gerenciamento simplificado dos seus anúncios no Meta Ads.
          </p>
        </div>
        <Link
          href={`/campanhas/nova?empresaId=${empresaId}`}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center gap-2"
        >
          <span>+</span>
          <span>Criar Campanha</span>
        </Link>
      </div>

      {campanhas.length === 0 ? (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-800 text-gray-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            📢
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Nenhuma campanha criada ainda</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Utilize o assistente com IA para criar sua primeira campanha de vendas no delivery em poucos minutos.
            </p>
          </div>
          <Link
            href={`/campanhas/nova?empresaId=${empresaId}`}
            className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md"
          >
            + Criar Minha Primeira Campanha
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campanhas.map(campanha => (
            <div
              key={campanha.id}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      campanha.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <h3 className="font-bold text-white text-base">{campanha.nome}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                    {campanha.objetivo === 'OUTCOME_SALES' ? 'Vendas no Delivery' : campanha.objetivo}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span>
                    Investimento:{' '}
                    <strong className="text-white">
                      R$ {campanha.orcamentoDiario ? campanha.orcamentoDiario.toFixed(2) : '0.00'}/dia
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Estrutura:{' '}
                    <strong className="text-white">
                      {campanha.conjuntosCount} conjunto(s), {campanha.anunciosCount} anúncio(s)
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Criada em:{' '}
                    {new Date(campanha.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard?empresaId=${empresaId}`}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs transition-all"
                >
                  Ver Métricas
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
