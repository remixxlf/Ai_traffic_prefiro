'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Bot,
  Zap,
  ShieldCheck,
  Store,
  Layers,
  Sparkles,
  BarChart3,
  Image as ImageIcon,
  Users,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileText,
  Bell,
  ArrowRight,
  PlusCircle
} from 'lucide-react';

interface EmpresaItem {
  id: string;
  nome: string;
  segmento: string | null;
  cidade: string | null;
  estado: string | null;
  modo_operacao: string;
  _count?: {
    campanhas: number;
    meta_produtos: number;
    criativos: number;
    aprovacoes: number;
  };
}

export default function HomePage() {
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmpresas = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/empresas');
      const data = await res.json();
      if (data.success && data.empresas) {
        setEmpresas(data.empresas);
        if (data.empresas.length > 0) {
          setSelectedEmpresaId((prev) => prev || data.empresas[0].id);
        }
      }
    } catch (e) {
      console.error('Erro ao listar empresas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const selectedEmpresa = empresas.find((e) => e.id === selectedEmpresaId);

  const modules = [
    {
      title: 'Dashboard Executivo & ROAS Real',
      desc: 'Métricas integradas: Receita, ROAS Real vs Meta, Vendas Delivery e CAC.',
      icon: BarChart3,
      href: `/dashboard?empresaId=${selectedEmpresaId}`,
      badge: 'Tempo Real',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      title: 'Onboarding & Memória de Negócio',
      desc: 'Configuração em 4 etapas: horários fortes, ticket médio e perfil do restaurante.',
      icon: Store,
      href: '/onboarding',
      badge: 'Wizard Guiado',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      title: 'Hub de Integrações',
      desc: 'Conexão Meta Ads Graph API v20 e ingestão do Prefiro Delivery.',
      icon: Layers,
      href: `/integracoes?empresaId=${selectedEmpresaId}`,
      badge: 'Meta & Delivery',
      color: 'from-violet-600 to-purple-600'
    },
    {
      title: 'Catálogo & Campanhas de Pratos',
      desc: 'Sincronização de cardápio XML, pausa automática e anúncios por item.',
      icon: Layers,
      href: `/catalogo?empresaId=${selectedEmpresaId}`,
      badge: 'Auto-Sync',
      color: 'from-amber-600 to-orange-600'
    },
    {
      title: 'Gestão de Campanhas',
      desc: 'Listagem, orçamentos, monitoramento e criação guiada em 5 passos.',
      icon: TrendingUp,
      href: `/campanhas?empresaId=${selectedEmpresaId}`,
      badge: 'Campanhas',
      color: 'from-cyan-600 to-blue-600'
    },
    {
      title: 'Copywriting com IA',
      desc: 'Geração de copys com 3 variações estratégicas (Urgência, Sensorial, Prova Social).',
      icon: Sparkles,
      href: `/copywriting?empresaId=${selectedEmpresaId}`,
      badge: 'Groq 70B',
      color: 'from-pink-600 to-rose-600'
    },
    {
      title: 'Biblioteca de Criativos & Fadiga',
      desc: 'Monitoramento de CTR e frequência. Detecção de fadiga (>3.5 freq, -25% CTR).',
      icon: ImageIcon,
      href: `/criativos?empresaId=${selectedEmpresaId}`,
      badge: 'Detector Fadiga',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      title: 'Públicos & Segmentação LGPD',
      desc: 'Audiências com hashing SHA-256, Lookalike de 1% e raio geográfico em KM.',
      icon: Users,
      href: `/publicos?empresaId=${selectedEmpresaId}`,
      badge: 'LGPD Seguro',
      color: 'from-emerald-600 to-green-700'
    },
    {
      title: 'Saúde da Conta & Rastreamento',
      desc: 'Diagnóstico de Pixel, CAPI, catálogo e cálculo do Health Score (0-100).',
      icon: ShieldCheck,
      href: `/rastreamento?empresaId=${selectedEmpresaId}`,
      badge: 'Health Score',
      color: 'from-teal-600 to-cyan-600'
    },
    {
      title: 'Automações & Guardrails',
      desc: 'Regras de proteção anti-desperdício: teto diário e limite de +20% por ação.',
      icon: Zap,
      href: `/automacoes?empresaId=${selectedEmpresaId}`,
      badge: 'Guardrails',
      color: 'from-red-600 to-orange-600'
    },
    {
      title: 'Minha IA & Central de Aprovações',
      desc: 'Modo de operação (Manual, Assistido, Automático) e aprovação de ações.',
      icon: Cpu,
      href: `/minha-ia?empresaId=${selectedEmpresaId}`,
      badge: 'Controle Total',
      color: 'from-indigo-600 to-blue-700'
    },
    {
      title: 'Chat IA, Relatórios & Alertas',
      desc: 'Comandos operacionais em linguagem natural, relatórios executivos e alertas.',
      icon: MessageSquare,
      href: `/chat?empresaId=${selectedEmpresaId}`,
      badge: 'Assistente IA',
      color: 'from-purple-600 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bot className="w-6 h-6 text-gray-950" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">
                Tráfego IA <span className="text-orange-400">Delivery</span>
              </span>
              <p className="text-xs text-gray-400">Meta Ads + Prefiro Delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Llama 3.3 70B & Guardrails 20%</span>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-gray-950 font-semibold text-xs px-3.5 py-2 rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Restaurante</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 p-8 mb-8 shadow-2xl">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-xs text-orange-400 font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plataforma SaaS B2B de Gestão de Tráfego com IA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Anúncios inteligentes no Meta Ads conectados ao cardápio do seu restaurante.
            </h1>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Automação completa para delivery: ingestão de catálogo XML, cálculo de ROAS real com vendas do balcão,
              detecção de fadiga de criativos, geração de copys com IA e guardrails de segurança orçamentária.
            </p>

            {/* Status pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Meta Graph API v20</span>
              </span>
              <span className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cardápio Prefiro Delivery</span>
              </span>
              <span className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Groq Llama 3.3 70B</span>
              </span>
              <span className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Guardrails Orçamentários</span>
              </span>
            </div>
          </div>
        </div>

        {/* Company Context Selector / Quick Seed */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-bold text-white">Empresa Selecionada para Navegação</h2>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {selectedEmpresa
                  ? `${selectedEmpresa.nome} • ${selectedEmpresa.segmento || 'Restaurante'} • ${selectedEmpresa.cidade || ''}/${selectedEmpresa.estado || ''}`
                  : 'Nenhuma empresa ativa selecionada no momento.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {empresas.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedEmpresaId}
                    onChange={(e) => setSelectedEmpresaId(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nome} ({emp.modo_operacao})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <Link
                href="/onboarding"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-gray-950 font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20"
              >
                <PlusCircle className="w-4 h-4 text-gray-950" />
                <span>Novo Restaurante</span>
              </Link>
            </div>
          </div>

          {selectedEmpresa && (
            <div className="mt-4 pt-4 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-300">
              <div className="bg-gray-950/60 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">Modo de Operação</span>
                <span className="font-semibold text-orange-400">{selectedEmpresa.modo_operacao}</span>
              </div>
              <div className="bg-gray-950/60 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">Campanhas Ativas</span>
                <span className="font-semibold text-white">{selectedEmpresa._count?.campanhas ?? 2} cadastradas</span>
              </div>
              <div className="bg-gray-950/60 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">Cardápio & Itens</span>
                <span className="font-semibold text-white">{selectedEmpresa._count?.meta_produtos ?? 4} sincronizados</span>
              </div>
              <div className="bg-gray-950/60 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-500 block">Aprovações IA</span>
                <span className="font-semibold text-white">{selectedEmpresa._count?.aprovacoes ?? 1} pendente</span>
              </div>
            </div>
          )}
        </div>

        {/* Modules Grid */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Módulos do Sistema</h2>
            <p className="text-sm text-gray-400">Acesse qualquer ferramenta da plataforma diretamente:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            const targetHref = selectedEmpresaId || mod.href.includes('onboarding') ? mod.href : `${mod.href.split('?')[0]}`;

            return (
              <Link
                key={idx}
                href={targetHref}
                className="group relative bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-medium text-gray-400 group-hover:text-orange-400 transition-colors">
                  <span>Acessar Módulo</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Rodapé Comercial Limpo */}
        <footer className="mt-16 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-300">Tráfego IA Delivery</span>
            <span>—</span>
            <span>Plataforma SaaS de Gestão e Otimização de Anúncios para Restaurantes</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-400">
            <Link href="/onboarding" className="hover:text-orange-400 transition">Novo Restaurante</Link>
            <Link href="/dashboard" className="hover:text-orange-400 transition">Dashboard</Link>
            <Link href="/rastreamento" className="hover:text-orange-400 transition">Saúde da Conta</Link>
            <span className="text-gray-600">© 2026 • Todos os direitos reservados</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
