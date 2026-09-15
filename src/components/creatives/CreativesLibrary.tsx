'use client';

import { useState, useEffect } from 'react';

/**
 * Biblioteca de Criativos & Módulo de Detecção de Fadiga (PDF Seções 35, 37, 39, 40)
 * Tela: Criativos
 */

interface CreativesLibraryProps {
  empresaId: string;
}

interface CriativoItem {
  id: string;
  nome: string;
  tipo: string;
  formato: string | null;
  url_midia: string | null;
  categoria: string | null;
  status_fadiga: string;
  impressoes: number;
  cliques: number;
  ctr: number;
  frequencia: number;
  conversoes: number;
  cpa: number;
  roas: number;
  produto: {
    id: string;
    nome: string;
    preco: number;
    preco_promocional: number | null;
    categoria: string | null;
  } | null;
}

interface FatigueAlert {
  criativoId: string;
  nome: string;
  mensagem: string;
  frequencia: number;
  cpa: number;
  ctr: number;
}

export default function CreativesLibrary({ empresaId }: CreativesLibraryProps) {
  const [criativos, setCriativos] = useState<CriativoItem[]>([]);
  const [alertas, setAlertas] = useState<FatigueAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchCreatives = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/criativos?empresaId=${empresaId}`);
      const json = await res.json();
      if (json.success) {
        setCriativos(json.criativos);
      }
    } catch (err) {
      console.error('Erro ao carregar criativos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatives();
  }, [empresaId]);

  const handleRunFatigueAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/criativos/fadiga?empresaId=${empresaId}`);
      const json = await res.json();
      if (json.success) {
        setAlertas(json.diagnostico.alertasGerados);
        await fetchCreatives();
      }
    } catch (err) {
      console.error('Erro no diagnóstico de fadiga:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Fadiga / Saturação Ativos (PDF Seção 40) */}
      {alertas.length > 0 && (
        <div className="space-y-3">
          {alertas.map(a => (
            <div key={a.criativoId} className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-300">Alerta de Fadiga de Anúncio</h4>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Saturação Detectada
                  </span>
                </div>
                <p className="text-xs text-amber-200 mt-1">{a.mensagem}</p>
                <div className="flex items-center gap-4 text-xs text-amber-300/80 mt-2">
                  <span>Frequência: {a.frequencia.toFixed(1)}x</span>
                  <span>•</span>
                  <span>Custo por Pedido: R$ {a.cpa.toFixed(2)}</span>
                  <span>•</span>
                  <span>Taxa de Cliques: {a.ctr}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header & Ações */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <h2 className="text-xl font-bold text-white">Biblioteca de Criativos</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {criativos.length} mídias cadastradas
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Imagens e vídeos vinculados ao cardápio da Prefiro com monitoramento de fadiga em tempo real.
            </p>
          </div>

          <button
            onClick={handleRunFatigueAnalysis}
            disabled={analyzing}
            className="px-4 py-2.5 rounded-lg bg-gray-800 text-gray-200 text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisando Saturação...
              </>
            ) : (
              <>⚡ Diagnóstico de Fadiga</>
            )}
          </button>
        </div>
      </div>

      {/* Grid de Criativos (PDF Seção 35, 37, 39) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {criativos.map(c => (
          <div key={c.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all flex flex-col">
            {/* Mídia / Imagem Preview */}
            <div className="relative h-48 bg-gray-950 flex items-center justify-center overflow-hidden">
              {c.url_midia ? (
                <img src={c.url_midia} alt={c.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl">🍕</div>
              )}

              {/* Formato Badge (PDF Seção 35) */}
              <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded border border-gray-700">
                {c.formato || '1:1'}
              </span>

              {/* Status de Fadiga (PDF Seção 40) */}
              <span className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur border ${
                c.status_fadiga === 'SATURADO'
                  ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
              }`}>
                {c.status_fadiga === 'SATURADO' ? '🔴 Saturado' : '🟢 Saudável'}
              </span>
            </div>

            {/* Informações & Produto Vinculado (PDF Seção 37) */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm line-clamp-1">{c.nome}</h3>
                
                {c.produto ? (
                  <div className="mt-2 p-2 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Produto Vinculado</span>
                      <span className="text-xs text-blue-300 font-medium">{c.produto.nome}</span>
                    </div>
                    <span className="text-xs font-bold text-white">
                      R$ {c.produto.preco.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-500 mt-2 block">Nenhum produto vinculado</span>
                )}
              </div>

              {/* Métricas de Desempenho (PDF Seção 39) */}
              <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-gray-400 block">Cliques</span>
                  <span className="text-xs font-bold text-white">{c.cliques}</span>
                  <span className="text-[10px] text-gray-500 block">({c.ctr}% CTR)</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Pedidos</span>
                  <span className="text-xs font-bold text-emerald-400">{c.conversoes}</span>
                  <span className="text-[10px] text-gray-500 block">{c.roas}x ROAS</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Custo/Pedido</span>
                  <span className="text-xs font-bold text-white">R$ {c.cpa.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-500 block">Freq: {c.frequencia}x</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
