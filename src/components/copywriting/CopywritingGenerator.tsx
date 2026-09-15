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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✍️</span>
          <h2 className="text-xl font-bold text-slate-900">Criador de Textos de Anúncios com IA</h2>
        </div>
        <p className="text-slate-500 text-sm mb-6">
          A IA analisa o seu segmento e gera 3 abordagens de vendas comprovadas para delivery.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-700 font-semibold block mb-1.5">Produto em Destaque</label>
            <input
              type="text"
              value={produtoNome}
              onChange={e => setProdutoNome(e.target.value)}
              placeholder="Ex: Pizza Calabresa Especial (ou deixe em branco para prato principal)"
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-sm transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1.5">Preço Regular</label>
              <input
                type="number"
                step="0.01"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="Ex: 69.90"
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-sm transition"
              />
            </div>
            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1.5">Preço Promocional</label>
              <input
                type="number"
                step="0.01"
                value={precoPromocional}
                onChange={e => setPrecoPromocional(e.target.value)}
                placeholder="Ex: 59.90"
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-sm transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-slate-700 font-semibold block mb-1.5">Gancho ou Diferencial Extra (Opcional)</label>
          <input
            type="text"
            value={ganchoEspecial}
            onChange={e => setGanchoEspecial(e.target.value)}
            placeholder="Ex: Borda recheada grátis hoje, entrega em menos de 35 minutos, massa de fermentação lenta"
            className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-sm transition"
          />
        </div>

        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
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
            <h3 className="text-lg font-bold text-slate-900">Variações Estratégicas para "{result.produto}"</h3>
            <span className="text-xs text-slate-500">Escolha a que melhor se adapta à sua campanha</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Foco no Produto */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🍕 1. Foco no Produto
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.variacoes.focoProduto.textoPrincipal, 'prod')}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                  >
                    {copiedKey === 'prod' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 text-base mt-2">{result.variacoes.focoProduto.titulo}</h4>
                <p className="text-slate-700 text-xs mt-3 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {result.variacoes.focoProduto.textoPrincipal}
                </p>
                <span className="text-[11px] text-slate-500 block mt-2">
                  Legenda curta: {result.variacoes.focoProduto.descricao}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Botão recomendado:</span>
                  <span className="text-white font-bold bg-indigo-600 px-2 py-0.5 rounded text-[11px]">
                    {result.variacoes.focoProduto.cta}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-900 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                  💡 {result.variacoes.focoProduto.porQueFunciona}
                </p>
              </div>
            </div>

            {/* 2. Foco no Benefício / Comodidade */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🛵 2. Foco na Comodidade
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.variacoes.focoBeneficio.textoPrincipal, 'ben')}
                    className="text-xs text-slate-500 hover:text-emerald-600 font-medium"
                  >
                    {copiedKey === 'ben' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 text-base mt-2">{result.variacoes.focoBeneficio.titulo}</h4>
                <p className="text-slate-700 text-xs mt-3 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {result.variacoes.focoBeneficio.textoPrincipal}
                </p>
                <span className="text-[11px] text-slate-500 block mt-2">
                  Legenda curta: {result.variacoes.focoBeneficio.descricao}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Botão recomendado:</span>
                  <span className="text-white font-bold bg-emerald-600 px-2 py-0.5 rounded text-[11px]">
                    {result.variacoes.focoBeneficio.cta}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                  💡 {result.variacoes.focoBeneficio.porQueFunciona}
                </p>
              </div>
            </div>

            {/* 3. Foco na Urgência / Promoção */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition-all shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    ⏳ 3. Foco na Urgência
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.variacoes.focoUrgencia.textoPrincipal, 'urg')}
                    className="text-xs text-slate-500 hover:text-amber-600 font-medium"
                  >
                    {copiedKey === 'urg' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 text-base mt-2">{result.variacoes.focoUrgencia.titulo}</h4>
                <p className="text-slate-700 text-xs mt-3 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {result.variacoes.focoUrgencia.textoPrincipal}
                </p>
                <span className="text-[11px] text-slate-500 block mt-2">
                  Legenda curta: {result.variacoes.focoUrgencia.descricao}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Botão recomendado:</span>
                  <span className="text-white font-bold bg-amber-600 px-2 py-0.5 rounded text-[11px]">
                    {result.variacoes.focoUrgencia.cta}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
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
