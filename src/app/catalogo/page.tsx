'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CatalogMonitor from '@/components/catalog/CatalogMonitor';

function CatalogoContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Catálogo de Produtos</h1>
      <p className="text-gray-400 text-sm mb-6">
        Gerenciamento e monitoramento da sincronização do cardápio online com os anúncios da Meta.
      </p>

      {empresaId ? (
        <CatalogMonitor empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          Selecione uma empresa para visualizar o catálogo.
        </div>
      )}
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando catálogo...</div>}>
        <CatalogoContent />
      </Suspense>
    </div>
  );
}
