'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import IntegrationsPanel from '@/components/integrations/IntegrationsPanel';

function IntegracoesContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Integrações</h1>
      <p className="text-gray-400 text-sm mb-6">
        Conecte e gerencie suas contas para automatizar campanhas e acompanhar resultados.
      </p>

      {success && (
        <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-900/50 rounded-lg">
          <p className="text-emerald-400 text-sm">✅ Meta Ads conectada com sucesso! Seus ativos foram descobertos.</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 rounded-lg">
          <p className="text-red-400 text-sm">❌ Erro na conexão: {decodeURIComponent(error)}</p>
        </div>
      )}

      {empresaId ? (
        <IntegrationsPanel empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
          <p className="text-gray-400">Selecione uma empresa para gerenciar integrações.</p>
        </div>
      )}
    </div>
  );
}

export default function IntegracoesPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando integrações...</div>}>
        <IntegracoesContent />
      </Suspense>
    </div>
  );
}
