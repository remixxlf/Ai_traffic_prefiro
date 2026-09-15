'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Painel de Modos de Operação, Policy Engine & Guardrails
 * PDF Seções 41, 42, 43, 44, 76, 77
 */

interface PolicyEngineSettingsProps {
  empresaId: string;
}

type ModoOperacao = 'MANUAL' | 'ASSISTIDO' | 'AUTOMATICO';

export default function PolicyEngineSettings({ empresaId }: PolicyEngineSettingsProps) {
  const [modo, setModo] = useState<ModoOperacao>('ASSISTIDO');
  const [orcamentoMax, setOrcamentoMax] = useState<number>(500);
  const [pendentesAprovacao, setPendentesAprovacao] = useState(0);
  const [regras, setRegras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaId) return;

    fetch(`/api/automacoes/config?empresaId=${empresaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setModo(data.config.modoOperacao);
          setOrcamentoMax(data.config.orcamentoMaxDiario);
          setPendentesAprovacao(data.config.pendentesAprovacao || 0);
          setRegras(data.config.regras || []);
        }
      })
      .catch(err => console.error('Erro ao carregar configurações:', err))
      .finally(() => setLoading(false));
  }, [empresaId]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/automacoes/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          modo,
          orcamentoMaxDiario: Number(orcamentoMax)
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('✅ Configurações e guardrails atualizados com sucesso!');
      } else {
        setFeedback(`❌ Erro: ${data.error}`);
      }
    } catch (err: any) {
      setFeedback(`❌ Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvaliarRegras = async () => {
    setEvaluating(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/automacoes/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId })
      });
      const data = await res.json();
      if (data.success) {
        if (data.execucoes && data.execucoes.length > 0) {
          setFeedback(`⚡ Regras avaliadas: ${data.execucoes.length} ação(ões) executada(s) para proteção de orçamento.`);
        } else {
          setFeedback('🛡️ Todas as campanhas e anúncios estão dentro dos parâmetros saudáveis.');
        }
      } else {
        setFeedback(`❌ Erro: ${data.error}`);
      }
    } catch (err: any) {
      setFeedback(`❌ Erro: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
        <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
        Carregando configurações do Policy Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Modo de Operação (PDF Seção 41) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            Como a IA deve operar no seu negócio?
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Escolha o nível de controle que você deseja ter sobre as ações e otimizações executadas na sua conta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Modo MANUAL */}
          <div
            onClick={() => setModo('MANUAL')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              modo === 'MANUAL'
                ? 'bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div>
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-bold text-slate-900 text-base">Modo Manual</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed font-normal">
                A IA analisa suas métricas e gera recomendações estratégicas. Nenhuma alteração é feita na Meta sem que você execute pessoalmente.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className={`text-xs font-bold ${modo === 'MANUAL' ? 'text-indigo-600' : 'text-slate-400'}`}>
                {modo === 'MANUAL' ? '● Selecionado' : 'Selecionar'}
              </span>
            </div>
          </div>

          {/* Modo ASSISTIDO */}
          <div
            onClick={() => setModo('ASSISTIDO')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              modo === 'ASSISTIDO'
                ? 'bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="text-2xl mb-2">🤝</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RECOMENDADO
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">Modo Assistido</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed font-normal">
                A IA recomenda otimizações (ex: aumento de orçamento ou troca de criativo). Você aprova ou recusa com 1 clique no Centro de Aprovações.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className={`text-xs font-bold ${modo === 'ASSISTIDO' ? 'text-emerald-700' : 'text-slate-400'}`}>
                {modo === 'ASSISTIDO' ? '● Selecionado' : 'Selecionar'}
              </span>
              {pendentesAprovacao > 0 && (
                <span className="text-[11px] text-amber-600 font-bold">
                  {pendentesAprovacao} pendente(s)
                </span>
              )}
            </div>
          </div>

          {/* Modo AUTOMÁTICO */}
          <div
            onClick={() => setModo('AUTOMATICO')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              modo === 'AUTOMATICO'
                ? 'bg-purple-50/60 border-purple-600 ring-2 ring-purple-500/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-bold text-slate-900 text-base">Modo Automático</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed font-normal">
                A IA executa ajustes de orçamento e pausa anúncios saturados de forma autônoma, sempre respeitando os limites rígidos do Policy Engine.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className={`text-xs font-bold ${modo === 'AUTOMATICO' ? 'text-purple-700' : 'text-slate-400'}`}>
                {modo === 'AUTOMATICO' ? '● Selecionado' : 'Selecionar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Limites de Segurança & Guardrails do Policy Engine (PDF Seções 43, 76, 77) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Travas de Proteção Orçamentária
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Nenhuma ação da IA é aplicada na Meta sem antes passar pelo crivo do Policy Engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <label className="text-xs text-slate-700 font-semibold block">
              Teto Máximo Diário da Empresa
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm text-slate-400 font-bold">R$</span>
              <input
                type="number"
                min="50"
                step="50"
                value={orcamentoMax}
                onChange={e => setOrcamentoMax(Number(e.target.value))}
                className="w-full bg-white text-slate-900 font-bold text-base pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Nenhuma ação da IA poderá elevar a soma dos seus orçamentos acima deste valor diário.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-slate-900 text-xs font-bold block">Aumento Máximo por Ação</span>
                <span className="text-[11px] text-slate-500">Evita saltos orçamentários abruptos</span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                🔒 Teto de 20%
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-slate-900 text-xs font-bold block">Aumento Acumulado em 24h</span>
                <span className="text-[11px] text-slate-500">Janela de proteção contínua</span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                🔒 Teto de 30%
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-slate-900 text-xs font-bold block">Piso Mínimo Diário</span>
                <span className="text-[11px] text-slate-500">Garante aprendizado do Pixel</span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                🔒 R$ 10,00/dia
              </span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
            {feedback}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
          >
            {saving ? 'Salvando...' : '💾 Salvar Parâmetros'}
          </button>
        </div>
      </div>

      {/* Regras Determinísticas de Automação (PDF Seção 44) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Automações Determinísticas Ativas
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Gatilhos automáticos executados periodicamente para evitar desperdício de verba.
            </p>
          </div>

          <button
            onClick={handleAvaliarRegras}
            disabled={evaluating}
            className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm hover:border-slate-300"
          >
            {evaluating ? 'Avaliando...' : '⚡ Avaliar Regras Agora'}
          </button>
        </div>

        <div className="divide-y divide-slate-200 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block">
                Regra Anti-Prejuízo de Pedido
              </span>
              <p className="text-xs text-slate-600 font-mono">
                Se: <strong className="text-amber-700">CPA &gt; R$ 30,00</strong> E <strong className="text-amber-700">Gasto &gt; R$ 150,00</strong> → <span className="text-rose-600 font-semibold">Pausar Anúncio</span>
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              ATIVA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
