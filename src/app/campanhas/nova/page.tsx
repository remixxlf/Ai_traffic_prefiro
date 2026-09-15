'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CampaignWizard from '@/components/campaigns/CampaignWizard';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

function NovaCampanhaContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {empresaId ? (
        <CampaignWizard empresaId={empresaId} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-sm">
          <p className="font-semibold text-slate-700 mb-2">Nenhuma empresa identificada</p>
          <p className="text-xs text-slate-500 mb-6">
            Acesse esta página com o parâmetro <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">?empresaId=SEU_ID</code> para iniciar o assistente.
          </p>
          <Link
            href="/campanhas"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ir para Lista de Campanhas</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function NovaCampanhaPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/campanhas"
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Campanhas</span>
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900">Assistente de Criação Guiada</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-slate-500 text-center p-12 font-medium">Carregando assistente...</div>}>
          <NovaCampanhaContent />
        </Suspense>
      </main>
    </div>
  );
}
