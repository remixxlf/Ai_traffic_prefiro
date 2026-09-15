<script setup>
import { computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import {
    BarChart3,
    Store,
    Layers,
    TrendingUp,
    Sparkles,
    Image as ImageIcon,
    Users,
    ShieldCheck,
    Zap,
    Cpu,
    MessageSquare,
    FileText,
    Bell,
    ArrowRight,
    PlusCircle,
    CheckCircle2,
    Sliders
} from 'lucide-vue-next';

const props = defineProps({
    empresas: Array,
    selectedEmpresa: Object,
    counts: Object,
});

const modules = computed(() => {
    const empId = props.selectedEmpresa?.id || '';
    return [
        {
            title: 'Dashboard Executivo & ROAS Real',
            desc: 'Métricas integradas: Receita, ROAS Real vs Meta, Vendas Delivery e CAC.',
            icon: BarChart3,
            href: `/dashboard?empresaId=${empId}`,
            badge: 'Tempo Real',
            iconStyle: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
        },
        {
            title: 'Onboarding & Memória de Negócio',
            desc: 'Configuração em 4 etapas: horários fortes, ticket médio, site e perfil do restaurante.',
            icon: Store,
            href: '/onboarding',
            badge: 'Wizard Guiado',
            iconStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        },
        {
            title: 'Hub de Integrações',
            desc: 'Conexão Meta Ads Graph API v21 e ingestão do cardápio Prefiro Delivery.',
            icon: Layers,
            href: `/integracoes?empresaId=${empId}`,
            badge: 'Meta & Delivery',
            iconStyle: 'bg-blue-50 text-blue-600 border border-blue-100',
        },
        {
            title: 'Catálogo & Campanhas de Pratos',
            desc: 'Sincronização de cardápio XML, pausa automática e anúncios por item.',
            icon: Layers,
            href: `/catalogo?empresaId=${empId}`,
            badge: 'Auto-Sync',
            iconStyle: 'bg-amber-50 text-amber-600 border border-amber-100',
        },
        {
            title: 'Gestão de Campanhas',
            desc: 'Listagem, orçamentos, monitoramento e criação guiada em 5 passos.',
            icon: TrendingUp,
            href: `/campanhas?empresaId=${empId}`,
            badge: 'Campanhas',
            iconStyle: 'bg-sky-50 text-sky-600 border border-sky-100',
        },
        {
            title: 'Copywriting com IA',
            desc: 'Geração de copys com 3 variações estratégicas (Urgência, Sensorial, Prova Social).',
            icon: Sparkles,
            href: `/copywriting?empresaId=${empId}`,
            badge: 'Groq 70B',
            iconStyle: 'bg-rose-50 text-rose-600 border border-rose-100',
        },
        {
            title: 'Biblioteca de Criativos & Fadiga',
            desc: 'Monitoramento de CTR e frequência. Detecção de fadiga (>3.5 freq, -25% CTR).',
            icon: ImageIcon,
            href: `/criativos?empresaId=${empId}`,
            badge: 'Detector Fadiga',
            iconStyle: 'bg-orange-50 text-orange-600 border border-orange-100',
        },
        {
            title: 'Públicos & Segmentação LGPD',
            desc: 'Audiências com hashing SHA-256, Lookalike de 1% e raio geográfico em KM.',
            icon: Users,
            href: `/publicos?empresaId=${empId}`,
            badge: 'LGPD Seguro',
            iconStyle: 'bg-teal-50 text-teal-600 border border-teal-100',
        },
        {
            title: 'Saúde da Conta & Rastreamento',
            desc: 'Diagnóstico de Pixel, CAPI, catálogo e cálculo do Health Score (0-100).',
            icon: ShieldCheck,
            href: `/rastreamento?empresaId=${empId}`,
            badge: 'Health Score',
            iconStyle: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
        },
        {
            title: 'Automações & Guardrails',
            desc: 'Regras de proteção anti-desperdício: teto diário e limite de +20% por ação.',
            icon: Zap,
            href: `/automacoes?empresaId=${empId}`,
            badge: 'Guardrails',
            iconStyle: 'bg-violet-50 text-violet-600 border border-violet-100',
        },
        {
            title: 'Minha IA & Memória Operacional',
            desc: 'Modo de operação (Manual, Assistido, Automático) e análise nos 3 grupos.',
            icon: Cpu,
            href: `/minha-ia?empresaId=${empId}`,
            badge: 'Controle Total',
            iconStyle: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
        },
        {
            title: 'Central de Aprovações',
            desc: 'Aprovação humana assistida para recomendações de escala e corte.',
            icon: Sliders,
            href: `/aprovacoes?empresaId=${empId}`,
            badge: 'Aprovações',
            iconStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        },
        {
            title: 'Chat IA & Assistente',
            desc: 'Comandos operacionais em linguagem natural para criação e dúvidas.',
            icon: MessageSquare,
            href: `/chat?empresaId=${empId}`,
            badge: 'Assistente IA',
            iconStyle: 'bg-purple-50 text-purple-600 border border-purple-100',
        },
        {
            title: 'Relatórios Automáticos',
            desc: 'Relatório diário (resumo de ontem) e semanal consolidado com ROAS Real.',
            icon: FileText,
            href: `/relatorios?empresaId=${empId}`,
            badge: 'Relatórios',
            iconStyle: 'bg-blue-50 text-blue-600 border border-blue-100',
        },
        {
            title: 'Central de Alertas & Notificações',
            desc: 'Monitoramento de CPA elevado, campanhas rejeitadas e saturação de público.',
            icon: Bell,
            href: `/alertas?empresaId=${empId}`,
            badge: 'Alertas',
            iconStyle: 'bg-amber-50 text-amber-600 border border-amber-100',
        },
    ];
});

const onSelectEmpresa = (e) => {
    const id = e.target.value;
    router.visit(`/?empresaId=${id}`);
};
</script>

<template>
    <AppLayout>
        <!-- Hero Banner - Canny Clean Style -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-10 mb-8 shadow-xs">
            <div class="max-w-3xl">
                <div class="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs text-indigo-700 font-medium mb-4">
                    <Sparkles class="w-3.5 h-3.5 text-indigo-600" />
                    <span>Plataforma SaaS B2B de Gestão de Tráfego com IA</span>
                </div>

                <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
                    Anúncios inteligentes no Meta Ads conectados ao cardápio do seu restaurante.
                </h1>
                <p class="text-slate-600 text-base leading-relaxed mb-6 font-normal">
                    Automação completa para delivery: ingestão de catálogo XML, cálculo de ROAS real com vendas do balcão,
                    detecção de fadiga de criativos, geração de copys com IA e guardrails de segurança orçamentária.
                </p>

                <!-- Status pills -->
                <div class="flex flex-wrap gap-2 text-xs">
                    <span class="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                        <span>Meta Graph API v21</span>
                    </span>
                    <span class="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cardápio Prefiro Delivery</span>
                    </span>
                    <span class="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                        <span>Groq Llama 3.3 70B</span>
                    </span>
                    <span class="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                        <ShieldCheck class="w-3.5 h-3.5 text-indigo-600" />
                        <span>Guardrails Orçamentários</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Company Context Selector Card -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-xs">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div class="flex items-center space-x-2">
                        <Store class="w-5 h-5 text-indigo-600" />
                        <h2 class="text-lg font-bold text-slate-900">Empresa Selecionada para Navegação</h2>
                    </div>
                    <p class="text-sm text-slate-500 mt-1">
                        {{ selectedEmpresa ? `${selectedEmpresa.nome} • ${selectedEmpresa.segmento || 'Hamburgueria Artesanal'} • ${selectedEmpresa.cidade || 'São Paulo'}/${selectedEmpresa.estado || 'SP'}` : 'Carregando empresa...' }}
                    </p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <select
                        v-if="empresas && empresas.length > 0"
                        :value="selectedEmpresa?.id"
                        @change="onSelectEmpresa"
                        class="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-medium cursor-pointer"
                    >
                        <option v-for="emp in empresas" :key="emp.id" :value="emp.id">
                            {{ emp.nome }} ({{ emp.modo_operacao || 'ASSISTIDO' }})
                        </option>
                    </select>

                    <Link
                        href="/onboarding"
                        class="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200"
                    >
                        <PlusCircle class="w-4 h-4 text-white" />
                        <span>Novo Restaurante</span>
                    </Link>
                </div>
            </div>

            <!-- Summary metrics pills -->
            <div v-if="selectedEmpresa" class="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span class="text-slate-500 block text-[11px]">Modo de Operação</span>
                    <span class="font-semibold text-indigo-600">{{ selectedEmpresa.modo_operacao || 'ASSISTIDO' }}</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span class="text-slate-500 block text-[11px]">Campanhas Ativas</span>
                    <span class="font-semibold text-slate-900">{{ counts?.campanhas ?? 1 }} cadastradas</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span class="text-slate-500 block text-[11px]">Cardápio & Itens</span>
                    <span class="font-semibold text-slate-900">{{ counts?.produtos ?? 2 }} sincronizados</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span class="text-slate-500 block text-[11px]">Aprovações IA</span>
                    <span class="font-semibold text-slate-900">{{ counts?.aprovacoes ?? 1 }} pendente</span>
                </div>
            </div>
        </div>

        <!-- Modules Grid Header -->
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-slate-900 tracking-tight">Módulos do Sistema</h2>
                <p class="text-sm text-slate-500">Acesse qualquer ferramenta da plataforma diretamente:</p>
            </div>
        </div>

        <!-- 15 Modules Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Link
                v-for="(mod, idx) in modules"
                :key="idx"
                :href="mod.href"
                class="group relative bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div :class="['w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105', mod.iconStyle]">
                            <component :is="mod.icon" class="w-5 h-5" />
                        </div>
                        <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                            {{ mod.badge }}
                        </span>
                    </div>

                    <h3 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                        {{ mod.title }}
                    </h3>
                    <p class="text-xs text-slate-500 leading-relaxed font-normal">
                        {{ mod.desc }}
                    </p>
                </div>

                <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <span>Acessar Módulo</span>
                    <ArrowRight class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        </div>
    </AppLayout>
</template>
