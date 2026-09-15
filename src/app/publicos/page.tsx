'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AudiencesList from '@/components/audiences/AudiencesList';

function PublicosContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Públicos</h1>
      <p className="text-gray-400 text-sm mb-6">
        Crie e gerencie os públicos das suas campanhas com base nos dados reais do seu negócio.
      </p>

      {empresaId ? (
        <AudiencesList empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          Selecione uma empresa para visualizar os públicos.
        </div>
      )}
    </div>
  );
}

export default function PublicosPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando públicos...</div>}>
        <PublicosContent />
      </Suspense>
    </div>
  );
}
