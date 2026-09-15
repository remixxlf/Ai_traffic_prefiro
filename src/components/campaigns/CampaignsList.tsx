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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
        <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
        Carregando campanhas ativas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Minhas Campanhas</h2>
          <p className="text-slate-500 text-sm">
            Gerenciamento simplificado dos seus anúncios no Meta Ads.
          </p>
        </div>
        <Link
          href={`/campanhas/nova?empresaId=${empresaId}`}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2"
        >
          <span>+</span>
          <span>Criar Campanha</span>
        </Link>
      </div>

      {campanhas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            📢
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma campanha criada ainda</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Utilize o assistente com IA para criar sua primeira campanha de vendas no delivery em poucos minutos.
            </p>
          </div>
          <Link
            href={`/campanhas/nova?empresaId=${empresaId}`}
            className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            + Criar Minha Primeira Campanha
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campanhas.map(campanha => (
            <div
              key={campanha.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-slate-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      campanha.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                  <h3 className="font-semibold text-slate-900 text-base">{campanha.nome}</h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    {campanha.objetivo === 'OUTCOME_SALES' ? 'Vendas no Delivery' : campanha.objetivo}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>
                    Investimento:{' '}
                    <strong className="text-slate-800">
                      R$ {campanha.orcamentoDiario ? campanha.orcamentoDiario.toFixed(2) : '0.00'}/dia
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Estrutura:{' '}
                    <strong className="text-slate-800">
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
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs transition-all border border-slate-200/60"
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
