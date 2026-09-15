'use client';

import { useState } from 'react';

/**
 * Gerador de Copywriting com IA (PDF Seções 36, 37, 88)
 * 
 * Gera 3 variações estratégicas de alta conversão:
 *   1. Foco no Produto (Sensorial & Sabor)
 *   2. Foco no Benefício / Comodidade (Praticidade em casa)
 *   3. Foco na Urgência / Promoção (Pedir antes que acabe)
 */

interface CopywritingGeneratorProps {
  empresaId: string;
}

interface AdCopyVariation {
  estrategia: string;
  titulo: string;
  textoPrincipal: string;
  descricao: string;
  cta: string;
  porQueFunciona: string;
}

interface CopyResult {
  empresa: string;
  produto: string;
  variacoes: {
    focoProduto: AdCopyVariation;
    focoBeneficio: AdCopyVariation;
    focoUrgencia: AdCopyVariation;
  };
}

export default function CopywritingGenerator({ empresaId }: CopywritingGeneratorProps) {
  const [produtoNome, setProdutoNome] = useState('');
  const [preco, setPreco] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [ganchoEspecial, setGanchoEspecial] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CopyResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/copywriting/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          produtoNome: produtoNome || undefined,
          preco: preco || undefined,
          precoPromocional: precoPromocional || undefined,
          ganchoEspecial: ganchoEspecial || undefined
        })
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.resultado);
      }
    } catch (err) {
      console.error('Erro ao gerar cópias:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Configuração */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✍️</span>
          <h2 className="text-xl font-bold text-white">Criador de Textos de Anúncios com IA</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          A IA analisa o seu segmento e gera 3 abordagens de vendas comprovadas para delivery.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">Produto em Destaque</label>
            <input
              type="text"
              value={produtoNome}
              onChange={e => setProdutoNome(e.target.value)}
              placeholder="Ex: Pizza Calabresa Especial (ou deixe em branco para usar seu prato principal)"
              className="w-full bg-gray-950 text-white rounded-xl px-4 py-3 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Preço Regular</label>
              <input
                type="number"
                step="0.01"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="Ex: 69.90"
                className="w-full bg-gray-950 text-white rounded-xl px-4 py-3 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Preço Promocional (Opcional)</label>
              <input
                type="number"
                step="0.01"
                value={precoPromocional}
                onChange={e => setPrecoPromocional(e.target.value)}
                placeholder="Ex: 59.90"
                className="w-full bg-gray-950 text-white rounded-xl px-4 py-3 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-gray-400 font-medium block mb-1.5">Gancho ou Diferencial Extra (Opcional)</label>
          <input
            type="text"
            value={ganchoEspecial}
            onChange={e => setGanchoEspecial(e.target.value)}
            placeholder="Ex: Borda recheada grátis hoje, entrega em menos de 35 minutos, massa de fermentação lenta"
            className="w-full bg-gray-950 text-white rounded-xl px-4 py-3 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>

        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando Variações Estratégicas...
              </>
            ) : (
              <>✨ Gerar 3 Variações com IA</>
            )}
          </button>
        </div>
      </div>

      {/* 3 Variações Estratégicas (PDF Seção 37) */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Variações Estratégicas para "{result.produto}"</h3>
            <span className="text-xs text-gray-400">Escolha a que melhor se adapta à sua campanha</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Foco no Produto */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    🍕 1. Foco no Produto
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.variacoes.focoProduto.textoPrincipal, 'prod')}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {copiedKey === 'prod' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                </div>

                <h4 className="font-bold text-white text-base mt-2">{result.variacoes.focoProduto.titulo}</h4>
                <p className="text-gray-300 text-xs mt-3 leading-relaxed whitespace-pre-line bg-gray-950 p-3 rounded-xl border border-gray-800">
                  {result.variacoes.focoProduto.textoPrincipal}
                </p>
                <span className="text-[11px] text-gray-500 block mt-2">
                  Legenda curta: {result.variacoes.focoProduto.descricao}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">Botão recomendado:</span>
                  <span className="text-white font-bold bg-blue-600 px-2 py-0.5 rounded text-[11px]">
                    {result.variacoes.focoProduto.cta}
                  </span>
                </div>
                <p className="text-[11px] text-blue-300 bg-blue-950/40 p-2.5 rounded-lg border border-blue-900/40">
                  💡 {result.variacoes.focoProduto.porQueFunciona}
                </p>
              </div>
            </div>

            {/* 2. Foco no Benefício / Comodidade */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    🛵 2. Foco na Comodidade
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.variacoes.focoBeneficio.textoPrincipal, 'ben')}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {copiedKey === 'ben' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                </div>

                <h4 className="font-bold text-white text-base mt-2">{result.variacoes.focoBeneficio.titulo}</h4>
                <p className="text-gray-300 text-xs mt-3 leading-relaxed whitespace-pre-line bg-gray-950 p-3 rounded-xl border border-gray-800">
                  {result.variacoes.focoBeneficio.textoPrincipal}
                </p>
                <span className="text-[11px] text-gray-500 block mt-2">
                  Legenda curta: {result.variacoes.focoBeneficio.descricao}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">Botão recomendado:</span>
                  <span className="text-white font-bold bg-emerald-600 px-2 py-0.5 rounded text-[11px]">
                    {result.variacoes.focoBeneficio.cta}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40">
                  💡 {result.variacoes.focoBeneficio.porQueFunciona}
                </p>
              </div>
            </div>

            {/* 3. Foco na Urgência / Promoção */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ⏳ 3. Foco na Urgência
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.variacoes.focoUrgencia.textoPrincipal, 'urg')}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {copiedKey === 'urg' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                </div>

                <h4 className="font-bold text-white text-base mt-2">{result.variacoes.focoUrgencia.titulo}</h4>
                <p className="text-gray-300 text-xs mt-3 leading-relaxed whitespace-pre-line bg-gray-950 p-3 rounded-xl border border-gray-800">
                  {result.variacoes.focoUrgencia.textoPrincipal}
                </p>
                <span className="text-[11px] text-gray-500 block mt-2">
                  Legenda curta: {result.variacoes.focoUrgencia.descricao}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">Botão recomendado:</span>
                  <span className="text-white font-bold bg-amber-600 px-2 py-0.5 rounded text-[11px]">
                    {result.variacoes.focoUrgencia.cta}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/40">
                  💡 {result.variacoes.focoUrgencia.porQueFunciona}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
