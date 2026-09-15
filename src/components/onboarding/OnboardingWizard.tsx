'use client';

import { useState } from 'react';

/**
 * Wizard de Onboarding Guiado (PDF Seções 5, 8, 88, 89)
 * 
 * Experiência conversacional em 4 passos sem jargões técnicos:
 *   Passo 1: "Vamos conhecer o seu negócio" — dados básicos
 *   Passo 2: "Como funciona o seu delivery?" — dados operacionais
 *   Passo 3: "Conte mais sobre seus clientes" — memória do negócio
 *   Passo 4: "Conecte com a Prefiro Delivery" — slug e auto-preenchimento
 */

interface OnboardingWizardProps {
  usuarioId: string;
  onComplete: (empresaId: string) => void;
}

const SEGMENTOS = [
  'Pizzaria',
  'Hamburgueria',
  'Restaurante',
  'Açaí / Sorvetes',
  'Padaria / Confeitaria',
  'Sushi / Japonesa',
  'Marmitex / Comida Caseira',
  'Outro'
];

export default function OnboardingWizard({ usuarioId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Passo 1
  const [nome, setNome] = useState('');
  const [segmento, setSegmento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [site, setSite] = useState('');

  // Passo 2
  const [raioAtendimento, setRaioAtendimento] = useState('');
  const [ticketMedio, setTicketMedio] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [descricao, setDescricao] = useState('');

  // Passo 3
  const [horarioInicio, setHorarioInicio] = useState('19:00');
  const [horarioFim, setHorarioFim] = useState('23:00');
  const [diasFortes, setDiasFortes] = useState<string[]>([]);
  const [produtoMaisVendido, setProdutoMaisVendido] = useState('');

  // Passo 4
  const [slugPrefiro, setSlugPrefiro] = useState('');

  const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

  const toggleDia = (dia: string) => {
    setDiasFortes(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const submitStep = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: Record<string, any> = {};

      switch (step) {
        case 1:
          if (!nome.trim()) { setError('Nome do negócio é obrigatório.'); setLoading(false); return; }
          data = { nome, segmento, cidade, estado, site: site || undefined };
          break;
        case 2:
          data = {
            raio_atendimento: raioAtendimento ? parseFloat(raioAtendimento) : undefined,
            ticket_medio: ticketMedio ? parseFloat(ticketMedio) : undefined,
            publico_alvo: publicoAlvo || undefined,
            descricao: descricao || undefined
          };
          break;
        case 3:
          data = {
            horario_forte_inicio: horarioInicio,
            horario_forte_fim: horarioFim,
            dias_fortes: diasFortes.join(', '),
            produto_mais_vendido: produtoMaisVendido || undefined
          };
          break;
        case 4:
          data = { slug_prefiro: slugPrefiro || undefined };
          break;
      }

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          empresaId,
          usuarioId,
          data
        })
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Erro ao processar.');
        setLoading(false);
        return;
      }

      if (step === 1) {
        setEmpresaId(result.empresa.id);
      }

      if (step < 4) {
        setStep(step + 1);
      } else {
        onComplete(result.empresa.id);
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Vamos conhecer o seu negócio',
    'Como funciona o seu delivery?',
    'Conte mais sobre seus melhores momentos',
    'Conecte com a Prefiro Delivery'
  ];

  const stepDescriptions = [
    'Essas informações ajudam a criar campanhas mais certeiras para o seu público.',
    'Entendendo sua operação, a IA pode recomendar estratégias melhores.',
    'Saber quando você mais vende ajuda a investir no momento certo.',
    'Se você usa a Prefiro Delivery, podemos importar seus produtos automaticamente.'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Canny-style brand indicator */}
      <div className="mb-6 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
          <span className="font-bold text-sm">IA</span>
        </div>
        <span className="font-bold text-base text-slate-900 tracking-tight">Tráfego IA <span className="text-indigo-600">Delivery</span></span>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Progress Bar - Canny Style */}
        <div className="flex gap-1.5 p-6 pb-0">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {/* Step Header */}
          <div className="mb-6">
            <span className="inline-block text-[11px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full mb-2">
              Passo {step} de 4
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{stepTitles[step - 1]}</h2>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">{stepDescriptions[step - 1]}</p>
          </div>

          {/* Step 1: Dados Básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nome do seu negócio *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Pizzaria Bella Napoli"
                  className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tipo do negócio
                </label>
                <select
                  value={segmento}
                  onChange={e => setSegmento(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm font-medium"
                >
                  <option value="">Selecione...</option>
                  {SEGMENTOS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="Ex: Feira de Santana"
                    className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={estado}
                    onChange={e => setEstado(e.target.value)}
                    placeholder="Ex: BA"
                    maxLength={2}
                    className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm uppercase font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Site do negócio
                </label>
                <input
                  type="url"
                  value={site}
                  onChange={e => setSite(e.target.value)}
                  placeholder="Ex: https://www.suapizzaria.com.br"
                  className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Step 2: Dados Operacionais */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Até quantos km você entrega?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={raioAtendimento}
                    onChange={e => setRaioAtendimento(e.target.value)}
                    placeholder="Ex: 8"
                    className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 pr-12 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">km</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Qual o valor médio de um pedido?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-medium">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={ticketMedio}
                    onChange={e => setTicketMedio(e.target.value)}
                    placeholder="Ex: 78.50"
                    className="w-full bg-white text-slate-900 rounded-xl pl-12 pr-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Quem são seus clientes?
                </label>
                <input
                  type="text"
                  value={publicoAlvo}
                  onChange={e => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: Famílias e jovens adultos 18-45 anos"
                  className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Descrição curta do negócio
                </label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Ex: Pizzaria artesanal com delivery rápido e ingredientes selecionados"
                  rows={2}
                  className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Memória do Negócio */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Qual o horário mais forte de pedidos?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 mb-1">De</span>
                    <input
                      type="time"
                      value={horarioInicio}
                      onChange={e => setHorarioInicio(e.target.value)}
                      className="w-full bg-white text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 mb-1">Até</span>
                    <input
                      type="time"
                      value={horarioFim}
                      onChange={e => setHorarioFim(e.target.value)}
                      className="w-full bg-white text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Quais dias você mais vende?
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map(dia => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        diasFortes.includes(dia)
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Qual seu produto mais vendido?
                </label>
                <input
                  type="text"
                  value={produtoMaisVendido}
                  onChange={e => setProdutoMaisVendido(e.target.value)}
                  placeholder="Ex: Pizza Família Especial"
                  className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Step 4: Prefiro Delivery */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4">
                <p className="text-indigo-900 text-sm leading-relaxed">
                  💡 Se você já usa a Prefiro Delivery, informe o slug do seu estabelecimento.
                  Vamos importar seus produtos automaticamente.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Slug na Prefiro Delivery
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/10 shadow-sm overflow-hidden">
                  <span className="text-slate-400 text-sm pl-4 font-medium">prefirodelivery.com/</span>
                  <input
                    type="text"
                    value={slugPrefiro}
                    onChange={e => setSlugPrefiro(e.target.value)}
                    placeholder="seu-negocio"
                    className="flex-1 bg-transparent text-slate-900 py-3 pr-4 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <p className="text-slate-500 text-xs">
                Você pode pular esta etapa e conectar depois em Configurações → Integrações.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-rose-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-sm transition-all shadow-sm disabled:opacity-50"
              >
                Voltar
              </button>
            )}
            <button
              onClick={submitStep}
              disabled={loading}
              className="flex-1 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : step === 4 ? (
                slugPrefiro ? 'Conectar e Finalizar' : 'Pular e Finalizar'
              ) : (
                'Continuar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
