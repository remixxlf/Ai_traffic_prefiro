'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';
import TrackingDiagnostic from '@/components/tracking/TrackingDiagnostic';

function RastreamentoContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {empresaId ? (
        <TrackingDiagnostic empresaId={empresaId} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-sm max-w-xl mx-auto">
          <p className="font-semibold text-slate-700 mb-2">Nenhuma empresa selecionada</p>
          <p className="text-xs text-slate-500 mb-4">
            Selecione uma empresa na página inicial para visualizar o diagnóstico de rastreamento e auditoria técnica.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Hub</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function RastreamentoPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Hub</span>
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900">Rastreamento & Saúde da Conta</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-slate-500 text-center p-12 font-medium">Carregando diagnóstico...</div>}>
          <RastreamentoContent />
        </Suspense>
      </main>
    </div>
  );
}
