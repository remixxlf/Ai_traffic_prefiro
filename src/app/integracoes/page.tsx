'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import IntegrationsPanel from '@/components/integrations/IntegrationsPanel';

function IntegracoesContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Hub de Integrações</h1>
        <p className="text-slate-500 text-sm">
          Conecte e gerencie suas contas para automatizar campanhas e acompanhar resultados.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-emerald-700 text-sm font-medium">✅ Meta Ads conectada com sucesso! Seus ativos foram descobertos.</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-rose-700 text-sm font-medium">❌ Erro na conexão: {decodeURIComponent(error)}</p>
        </div>
      )}

      {empresaId ? (
        <IntegrationsPanel empresaId={empresaId} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-sm">
          <p className="font-semibold text-slate-700 mb-2">Nenhuma empresa selecionada</p>
          <p className="text-xs text-slate-500 mb-4">Selecione uma empresa na página inicial para gerenciar integrações.</p>
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

export default function IntegracoesPage() {
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
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900">Integrações</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-slate-500 text-center p-12 font-medium">Carregando integrações...</div>}>
          <IntegracoesContent />
        </Suspense>
      </main>
    </div>
  );
}
