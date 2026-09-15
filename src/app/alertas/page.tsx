'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AlertsCenter from '@/components/alerts/AlertsCenter';

function AlertasContent() {
  const searchParams = useSearchParams();
  const queryEmpresaId = searchParams.get('empresaId') || '';
  const [empresaId, setEmpresaId] = useState(queryEmpresaId);

  useEffect(() => {
    if (queryEmpresaId) {
      setEmpresaId(queryEmpresaId);
    }
  }, [queryEmpresaId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Central de Notificações & Alertas</h1>
          <p className="text-gray-400 text-sm">
            Fique por dentro de qualquer anomalia de faturamento, catálogo ou desempenho de tráfego.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-xl border border-gray-800">
          <span className="text-xs text-gray-400">ID da Empresa:</span>
          <input
            type="text"
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            placeholder="Cole o ID da empresa"
            className="bg-gray-950 text-white text-xs px-2.5 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-blue-500 w-48 font-mono"
          />
        </div>
      </div>

      {empresaId ? (
        <AlertsCenter empresaId={empresaId} />
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
          <p className="mb-2">⚠️ Nenhuma empresa informada.</p>
          <p className="text-xs text-gray-500">
            Informe o ID da sua empresa no campo acima ou acesse através de <code className="text-blue-400">/alertas?empresaId=SEU_ID</code>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AlertasPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={<div className="text-gray-400 text-center p-8">Carregando central de alertas...</div>}>
        <AlertasContent />
      </Suspense>
    </div>
  );
}
