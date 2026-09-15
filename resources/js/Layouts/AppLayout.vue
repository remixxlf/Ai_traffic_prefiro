<script setup>
import { computed } from 'vue';
import { Link, usePage, router } from '@inertiajs/vue3';
import { 
    Bot, 
    ArrowLeft, 
    PlusCircle, 
    Store,
    Sparkles
} from 'lucide-vue-next';

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    moduleIcon: {
        type: Object,
        default: null
    }
});

const page = usePage();
const empresa = computed(() => page.props.empresa || { id: '', nome: 'Burger Mania Delivery', modo_operacao: 'ASSISTIDO' });
const empresas = computed(() => page.props.empresas || [empresa.value]);

const isHome = computed(() => page.url === '/' || page.url === '');

const onEmpresaChange = (e) => {
    const newId = e.target.value;
    if (newId) {
        router.visit(`${window.location.pathname}?empresaId=${newId}`);
    }
};
</script>

<template>
    <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <!-- Top Navbar - Clean Canny style -->
        <header class="border-b border-slate-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <!-- Left brand or back-to-hub breadcrumb -->
                <div class="flex items-center space-x-3">
                    <template v-if="isHome">
                        <Link href="/" class="flex items-center space-x-3 group">
                            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 transition-transform group-hover:scale-105">
                                <Bot class="w-5 h-5" />
                            </div>
                            <div>
                                <span class="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                                    Tráfego IA <span class="text-indigo-600">Delivery</span>
                                </span>
                                <p class="text-[11px] text-slate-500 font-medium">Meta Ads + Prefiro Delivery</p>
                            </div>
                        </Link>
                    </template>
                    <template v-else>
                        <Link
                            href="/"
                            class="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition bg-slate-100/80 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200"
                        >
                            <ArrowLeft class="w-3.5 h-3.5" />
                            <span>Voltar ao Hub</span>
                        </Link>
                        <span class="text-slate-300">/</span>
                        <div class="flex items-center space-x-2">
                            <div v-if="moduleIcon" class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                                <component :is="moduleIcon" class="w-4 h-4" />
                            </div>
                            <span class="font-bold text-sm text-slate-900">{{ title || 'Módulo' }}</span>
                        </div>
                    </template>
                </div>

                <!-- Right Tools & Empresa Selector -->
                <div class="flex items-center space-x-3">
                    <div class="hidden md:flex items-center space-x-2 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
                        <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Llama 3.3 70B & Guardrails 20%</span>
                    </div>

                    <!-- Active Empresa Dropdown -->
                    <div v-if="empresas && empresas.length > 0" class="hidden sm:flex items-center">
                        <select
                            :value="empresa.id"
                            @change="onEmpresaChange"
                            class="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold cursor-pointer"
                        >
                            <option v-for="emp in empresas" :key="emp.id" :value="emp.id">
                                {{ emp.nome }} ({{ emp.modo_operacao || 'ASSISTIDO' }})
                            </option>
                        </select>
                    </div>

                    <Link
                        href="/onboarding"
                        class="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition shadow-sm shadow-indigo-200"
                    >
                        <PlusCircle class="w-4 h-4" />
                        <span>Novo Restaurante</span>
                    </Link>
                </div>
            </div>
        </header>

        <!-- Main Content Slot -->
        <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <slot />
        </main>

        <!-- Rodapé Comercial Limpo Canny Style -->
        <footer class="mt-auto border-t border-slate-200/80 bg-white py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div class="flex items-center space-x-2">
                    <span class="font-semibold text-slate-700">Tráfego IA Delivery</span>
                    <span>—</span>
                    <span>Plataforma SaaS de Gestão e Otimização de Anúncios para Restaurantes</span>
                </div>
                <div class="flex items-center space-x-6 text-slate-500 font-medium">
                    <Link href="/onboarding" class="hover:text-indigo-600 transition">Novo Restaurante</Link>
                    <Link href="/dashboard" class="hover:text-indigo-600 transition">Dashboard</Link>
                    <Link href="/rastreamento" class="hover:text-indigo-600 transition">Saúde da Conta</Link>
                    <span class="text-slate-400">© 2026 • Todos os direitos reservados</span>
                </div>
            </div>
        </footer>
    </div>
</template>
