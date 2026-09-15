'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import ReportsView from '@/components/reports/ReportsView';

function RelatoriosContent() {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Relatórios Executivos</h1>
          <p className="text-slate-500 text-sm">
            Acompanhe o fechamento diário e a evolução semanal com os dados consolidados do seu delivery.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
          <span className="text-xs font-semibold text-slate-500">ID da Empresa:</span>
          <input
            type="text"
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            placeholder="Cole o ID da empresa"
            className="bg-white text-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 w-48 font-mono shadow-inner"
          />
        </div>
      </div>

      {empresaId ? (
        <ReportsView empresaId={empresaId} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-sm max-w-xl mx-auto">
          <p className="font-semibold text-slate-700 mb-2">Nenhuma empresa selecionada</p>
          <p className="text-xs text-slate-500 mb-4">
            Informe o ID da sua empresa no campo acima ou selecione uma empresa no Hub inicial.
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

export default function RelatoriosPage() {
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
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900">Relatórios Executivos</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-slate-500 text-center p-12 font-medium">Carregando relatórios executivos...</div>}>
          <RelatoriosContent />
        </Suspense>
      </main>
    </div>
  );
}
