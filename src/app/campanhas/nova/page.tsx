'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CampaignWizard from '@/components/campaigns/CampaignWizard';
import Link from 'next/link';

function NovaCampanhaContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId') || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/campanhas?empresaId=${empresaId}`}
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 transition-all"
        >
          ← Voltar para Campanhas
        </Link>
        <span className="text-xs text-gray-500">|</span>
        <span className="text-xs text-blue-400 font-semibold">Assistente de Criação Guiada</span>
      </div>

      {empresaId ? (
        <CampaignWizard empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          <p className="mb-2">⚠️ Nenhuma empresa identificada.</p>
          <p className="text-xs text-gray-500">
            Acesse esta página com o parâmetro <code className="text-blue-400">?empresaId=SEU_ID</code> para iniciar o assistente.
          </p>
        </div>
      )}
    </div>
  );
}

export default function NovaCampanhaPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando assistente...</div>}>
        <NovaCampanhaContent />
      </Suspense>
    </div>
  );
}
