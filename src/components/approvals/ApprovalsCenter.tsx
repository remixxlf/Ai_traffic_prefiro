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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
        <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
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
            <h2 className="text-xl font-bold text-slate-900">Centro de Aprovações (Modo Assistido)</h2>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Aqui você valida ou descarta as otimizações sugeridas pela IA com 1 clique antes que entrem em vigor na Meta.
          </p>
        </div>

        <Link
          href={`/minha-ia?empresaId=${empresaId}`}
          className="text-xs text-slate-700 hover:text-indigo-600 font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>← Ver Diagnósticos da IA</span>
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
          {feedback}
        </div>
      )}

      {aprovacoes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-100">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tudo em dia!</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Não há nenhuma solicitação pendente no momento. Quando a IA identificar uma oportunidade de escala ou necessidade de ajuste, ela aparecerá aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {aprovacoes.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {item.acaoTipo.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{item.titulo}</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(item.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-semibold block">Diagnóstico & Justificativa:</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {item.descricao}
                  </p>
                </div>

                {item.payload && item.payload.valorProposto && (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-600 font-semibold block">Alteração Proposta:</span>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-around text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Atual</span>
                        <span className="text-sm font-bold text-slate-600">
                          R$ {Number(item.payload.valorAnterior || 0).toFixed(2)}/dia
                        </span>
                      </div>
                      <span className="text-slate-300 text-lg font-bold">→</span>
                      <div>
                        <span className="text-[10px] text-emerald-700 uppercase font-bold block">Proposto</span>
                        <span className="text-sm font-bold text-emerald-600">
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
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 text-slate-600 font-semibold text-xs rounded-xl transition-all shadow-sm hover:border-slate-300"
                >
                  ✕ Recusar
                </button>
                <button
                  onClick={() => handleDecidir(item.id, 'APROVAR')}
                  disabled={processingId === item.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
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
