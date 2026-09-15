'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackingDiagnostic from '@/components/tracking/TrackingDiagnostic';

function RastreamentoContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Rastreamento & Saúde da Conta</h1>
      <p className="text-gray-400 text-sm mb-6">
        Monitoramento do Meta Pixel, Conversion API e auditoria estrutural de anúncios.
      </p>

      {empresaId ? (
        <TrackingDiagnostic empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          Selecione uma empresa para visualizar o diagnóstico de rastreamento.
        </div>
      )}
    </div>
  );
}

export default function RastreamentoPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando diagnóstico...</div>}>
        <RastreamentoContent />
      </Suspense>
    </div>
  );
}
