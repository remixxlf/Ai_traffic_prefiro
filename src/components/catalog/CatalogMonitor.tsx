'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Monitoramento e Campanhas de Catálogo Dinâmico (PDF Seções 32, 33, 34, 83, 84, 85)
 * Tela: Catálogo → Sincronização & Anúncios Rápidos
 */

interface CatalogMonitorProps {
  empresaId: string;
}

interface Produto {
  id: string;
  external_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  categoria: string | null;
  url_imagem: string | null;
  status: string;
  disponibilidade: boolean;
}

interface CatalogData {
  resumo: {
    total: number;
    ativos: number;
    inativos: number;
    comErro: number;
    ultimaAtualizacao: string | null;
    proximaAtualizacao: string | null;
  };
  produtos: Produto[];
}

export default function CatalogMonitor({ empresaId }: CatalogMonitorProps) {
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estado do Modal de Anúncio Rápido
  const [modalType, setModalType] = useState<'PRODUTO' | 'CATEGORIA' | 'CARDAPIO' | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [orcamentoDiario, setOrcamentoDiario] = useState<number>(50);
  const [launching, setLaunching] = useState(false);
  const [campaignSuccess, setCampaignSuccess] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/catalogo?empresaId=${empresaId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [empresaId]);

  const handleManualSync = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/catalogo?empresaId=${empresaId}`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback(`✅ Sincronizado: ${json.detalhes.novos} novos, ${json.detalhes.alterados} alterados.`);
        await fetchCatalog();
      } else {
        setFeedback(`❌ Erro: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`❌ Erro: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleLaunchCampaign = async () => {
    setLaunching(true);
    setFeedback(null);
    try {
      let endpoint = '';
      let payload: any = { empresaId, orcamentoDiario };

      if (modalType === 'PRODUTO' && selectedProduto) {
        endpoint = '/api/catalogo/anunciar/produto';
        payload.produtoId = selectedProduto.id;
      } else if (modalType === 'CATEGORIA' && selectedCategoria) {
        endpoint = '/api/catalogo/anunciar/categoria';
        payload.categoria = selectedCategoria;
      } else if (modalType === 'CARDAPIO') {
        endpoint = '/api/catalogo/anunciar/cardapio';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        setCampaignSuccess(`🚀 Anúncio publicado com sucesso! (ID Campanha Meta: ${json.resultado.metaCampaignId})`);
      } else {
        setFeedback(`❌ ${json.error || 'Erro ao lançar campanha'}`);
      }
    } catch (err: any) {
      setFeedback(`❌ ${err.message || 'Erro inesperado'}`);
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const r = data?.resumo;
  const categorias = Array.from(new Set(data?.produtos.map(p => p.categoria).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Status e Ações Rápidas de Catálogo (PDF Seções 32, 85) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo Prefiro Delivery ↔ Meta Commerce</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Sincronização periódica automatizada (a cada 1 hora). Anúncios dinâmicos baseados no seu cardápio em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setModalType('CARDAPIO');
                setSelectedProduto(null);
                setSelectedCategoria('');
                setOrcamentoDiario(60);
                setCampaignSuccess(null);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>Divulgar Todo o Cardápio</span>
            </button>

            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 disabled:opacity-50 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              {syncing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>🔄 Sincronizar Agora</>
              )}
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            {feedback}
          </div>
        )}

        {/* Cards de Métricas do Catálogo (PDF Seção 32) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total de Produtos</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{r?.total || 0}</p>
            <span className="text-xs text-slate-500">cardápio completo</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">Produtos Ativos</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{r?.ativos || 0}</p>
            <span className="text-xs text-slate-500">disponíveis para anúncio</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider">Com Erro</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{r?.comErro || 0}</p>
            <span className="text-xs text-slate-500">incompletos ou com falha</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-indigo-700 text-xs font-semibold uppercase tracking-wider">Última Atualização</span>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              {r?.ultimaAtualizacao ? new Date(r.ultimaAtualizacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Pendente'}
            </p>
            <span className="text-xs text-slate-500">
              Próxima: {r?.proximaAtualizacao ? new Date(r.proximaAtualizacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '+1h'}
            </span>
          </div>
        </div>
      </div>

      {/* Categorias com Ação Rápida "Anunciar Categoria" (PDF Seção 84) */}
      {categorias.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Anúncios por Categoria</h3>
            <span className="text-xs text-slate-500">Crie carrosséis focados em um tipo de prato</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setModalType('CATEGORIA');
                  setSelectedCategoria(cat);
                  setSelectedProduto(null);
                  setOrcamentoDiario(40);
                  setCampaignSuccess(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>📁</span>
                <span>Anunciar {cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Produtos com Ação "Anunciar" (PDF Seção 83) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Produtos do Cardápio</h3>
          <span className="text-slate-500 text-xs">{data?.produtos.length || 0} itens mapeados</span>
        </div>

        <div className="divide-y divide-slate-100">
          {data?.produtos && data.produtos.length > 0 ? (
            data.produtos.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {p.url_imagem ? (
                    <img src={p.url_imagem} alt={p.nome} className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">🍕</div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-slate-900 font-semibold text-sm truncate">{p.nome}</h4>
                    <p className="text-slate-500 text-xs line-clamp-1">{p.descricao || 'Sem descrição cadastrada.'}</p>
                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-medium">
                      {p.categoria || 'Sem categoria'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    {p.preco_promocional ? (
                      <div>
                        <span className="text-xs line-through text-slate-400 mr-1.5">R$ {p.preco.toFixed(2)}</span>
                        <span className="text-emerald-600 font-bold text-sm">R$ {p.preco_promocional.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-slate-900 font-bold text-sm">R$ {p.preco.toFixed(2)}</span>
                    )}
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      p.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Botão [ Anunciar ] Seção 83 */}
                  <button
                    onClick={() => {
                      setModalType('PRODUTO');
                      setSelectedProduto(p);
                      setSelectedCategoria('');
                      setOrcamentoDiario(50);
                      setCampaignSuccess(null);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>⚡</span>
                    <span>Anunciar</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhum produto sincronizado ainda. Clique em "Sincronizar Agora" acima.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Lançamento de Anúncio Rápido (PDF Seções 83, 84, 85) */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>⚡</span>
                {modalType === 'PRODUTO' && `Anunciar: ${selectedProduto?.nome}`}
                {modalType === 'CATEGORIA' && `Anunciar Categoria: ${selectedCategoria}`}
                {modalType === 'CARDAPIO' && 'Divulgar Todo o Cardápio'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {campaignSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto border border-emerald-200">
                  ✓
                </div>
                <p className="text-sm font-semibold text-emerald-700">{campaignSuccess}</p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    href={`/campanhas?empresaId=${empresaId}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                  >
                    Ver Minhas Campanhas
                  </Link>
                  <button
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <p className="font-semibold text-slate-900">💡 Estrutura Automática:</p>
                  <p>
                    A plataforma criará uma campanha na Meta com objetivo de vendas no delivery,
                    segmentando pessoas localizadas na sua área de entrega.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-2">
                    Quanto deseja investir por dia?
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[30, 50, 100].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setOrcamentoDiario(val)}
                        className={`py-2.5 rounded-xl border font-bold text-xs transition-all ${
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

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setModalType(null)}
                    disabled={launching}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all border border-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={launching}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {launching ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>🚀 Publicar Agora</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
