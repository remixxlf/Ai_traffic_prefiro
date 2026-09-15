<script setup>
import { Link, usePage } from '@inertiajs/vue3';
import { 
    LayoutDashboard, 
    Megaphone, 
    ShieldAlert, 
    Bot, 
    ArrowLeftRight, 
    Store,
    Bell,
    ChevronRight,
    ExternalLink
} from 'lucide-vue-next';

const page = usePage();
const empresa = page.props.empresa || { nome: 'Burger Mania Delivery', segmento: 'Hamburgueria Artesanal' };

const navItems = [
    { name: 'Dashboard Geral', href: '/', icon: LayoutDashboard },
    { name: 'Campanhas & Orçamento', href: '/campaigns', icon: Megaphone },
    { name: 'Fadiga Criativa', href: '/creative-fatigue', icon: ShieldAlert },
    { name: 'IA & Automação', href: '/automation', icon: Bot },
    { name: 'Reconciliação ROAS Real', href: '/reconciliation', icon: ArrowLeftRight },
];
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-20">
            <!-- Brand Header -->
            <div class="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
                <div class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
                    P
                </div>
                <div>
                    <h1 class="text-sm font-bold text-slate-900 tracking-tight leading-none">Prefiro Traffic AI</h1>
                    <p class="text-[11px] font-medium text-indigo-600 mt-0.5">Delivery Specialist</p>
                </div>
            </div>

            <!-- Restaurant Pill -->
            <div class="p-4 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        <Store class="w-4 h-4" />
                    </div>
                    <div class="truncate">
                        <p class="text-xs font-semibold text-slate-800 truncate">{{ empresa.nome }}</p>
                        <p class="text-[10px] text-slate-500 truncate">{{ empresa.segmento || 'Restaurante Parceiro' }}</p>
                    </div>
                </div>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 px-3 space-y-1 overflow-y-auto">
                <Link 
                    v-for="item in navItems" 
                    :key="item.name" 
                    :href="item.href"
                    :class="[
                        $page.url === item.href || ($page.url === '' && item.href === '/')
                            ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors'
                    ]"
                >
                    <component :is="item.icon" class="w-4 h-4 shrink-0" />
                    <span>{{ item.name }}</span>
                </Link>
            </nav>

            <!-- Bottom Meta Badge & Onboarding link -->
            <div class="p-4 border-t border-slate-100 space-y-2">
                <Link href="/onboarding" class="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                    <span>Configurações / Setup</span>
                    <ChevronRight class="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <div class="flex items-center gap-2 px-2 py-1 text-[11px] text-slate-400">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Meta Graph API v21.0 Online</span>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 pl-64 flex flex-col min-h-screen">
            <!-- Top Navbar -->
            <header class="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Plataforma</span>
                    <span class="text-slate-300">/</span>
                    <span class="text-sm font-semibold text-slate-800">
                        <slot name="header">Painel Principal</slot>
                    </span>
                </div>

                <div class="flex items-center gap-4">
                    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        CAPI & Pixel Ativos
                    </div>

                    <a 
                        v-if="empresa.site"
                        :href="empresa.site" 
                        target="_blank" 
                        class="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                    >
                        <span>Ver Cardápio</span>
                        <ExternalLink class="w-3 h-3" />
                    </a>
                </div>
            </header>

            <!-- Page Body -->
            <main class="flex-1 p-8">
                <slot />
            </main>
        </div>
    </div>
</template>
