'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Wizard Guiado de Criação de Campanhas de Vendas
 * PDF Seções 2, 5, 14, 15, 16, 17, 18, 19, 20
 */

interface CampaignWizardProps {
  empresaId: string;
}

export default function CampaignWizard({ empresaId }: CampaignWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzingPrompt, setAnalyzingPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState<any>(null);

  // Passo 1: Intenção Livre & Produto
  const [promptTexto, setPromptTexto] = useState('');
  const [nomeCampanha, setNomeCampanha] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [urlDestino, setUrlDestino] = useState('');

  // Passo 2: Onde estão os clientes (Geolocalização)
  const [cidade, setCidade] = useState('');
  const [raioKm, setRaioKm] = useState(8);

  // Passo 3: Orçamento
  const [orcamentoDiario, setOrcamentoDiario] = useState(80);
  const [recomendacaoIa, setRecomendacaoIa] = useState<{
    orcamentoDiarioRecomendado: number;
    justificativa: string;
    opcoesRapidas: number[];
  } | null>(null);

  // Passo 4: Criativo
  const [tituloAnuncio, setTituloAnuncio] = useState('');
  const [textoPrincipal, setTextoPrincipal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cta, setCta] = useState('ORDER_NOW');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1513104890138-7c749659a591');
  const [focoEstrategia, setFocoEstrategia] = useState('BENEFICIO');

  // Carrega recomendação e dados iniciais da empresa
  useEffect(() => {
    if (!empresaId) return;

    fetch(`/api/campanhas/orcamento?empresaId=${empresaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.recomendacao) {
          setRecomendacaoIa(data.recomendacao);
          setOrcamentoDiario(data.recomendacao.orcamentoDiarioRecomendado);
        }
      })
      .catch(err => console.error('Erro ao buscar recomendação:', err));

    fetch(`/api/business-memory?empresaId=${empresaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.memory) {
          if (data.memory.cidade) setCidade(data.memory.cidade);
          if (data.memory.raio_atendimento) setRaioKm(data.memory.raio_atendimento);
          if (data.memory.produto_mais_vendido && !produtoNome) {
            setProdutoNome(data.memory.produto_mais_vendido);
          }
        }
      })
      .catch(err => console.error('Erro ao carregar dados:', err));
  }, [empresaId]);

  // Interpreta prompt com IA (Passo 1)
  const handleInterpretarPrompt = async () => {
    if (!promptTexto.trim()) return;
    setAnalyzingPrompt(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/campanhas/interpretar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, promptTexto })
      });
      const data = await res.json();
      if (data.success && data.interpretacao) {
        setProdutoNome(data.interpretacao.produtoFoco);
        setNomeCampanha(`Campanha - ${data.interpretacao.produtoFoco}`);
        setTituloAnuncio(`Peça ${data.interpretacao.produtoFoco} Quentinho em Casa`);
        setTextoPrincipal(`${data.interpretacao.sugestaoGancho} Peça online pelo nosso cardápio com entrega rápida.`);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAnalyzingPrompt(false);
    }
  };

  // Envia e publica na Meta (Passo 5)
  const handlePublicarCampanha = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          nomeCampanha: nomeCampanha || `Campanha - ${produtoNome || 'Vendas Delivery'}`,
          produtoNome: produtoNome || 'Destaque Delivery',
          orcamentoDiario: Number(orcamentoDiario),
          tipoOrcamento: 'DAILY',
          cidade: cidade || 'Minha Cidade',
          raioKm: Number(raioKm),
          urlDestino: urlDestino || 'https://prefirodelivery.com',
          criativo: {
            titulo: tituloAnuncio || `O Melhor ${produtoNome} da Cidade`,
            textoPrincipal: textoPrincipal || 'Peça agora pelo cardápio online com entrega rápida!',
            descricao,
            cta,
            imageUrl,
            focoEstrategia
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessResult(data.resultado);
      } else {
        setErrorMessage(data.error || 'Ocorreu um erro ao publicar a campanha.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="bg-gray-900 border border-emerald-500/40 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-500/40">
          🚀
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Campanha Publicada com Sucesso!</h2>
          <p className="text-gray-400 text-sm">
            A estrutura completa de vendas foi criada na Meta e já está ativa no sistema.
          </p>
        </div>

        <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800 text-left text-xs space-y-2 font-mono text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-500">ID da Campanha Meta:</span>
            <span className="text-emerald-400 font-bold">{successResult.metaCampaignId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Conjunto (Público Local):</span>
            <span className="text-blue-400 font-bold">{successResult.metaAdSetId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Anúncio Criado:</span>
            <span className="text-purple-400 font-bold">{successResult.metaAdId}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={() => router.push(`/campanhas?empresaId=${empresaId}`)}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg"
          >
            Ver Minhas Campanhas
          </button>
          <button
            onClick={() => {
              setSuccessResult(null);
              setStep(1);
            }}
            className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-all"
          >
            + Criar Outra Campanha
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Indicador de Passos */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-800">
        {[
          { num: 1, label: 'Intenção' },
          { num: 2, label: 'Região' },
          { num: 3, label: 'Orçamento' },
          { num: 4, label: 'Anúncio' },
          { num: 5, label: 'Publicar' }
        ].map(item => (
          <div key={item.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === item.num
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                  : step > item.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {step > item.num ? '✓' : item.num}
            </div>
            <span
              className={`text-xs hidden sm:inline font-medium ${
                step === item.num ? 'text-white' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Passo 1: O que deseja divulgar (PDF Seção 15 e 17) */}
      {step === 1 && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Passo 1 de 5 • O que você quer vender?
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-3">
              Conte para a IA o que você deseja divulgar
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Escreva livremente como se estivesse conversando com um gestor de tráfego. A IA cuidará da estratégia.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-300 font-semibold">
              Escreva seu objetivo em linguagem natural:
            </label>
            <div className="relative">
              <textarea
                value={promptTexto}
                onChange={e => setPromptTexto(e.target.value)}
                placeholder="Ex: Quero vender mais pizzas no fim de semana aproveitando o combo família com borda recheada..."
                className="w-full bg-gray-950 text-white rounded-2xl p-4 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm min-h-[110px]"
              />
              <button
                type="button"
                onClick={handleInterpretarPrompt}
                disabled={analyzingPrompt || !promptTexto.trim()}
                className="absolute right-3 bottom-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md"
              >
                {analyzingPrompt ? 'Analisando...' : '✨ IA: Extrair Estratégia'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                Nome do Produto ou Prato
              </label>
              <input
                type="text"
                value={produtoNome}
                onChange={e => setProdutoNome(e.target.value)}
                placeholder="Ex: Combo Família Especial"
                className="w-full bg-gray-950 text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                Nome da Campanha (Interno)
              </label>
              <input
                type="text"
                value={nomeCampanha}
                onChange={e => setNomeCampanha(e.target.value)}
                placeholder="Ex: Campanha Vendas - Fim de Semana"
                className="w-full bg-gray-950 text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Link de Destino no Prefiro Delivery (Opcional)
            </label>
            <input
              type="url"
              value={urlDestino}
              onChange={e => setUrlDestino(e.target.value)}
              placeholder="https://prefirodelivery.com/sua-loja/produto"
              className="w-full bg-gray-950 text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!produtoNome) setProdutoNome('Destaque da Casa');
                if (!nomeCampanha) setNomeCampanha(`Campanha - ${produtoNome || 'Delivery'}`);
                setStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg"
            >
              Continuar: Região e Clientes →
            </button>
          </div>
        </div>
      )}

      {/* Passo 2: Onde estão seus clientes (PDF Seção 5 e 21) */}
      {step === 2 && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Passo 2 de 5 • Onde estão seus clientes?
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-3">
              Defina o raio de entrega do seu delivery
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Não desperdice orçamento com quem mora longe demais para pedir. Foque no raio que seu delivery atende com rapidez.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                Cidade Principal
              </label>
              <input
                type="text"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Ex: Feira de Santana"
                className="w-full bg-gray-950 text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-400 font-medium">
                  Raio de Atendimento da Loja
                </label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/20 px-3 py-0.5 rounded-full border border-blue-500/30">
                  {raioKm} km de raio
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={raioKm}
                onChange={e => setRaioKm(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                <span>2 km (Bairros vizinhos)</span>
                <span>8 km (Média padrão)</span>
                <span>25 km (Cidade inteira)</span>
              </div>
            </div>

            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <p className="text-xs text-gray-300">
                Seus anúncios serão exibidos para pessoas que residem ou estão ativas em um raio de{' '}
                <strong className="text-white">{raioKm} km</strong> em{' '}
                <strong className="text-white">{cidade || 'sua localidade'}</strong>.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-all"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg"
            >
              Continuar: Orçamento Inteligente →
            </button>
          </div>
        </div>
      )}

      {/* Passo 3: Orçamento & Recomendação da IA (PDF Seções 18 e 19) */}
      {step === 3 && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Passo 3 de 5 • Quanto deseja investir?
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-3">
              Defina seu investimento diário
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              A Meta otimiza seu orçamento dia após dia para encontrar compradores no menor custo por pedido.
            </p>
          </div>

          {recomendacaoIa && (
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h3 className="text-sm font-bold text-blue-300">Recomendação da sua IA</h3>
              </div>
              <p className="text-xs text-blue-200 leading-relaxed">
                {recomendacaoIa.justificativa}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setOrcamentoDiario(recomendacaoIa.orcamentoDiarioRecomendado)}
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-all"
                >
                  ✓ Aplicar R$ {recomendacaoIa.orcamentoDiarioRecomendado.toFixed(2)}/dia recomendado
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-2">
              Opções Rápidas de Investimento por Dia:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(recomendacaoIa?.opcoesRapidas || [50, 80, 120, 200]).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setOrcamentoDiario(val)}
                  className={`p-3.5 rounded-xl border font-bold text-sm transition-all ${
                    orcamentoDiario === val
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg ring-2 ring-blue-500/30'
                      : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  R$ {val}/dia
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Ou digite um valor personalizado (mínimo R$ 10,00):
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-3 text-sm text-gray-500 font-bold">R$</span>
              <input
                type="number"
                min="10"
                step="5"
                value={orcamentoDiario}
                onChange={e => setOrcamentoDiario(Number(e.target.value))}
                className="w-full bg-gray-950 text-white text-sm pl-12 pr-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-all"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg"
            >
              Continuar: Criativo & Texto →
            </button>
          </div>
        </div>
      )}

      {/* Passo 4: Criativo e Texto do Anúncio (PDF Seções 36 e 37) */}
      {step === 4 && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Passo 4 de 5 • Criativo e Mensagem
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-3">
              Como seu anúncio vai aparecer para os clientes
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Defina a imagem, título e texto irresistível para fazer as pessoas clicarem e pedirem no seu delivery.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                Título em Destaque
              </label>
              <input
                type="text"
                value={tituloAnuncio}
                onChange={e => setTituloAnuncio(e.target.value)}
                placeholder="Ex: Fim de Semana com Pizza Especial em Casa"
                className="w-full bg-gray-950 text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                Texto Principal (Legenda Persuasiva)
              </label>
              <textarea
                value={textoPrincipal}
                onChange={e => setTextoPrincipal(e.target.value)}
                placeholder="Ex: Peça hoje o Combo Família com borda recheada grátis e receba em menos de 35 minutos quentinha na sua porta..."
                className="w-full bg-gray-950 text-white text-sm p-4 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none min-h-[90px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  URL da Imagem do Anúncio
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-gray-950 text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Botão de Chamada para Ação (CTA)
                </label>
                <select
                  value={cta}
                  onChange={e => setCta(e.target.value)}
                  className="w-full bg-gray-950 text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ORDER_NOW">Peça Agora (Recomendado)</option>
                  <option value="SHOP_NOW">Comprar Agora</option>
                  <option value="LEARN_MORE">Saiba Mais</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                Estratégia do Texto
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'PRODUTO', label: '🍕 Foco no Produto' },
                  { id: 'BENEFICIO', label: '🛵 Foco no Benefício' },
                  { id: 'URGENCIA', label: '⏳ Foco na Urgência' }
                ].map(est => (
                  <button
                    key={est.id}
                    type="button"
                    onClick={() => setFocoEstrategia(est.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      focoEstrategia === est.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {est.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-all"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg"
            >
              Continuar: Revisão Final →
            </button>
          </div>
        </div>
      )}

      {/* Passo 5: Revisão & Publicação na Meta (PDF Seção 20) */}
      {step === 5 && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Passo 5 de 5 • Revisão e Publicação
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-3">
              Tudo pronto para lançar sua campanha!
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Revise os detalhes abaixo. Ao clicar em Publicar, a plataforma criará a árvore completa de anúncios na Meta.
            </p>
          </div>

          {/* Resumo sem jargões técnicos */}
          <div className="bg-gray-950 rounded-2xl border border-gray-800 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-800/80">
              <div>
                <span className="text-xs text-gray-500 block">Produto / Prato:</span>
                <span className="text-sm font-bold text-white">{produtoNome}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Objetivo na Meta:</span>
                <span className="text-sm font-bold text-emerald-400">Vendas no Site / Delivery</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Investimento Diário:</span>
                <span className="text-sm font-bold text-blue-400">R$ {Number(orcamentoDiario).toFixed(2)} por dia</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Público / Região:</span>
                <span className="text-sm font-bold text-purple-400">
                  {cidade || 'Local'} ({raioKm} km de raio)
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-1">Prévia do Anúncio:</span>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 space-y-2">
                <p className="text-sm font-bold text-white">{tituloAnuncio}</p>
                <p className="text-xs text-gray-300 line-clamp-3">{textoPrincipal}</p>
                <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400">
                  <span>Botão: <strong className="text-white">{cta}</strong></span>
                  <span className="text-blue-400">🔗 Destino: {urlDestino || 'Prefiro Delivery'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-all disabled:opacity-50"
            >
              ← Voltar e Editar
            </button>
            <button
              onClick={handlePublicarCampanha}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando Campanha na Meta...
                </>
              ) : (
                <>🚀 Publicar Anúncio na Meta</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
