'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CreativesLibrary from '@/components/creatives/CreativesLibrary';

function CriativosContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-6xl mx-auto">
      {empresaId ? (
        <CreativesLibrary empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          Selecione uma empresa para visualizar a biblioteca de criativos.
        </div>
      )}
    </div>
  );
}

export default function CriativosPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando criativos...</div>}>
        <CriativosContent />
      </Suspense>
    </div>
  );
}
