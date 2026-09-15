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
      <div className="bg-white border border-emerald-200 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-200">
          🚀
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Campanha Publicada com Sucesso!</h2>
          <p className="text-slate-500 text-sm">
            A estrutura completa de vendas foi criada na Meta e já está ativa no sistema.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2 font-mono text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">ID da Campanha Meta:</span>
            <span className="text-emerald-600 font-bold">{successResult.metaCampaignId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Conjunto (Público Local):</span>
            <span className="text-indigo-600 font-bold">{successResult.metaAdSetId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Anúncio Criado:</span>
            <span className="text-purple-600 font-bold">{successResult.metaAdId}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={() => router.push(`/campanhas?empresaId=${empresaId}`)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Ver Minhas Campanhas
          </button>
          <button
            onClick={() => {
              setSuccessResult(null);
              setStep(1);
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-sm transition-all border border-slate-200/80"
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
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
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
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/10'
                  : step > item.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > item.num ? '✓' : item.num}
            </div>
            <span
              className={`text-xs hidden sm:inline font-medium ${
                step === item.num ? 'text-slate-900 font-semibold' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Passo 1: O que deseja divulgar (PDF Seção 15 e 17) */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Passo 1 de 5 • O que você quer vender?
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
              Conte para a IA o que você deseja divulgar
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Escreva livremente como se estivesse conversando com um gestor de tráfego. A IA cuidará da estratégia.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-600 font-semibold block">
              Escreva seu objetivo em linguagem natural:
            </label>
            <div className="relative">
              <textarea
                value={promptTexto}
                onChange={e => setPromptTexto(e.target.value)}
                placeholder="Ex: Quero vender mais pizzas no fim de semana aproveitando o combo família com borda recheada..."
                className="w-full bg-white text-slate-900 rounded-2xl p-4 border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none text-sm min-h-[110px] shadow-sm"
              />
              <button
                type="button"
                onClick={handleInterpretarPrompt}
                disabled={analyzingPrompt || !promptTexto.trim()}
                className="absolute right-3 bottom-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                {analyzingPrompt ? 'Analisando...' : '✨ IA: Extrair Estratégia'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Nome do Produto ou Prato
              </label>
              <input
                type="text"
                value={produtoNome}
                onChange={e => setProdutoNome(e.target.value)}
                placeholder="Ex: Combo Família Especial"
                className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Nome da Campanha (Interno)
              </label>
              <input
                type="text"
                value={nomeCampanha}
                onChange={e => setNomeCampanha(e.target.value)}
                placeholder="Ex: Campanha Vendas - Fim de Semana"
                className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold block mb-1">
              Link de Destino no Prefiro Delivery (Opcional)
            </label>
            <input
              type="url"
              value={urlDestino}
              onChange={e => setUrlDestino(e.target.value)}
              placeholder="https://prefirodelivery.com/sua-loja/produto"
              className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!produtoNome) setProdutoNome('Destaque da Casa');
                if (!nomeCampanha) setNomeCampanha(`Campanha - ${produtoNome || 'Delivery'}`);
                setStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              Continuar: Região e Clientes →
            </button>
          </div>
        </div>
      )}

      {/* Passo 2: Onde estão seus clientes (PDF Seção 5 e 21) */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Passo 2 de 5 • Onde estão seus clientes?
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
              Defina o raio de entrega do seu delivery
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Não desperdice orçamento com quem mora longe demais para pedir. Foque no raio que seu delivery atende com rapidez.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Cidade Principal
              </label>
              <input
                type="text"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Ex: Feira de Santana"
                className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-600 font-semibold">
                  Raio de Atendimento da Loja
                </label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-100">
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
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>2 km (Bairros vizinhos)</span>
                <span>8 km (Média padrão)</span>
                <span>25 km (Cidade inteira)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <p className="text-xs text-slate-600">
                Seus anúncios serão exibidos para pessoas que residem ou estão ativas em um raio de{' '}
                <strong className="text-slate-900 font-semibold">{raioKm} km</strong> em{' '}
                <strong className="text-slate-900 font-semibold">{cidade || 'sua localidade'}</strong>.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-sm transition-all border border-slate-200/80"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              Continuar: Orçamento Inteligente →
            </button>
          </div>
        </div>
      )}

      {/* Passo 3: Orçamento & Recomendação da IA (PDF Seções 18 e 19) */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Passo 3 de 5 • Quanto deseja investir?
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
              Defina seu investimento diário
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              A Meta otimiza seu orçamento dia após dia para encontrar compradores no menor custo por pedido.
            </p>
          </div>

          {recomendacaoIa && (
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h3 className="text-sm font-bold text-indigo-900">Recomendação da sua IA</h3>
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed">
                {recomendacaoIa.justificativa}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setOrcamentoDiario(recomendacaoIa.orcamentoDiarioRecomendado)}
                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                >
                  ✓ Aplicar R$ {recomendacaoIa.orcamentoDiarioRecomendado.toFixed(2)}/dia recomendado
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-600 font-semibold block mb-2">
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
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  R$ {val}/dia
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold block mb-1">
              Ou digite um valor personalizado (mínimo R$ 10,00):
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-3 text-sm text-slate-400 font-bold">R$</span>
              <input
                type="number"
                min="10"
                step="5"
                value={orcamentoDiario}
                onChange={e => setOrcamentoDiario(Number(e.target.value))}
                className="w-full bg-white text-slate-900 text-sm pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none font-bold shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-sm transition-all border border-slate-200/80"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              Continuar: Criativo & Texto →
            </button>
          </div>
        </div>
      )}

      {/* Passo 4: Criativo e Texto do Anúncio (PDF Seções 36 e 37) */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Passo 4 de 5 • Criativo e Mensagem
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
              Como seu anúncio vai aparecer para os clientes
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Defina a imagem, título e texto irresistível para fazer as pessoas clicarem e pedirem no seu delivery.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Título em Destaque
              </label>
              <input
                type="text"
                value={tituloAnuncio}
                onChange={e => setTituloAnuncio(e.target.value)}
                placeholder="Ex: Fim de Semana com Pizza Especial em Casa"
                className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Texto Principal (Legenda Persuasiva)
              </label>
              <textarea
                value={textoPrincipal}
                onChange={e => setTextoPrincipal(e.target.value)}
                placeholder="Ex: Peça hoje o Combo Família com borda recheada grátis e receba em menos de 35 minutos quentinha na sua porta..."
                className="w-full bg-white text-slate-900 text-sm p-4 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none min-h-[90px] shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">
                  URL da Imagem do Anúncio
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">
                  Botão de Chamada para Ação (CTA)
                </label>
                <select
                  value={cta}
                  onChange={e => setCta(e.target.value)}
                  className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none shadow-sm font-medium"
                >
                  <option value="ORDER_NOW">Peça Agora (Recomendado)</option>
                  <option value="SHOP_NOW">Comprar Agora</option>
                  <option value="LEARN_MORE">Saiba Mais</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
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
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-sm transition-all border border-slate-200/80"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              Continuar: Revisão Final →
            </button>
          </div>
        </div>
      )}

      {/* Passo 5: Revisão & Publicação na Meta (PDF Seção 20) */}
      {step === 5 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Passo 5 de 5 • Revisão e Publicação
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
              Tudo pronto para lançar sua campanha!
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Revise os detalhes abaixo. Ao clicar em Publicar, a plataforma criará a árvore completa de anúncios na Meta.
            </p>
          </div>

          {/* Resumo sem jargões técnicos */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <span className="text-xs text-slate-500 block">Produto / Prato:</span>
                <span className="text-sm font-bold text-slate-900">{produtoNome}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Objetivo na Meta:</span>
                <span className="text-sm font-bold text-emerald-600">Vendas no Site / Delivery</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Investimento Diário:</span>
                <span className="text-sm font-bold text-indigo-600">R$ {Number(orcamentoDiario).toFixed(2)} por dia</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Público / Região:</span>
                <span className="text-sm font-bold text-slate-800">
                  {cidade || 'Local'} ({raioKm} km de raio)
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Prévia do Anúncio:</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-sm">
                <p className="text-sm font-bold text-slate-900">{tituloAnuncio}</p>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{textoPrincipal}</p>
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                  <span>Botão: <strong className="text-slate-800">{cta}</strong></span>
                  <span className="text-indigo-600 font-medium">🔗 Destino: {urlDestino || 'Prefiro Delivery'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-sm transition-all border border-slate-200/80 disabled:opacity-50"
            >
              ← Voltar e Editar
            </button>
            <button
              onClick={handlePublicarCampanha}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
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
