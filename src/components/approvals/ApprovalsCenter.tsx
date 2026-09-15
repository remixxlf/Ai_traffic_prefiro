'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApprovalsCenterProps {
  empresaId: string;
}

export default function ApprovalsCenter({ empresaId }: ApprovalsCenterProps) {
  const [aprovacoes, setAprovacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAprovacoes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aprovacoes?empresaId=${empresaId}`);
      const json = await res.json();
      if (json.success) {
        setAprovacoes(json.aprovacoes);
      }
    } catch (err) {
      console.error('Erro ao buscar aprovações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      fetchAprovacoes();
    }
  }, [empresaId]);

  const handleDecidir = async (aprovacaoId: string, decisao: 'APROVAR' | 'RECUSAR') => {
    setProcessingId(aprovacaoId);
    setFeedback(null);
    try {
      const res = await fetch('/api/aprovacoes/decidir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovacaoId, decisao })
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(
          decisao === 'APROVAR'
            ? '✅ Solicitação aprovada e executada com sucesso na Meta!'
            : '🛑 Solicitação recusada e arquivada.'
        );
        await fetchAprovacoes();
      } else {
        setFeedback(`❌ Erro: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`❌ Erro: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
        <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
        Carregando Centro de Aprovações...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <h2 className="text-xl font-bold text-white">Centro de Aprovações (Modo Assistido)</h2>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Aqui você valida ou descarta as otimizações sugeridas pela IA com 1 clique antes que entrem em vigor na Meta.
          </p>
        </div>

        <Link
          href={`/minha-ia?empresaId=${empresaId}`}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 transition-all flex items-center gap-1.5"
        >
          <span>← Ver Diagnósticos da IA</span>
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300">
          {feedback}
        </div>
      )}

      {aprovacoes.length === 0 ? (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-800 text-gray-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Tudo em dia!</h3>
            <p className="text-gray-400 text-xs max-w-md mx-auto">
              Não há nenhuma solicitação pendente no momento. Quando a IA identificar uma oportunidade de escala ou necessidade de ajuste, ela aparecerá aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {aprovacoes.map(item => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4 hover:border-gray-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {item.acaoTipo.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-white text-base">{item.titulo}</h3>
                </div>
                <span className="text-[11px] text-gray-500">
                  {new Date(item.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-medium block">Diagnóstico & Justificativa:</span>
                  <p className="text-xs text-gray-300 leading-relaxed bg-gray-950 p-3 rounded-xl border border-gray-800">
                    {item.descricao}
                  </p>
                </div>

                {item.payload && item.payload.valorProposto && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-medium block">Alteração Proposta:</span>
                    <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex items-center justify-around text-center">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block">Atual</span>
                        <span className="text-sm font-bold text-gray-400">
                          R$ {Number(item.payload.valorAnterior || 0).toFixed(2)}/dia
                        </span>
                      </div>
                      <span className="text-gray-600 text-lg font-bold">→</span>
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase block font-bold">Proposto</span>
                        <span className="text-sm font-bold text-emerald-400">
                          R$ {Number(item.payload.valorProposto).toFixed(2)}/dia
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDecidir(item.id, 'RECUSAR')}
                  disabled={processingId === item.id}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 font-semibold text-xs rounded-xl transition-all"
                >
                  ✕ Recusar
                </button>
                <button
                  onClick={() => handleDecidir(item.id, 'APROVAR')}
                  disabled={processingId === item.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  {processingId === item.id ? (
                    'Processando...'
                  ) : (
                    <>✓ Aprovar e Executar</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
