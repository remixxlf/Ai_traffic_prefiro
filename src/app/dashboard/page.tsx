'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard';

function DashboardContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-6xl mx-auto">
      {empresaId ? (
        <ExecutiveDashboard empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          Selecione uma empresa para visualizar o painel executivo.
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando painel executivo...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
