'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CampaignsList from '@/components/campaigns/CampaignsList';

function CampanhasContent() {
  const searchParams = useSearchParams();
  const queryEmpresaId = searchParams.get('empresaId') || '';
  const [empresaId, setEmpresaId] = useState(queryEmpresaId);

  useEffect(() => {
    if (queryEmpresaId) {
      setEmpresaId(queryEmpresaId);
    }
  }, [queryEmpresaId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Campanhas de Vendas</h1>
          <p className="text-gray-400 text-sm">
            Gerencie e acompanhe o desempenho dos seus anúncios no Meta Ads.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-xl border border-gray-800">
          <span className="text-xs text-gray-400">ID da Empresa:</span>
          <input
            type="text"
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            placeholder="Cole o ID da empresa"
            className="bg-gray-950 text-white text-xs px-2.5 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-blue-500 w-48 font-mono"
          />
        </div>
      </div>

      {empresaId ? (
        <CampaignsList empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          <p className="mb-2">⚠️ Nenhuma empresa selecionada.</p>
          <p className="text-xs text-gray-500">
            Informe o ID da sua empresa acima ou passe via parâmetro <code className="text-blue-400">?empresaId=SEU_ID</code>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CampanhasPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando campanhas...</div>}>
        <CampanhasContent />
      </Suspense>
    </div>
  );
}
