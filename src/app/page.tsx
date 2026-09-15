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
      iconStyle: 'bg-indigo-50 text-indigo-600 border border-indigo-100'
    },
    {
      title: 'Onboarding & Memória de Negócio',
      desc: 'Configuração em 4 etapas: horários fortes, ticket médio e perfil do restaurante.',
      icon: Store,
      href: '/onboarding',
      badge: 'Wizard Guiado',
      iconStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    },
    {
      title: 'Hub de Integrações',
      desc: 'Conexão Meta Ads Graph API v20 e ingestão do Prefiro Delivery.',
      icon: Layers,
      href: `/integracoes?empresaId=${selectedEmpresaId}`,
      badge: 'Meta & Delivery',
      iconStyle: 'bg-blue-50 text-blue-600 border border-blue-100'
    },
    {
      title: 'Catálogo & Campanhas de Pratos',
      desc: 'Sincronização de cardápio XML, pausa automática e anúncios por item.',
      icon: Layers,
      href: `/catalogo?empresaId=${selectedEmpresaId}`,
      badge: 'Auto-Sync',
      iconStyle: 'bg-amber-50 text-amber-600 border border-amber-100'
    },
    {
      title: 'Gestão de Campanhas',
      desc: 'Listagem, orçamentos, monitoramento e criação guiada em 5 passos.',
      icon: TrendingUp,
      href: `/campanhas?empresaId=${selectedEmpresaId}`,
      badge: 'Campanhas',
      iconStyle: 'bg-sky-50 text-sky-600 border border-sky-100'
    },
    {
      title: 'Copywriting com IA',
      desc: 'Geração de copys com 3 variações estratégicas (Urgência, Sensorial, Prova Social).',
      icon: Sparkles,
      href: `/copywriting?empresaId=${selectedEmpresaId}`,
      badge: 'Groq 70B',
      iconStyle: 'bg-rose-50 text-rose-600 border border-rose-100'
    },
    {
      title: 'Biblioteca de Criativos & Fadiga',
      desc: 'Monitoramento de CTR e frequência. Detecção de fadiga (>3.5 freq, -25% CTR).',
      icon: ImageIcon,
      href: `/criativos?empresaId=${selectedEmpresaId}`,
      badge: 'Detector Fadiga',
      iconStyle: 'bg-orange-50 text-orange-600 border border-orange-100'
    },
    {
      title: 'Públicos & Segmentação LGPD',
      desc: 'Audiências com hashing SHA-256, Lookalike de 1% e raio geográfico em KM.',
      icon: Users,
      href: `/publicos?empresaId=${selectedEmpresaId}`,
      badge: 'LGPD Seguro',
      iconStyle: 'bg-teal-50 text-teal-600 border border-teal-100'
    },
    {
      title: 'Saúde da Conta & Rastreamento',
      desc: 'Diagnóstico de Pixel, CAPI, catálogo e cálculo do Health Score (0-100).',
      icon: ShieldCheck,
      href: `/rastreamento?empresaId=${selectedEmpresaId}`,
      badge: 'Health Score',
      iconStyle: 'bg-cyan-50 text-cyan-600 border border-cyan-100'
    },
    {
      title: 'Automações & Guardrails',
      desc: 'Regras de proteção anti-desperdício: teto diário e limite de +20% por ação.',
      icon: Zap,
      href: `/automacoes?empresaId=${selectedEmpresaId}`,
      badge: 'Guardrails',
      iconStyle: 'bg-violet-50 text-violet-600 border border-violet-100'
    },
    {
      title: 'Minha IA & Central de Aprovações',
      desc: 'Modo de operação (Manual, Assistido, Automático) e aprovação de ações.',
      icon: Cpu,
      href: `/minha-ia?empresaId=${selectedEmpresaId}`,
      badge: 'Controle Total',
      iconStyle: 'bg-indigo-50 text-indigo-600 border border-indigo-100'
    },
    {
      title: 'Chat IA, Relatórios & Alertas',
      desc: 'Comandos operacionais em linguagem natural, relatórios executivos e alertas.',
      icon: MessageSquare,
      href: `/chat?empresaId=${selectedEmpresaId}`,
      badge: 'Assistente IA',
      iconStyle: 'bg-purple-50 text-purple-600 border border-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar - Clean Canny style */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                Tráfego IA <span className="text-indigo-600">Delivery</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Meta Ads + Prefiro Delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Llama 3.3 70B & Guardrails 20%</span>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Restaurante</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner - Canny Clean Style */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-10 mb-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs text-indigo-700 font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Plataforma SaaS B2B de Gestão de Tráfego com IA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
              Anúncios inteligentes no Meta Ads conectados ao cardápio do seu restaurante.
            </h1>
            <p className="text-slate-600 text-base leading-relaxed mb-6 font-normal">
              Automação completa para delivery: ingestão de catálogo XML, cálculo de ROAS real com vendas do balcão,
              detecção de fadiga de criativos, geração de copys com IA e guardrails de segurança orçamentária.
            </p>

            {/* Status pills - Canny style */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Meta Graph API v20</span>
              </span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cardápio Prefiro Delivery</span>
              </span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Groq Llama 3.3 70B</span>
              </span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Guardrails Orçamentários</span>
              </span>
            </div>
          </div>
        </div>

        {/* Company Context Selector */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Empresa Selecionada para Navegação</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
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
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-medium"
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
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Novo Restaurante</span>
              </Link>
            </div>
          </div>

          {selectedEmpresa && (
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">Modo de Operação</span>
                <span className="font-semibold text-indigo-600">{selectedEmpresa.modo_operacao}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">Campanhas Ativas</span>
                <span className="font-semibold text-slate-900">{selectedEmpresa._count?.campanhas ?? 2} cadastradas</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">Cardápio & Itens</span>
                <span className="font-semibold text-slate-900">{selectedEmpresa._count?.meta_produtos ?? 4} sincronizados</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">Aprovações IA</span>
                <span className="font-semibold text-slate-900">{selectedEmpresa._count?.aprovacoes ?? 1} pendente</span>
              </div>
            </div>
          )}
        </div>

        {/* Modules Grid Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Módulos do Sistema</h2>
            <p className="text-sm text-slate-500">Acesse qualquer ferramenta da plataforma diretamente:</p>
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
                className="group relative bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${mod.iconStyle} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <span>Acessar Módulo</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Rodapé Comercial Limpo */}
        <footer className="mt-16 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Tráfego IA Delivery</span>
            <span>—</span>
            <span>Plataforma SaaS de Gestão e Otimização de Anúncios para Restaurantes</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-500">
            <Link href="/onboarding" className="hover:text-indigo-600 transition">Novo Restaurante</Link>
            <Link href="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
            <Link href="/rastreamento" className="hover:text-indigo-600 transition">Saúde da Conta</Link>
            <span className="text-slate-400">© 2026 • Todos os direitos reservados</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
