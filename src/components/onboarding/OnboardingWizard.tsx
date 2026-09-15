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
          data = { nome, segmento, cidade, estado };
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="flex gap-1 p-4">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        <div className="px-8 pb-8">
          {/* Step Header */}
          <p className="text-blue-400 text-sm font-medium mb-1">Passo {step} de 4</p>
          <h2 className="text-2xl font-bold text-white mb-2">{stepTitles[step - 1]}</h2>
          <p className="text-gray-400 text-sm mb-6">{stepDescriptions[step - 1]}</p>

          {/* Step 1: Dados Básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Nome do seu negócio *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Pizzaria Bella Napoli"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Tipo do negócio</label>
                <select
                  value={segmento}
                  onChange={e => setSegmento(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {SEGMENTOS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="Ex: Feira de Santana"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Estado</label>
                  <input
                    type="text"
                    value={estado}
                    onChange={e => setEstado(e.target.value)}
                    placeholder="Ex: BA"
                    maxLength={2}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dados Operacionais */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Até quantos km você entrega?</label>
                <div className="relative">
                  <input
                    type="number"
                    value={raioAtendimento}
                    onChange={e => setRaioAtendimento(e.target.value)}
                    placeholder="Ex: 8"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pr-12 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 text-sm">km</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Qual o valor médio de um pedido?</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={ticketMedio}
                    onChange={e => setTicketMedio(e.target.value)}
                    placeholder="Ex: 78.50"
                    className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Quem são seus clientes?</label>
                <input
                  type="text"
                  value={publicoAlvo}
                  onChange={e => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: Famílias e jovens adultos 18-45 anos"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Descrição curta do negócio</label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Ex: Pizzaria artesanal com delivery rápido e ingredientes selecionados"
                  rows={2}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Memória do Negócio */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Qual o horário mais forte de pedidos?</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">De</span>
                    <input
                      type="time"
                      value={horarioInicio}
                      onChange={e => setHorarioInicio(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Até</span>
                    <input
                      type="time"
                      value={horarioFim}
                      onChange={e => setHorarioFim(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Quais dias você mais vende?</label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map(dia => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        diasFortes.includes(dia)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Qual seu produto mais vendido?</label>
                <input
                  type="text"
                  value={produtoMaisVendido}
                  onChange={e => setProdutoMaisVendido(e.target.value)}
                  placeholder="Ex: Pizza Família Especial"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Prefiro Delivery */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  💡 Se você já usa a Prefiro Delivery, informe o slug do seu estabelecimento.
                  Vamos importar seus produtos automaticamente.
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Slug na Prefiro Delivery</label>
                <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500">
                  <span className="text-gray-500 text-sm pl-4">prefirodelivery.com/</span>
                  <input
                    type="text"
                    value={slugPrefiro}
                    onChange={e => setSlugPrefiro(e.target.value)}
                    placeholder="seu-negocio"
                    className="flex-1 bg-transparent text-white py-3 pr-4 focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                Você pode pular esta etapa e conectar depois em Configurações → Integrações.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-950/50 border border-red-900/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Voltar
              </button>
            )}
            <button
              onClick={submitStep}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
