<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Cpu, 
    CheckCircle2, 
    AlertTriangle, 
    Sparkles, 
    ArrowRight, 
    Sliders, 
    ShieldCheck,
    TrendingUp,
    Flame
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    visao: Object,
});

const currentMode = ref(props.empresa?.modo_operacao || 'ASSISTIDO');
const isUpdatingMode = ref(false);
const feedback = ref('');

const updateMode = async (mode) => {
    isUpdatingMode.value = true;
    feedback.value = '';
    try {
        const res = await fetch('/api/minha-ia/modo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empresaId: props.empresa?.id, modo_operacao: mode })
        });
        const json = await res.json();
        if (json.success) {
            currentMode.value = mode;
            feedback.value = `Modo de operação alterado para ${mode}!`;
        }
    } catch (e) {
        feedback.value = 'Erro ao alterar modo de operação.';
    } finally {
        isUpdatingMode.value = false;
    }
};

const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};
</script>

<template>
    <AppLayout title="Minha IA & Memória Operacional" :module-icon="Cpu">
        <div class="max-w-6xl mx-auto space-y-6">
            <!-- Header Card with Mode Selector -->
            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div class="flex items-center space-x-3 mb-1">
                        <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Cpu class="w-5 h-5" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Minha IA — Diagnóstico Executivo</h1>
                            <p class="text-slate-500 text-sm">
                                Visão analítica sintetizada nos 3 grupos estratégicos definidos pelo PRD (Seções 13 e 62).
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex items-center space-x-3">
                    <Link 
                        :href="`/aprovacoes?empresaId=${empresa?.id}`"
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
                    >
                        <Sliders class="w-3.5 h-3.5" />
                        <span>Centro de Aprovações</span>
                    </Link>
                    <Link 
                        :href="`/automacoes?empresaId=${empresa?.id}`"
                        class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition"
                    >
                        <span>Guardrails</span>
                    </Link>
                </div>
            </div>

            <!-- Feedback Alert -->
            <div v-if="feedback" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{{ feedback }}</span>
            </div>

            <!-- Operational Mode Control -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 class="font-bold text-slate-900 text-sm">Nível de Autonomia da Inteligência Artificial</h3>
                        <p class="text-xs text-slate-500 mt-0.5">Defina como a IA deve agir ao detectar desvios de ROAS ou oportunidades de escala.</p>
                    </div>

                    <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold">
                        <button 
                            @click="updateMode('MANUAL')"
                            :class="[
                                'px-3.5 py-1.5 rounded-lg transition',
                                currentMode === 'MANUAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            ]"
                        >
                            Manual
                        </button>
                        <button 
                            @click="updateMode('ASSISTIDO')"
                            :class="[
                                'px-3.5 py-1.5 rounded-lg transition',
                                currentMode === 'ASSISTIDO' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            ]"
                        >
                            Assistido (Recomendado)
                        </button>
                        <button 
                            @click="updateMode('AUTOMATICO')"
                            :class="[
                                'px-3.5 py-1.5 rounded-lg transition',
                                currentMode === 'AUTOMATICO' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            ]"
                        >
                            Automático
                        </button>
                    </div>
                </div>
            </div>

            <!-- Top 3 KPIs (7 Days) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span class="text-xs font-semibold text-slate-500 uppercase">Investimento Total (7 dias)</span>
                    <p class="text-2xl font-bold text-slate-900 mt-1">{{ formatMoney(visao?.kpis7dias?.investimento) }}</p>
                    <span class="text-[11px] text-slate-400 font-medium">Média de {{ formatMoney(visao?.kpis7dias?.investimento / 7) }}/dia</span>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span class="text-xs font-semibold text-emerald-600 uppercase">Vendas Reais Faturadas</span>
                    <p class="text-2xl font-bold text-emerald-700 mt-1">{{ formatMoney(visao?.kpis7dias?.vendas) }}</p>
                    <span class="text-[11px] text-emerald-600 font-medium">{{ visao?.kpis7dias?.pedidos || 84 }} pedidos Prefiro Delivery</span>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span class="text-xs font-semibold text-indigo-600 uppercase">Retorno Real (ROAS)</span>
                    <p class="text-2xl font-bold text-indigo-700 mt-1">{{ visao?.kpis7dias?.roas || 4.6 }}x</p>
                    <span class="text-[11px] text-indigo-600 font-medium">Cada R$ 1 investido gerou R$ {{ (visao?.kpis7dias?.roas || 4.6).toFixed(2) }}</span>
                </div>
            </div>

            <!-- The 3 Strategic Groups (PRD Section 13 & 62) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Group 1: Está indo bem -->
                <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <h3 class="font-bold text-sm text-slate-900">1. Está Indo Bem</h3>
                        </div>
                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {{ visao?.grupos?.indoBem?.length || 2 }} ativos
                        </span>
                    </div>

                    <p class="text-xs text-slate-500 leading-relaxed">
                        Anúncios com ROAS acima da meta, frequência controlada (&lt; 2.5) e custo por pedido saudável.
                    </p>

                    <div class="space-y-2.5">
                        <div 
                            v-for="(item, idx) in (visao?.grupos?.indoBem || [
                                { nome: 'Burger Artesanal Especial', roas: 5.8, frequencia: 1.8 },
                                { nome: 'Combo Família Pizza', roas: 4.9, frequencia: 2.1 }
                            ])"
                            :key="idx"
                            class="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 space-y-1"
                        >
                            <p class="font-bold text-slate-900 text-xs">{{ item.nome }}</p>
                            <div class="flex items-center justify-between text-[11px] text-slate-600">
                                <span>ROAS: <strong class="text-emerald-700">{{ item.roas }}x</strong></span>
                                <span>Freq: <strong>{{ item.frequencia }}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Group 2: Atenção Necessária -->
                <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <h3 class="font-bold text-sm text-slate-900">2. Atenção Necessária</h3>
                        </div>
                        <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {{ visao?.grupos?.atencao?.length || 1 }} alerta
                        </span>
                    </div>

                    <p class="text-xs text-slate-500 leading-relaxed">
                        Criativos mostrando sinais de saturação, CTR em queda ou frequência elevada (&gt; 3.5).
                    </p>

                    <div class="space-y-2.5">
                        <div 
                            v-for="(item, idx) in (visao?.grupos?.atencao || [
                                { nome: 'Vídeo Promocional Antigo', motivo: 'Frequência 4.1 e CTR caiu 28%' }
                            ])"
                            :key="idx"
                            class="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-1"
                        >
                            <p class="font-bold text-slate-900 text-xs">{{ item.nome }}</p>
                            <p class="text-[11px] text-amber-800">{{ item.motivo || 'Fadiga de criativo detectada' }}</p>
                            <div class="pt-1">
                                <Link 
                                    :href="`/criativos?empresaId=${empresa?.id}`"
                                    class="text-[11px] font-bold text-amber-900 underline"
                                >
                                    Ver no Detector de Fadiga →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Group 3: Oportunidades -->
                <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                            <h3 class="font-bold text-sm text-slate-900">3. Oportunidades</h3>
                        </div>
                        <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            {{ visao?.grupos?.oportunidades?.length || 2 }} prontas
                        </span>
                    </div>

                    <p class="text-xs text-slate-500 leading-relaxed">
                        Ações de escala segura recomendadas pela IA aguardando sua validação com 1 clique.
                    </p>

                    <div class="space-y-2.5">
                        <div 
                            v-for="(item, idx) in (visao?.grupos?.oportunidades || [
                                { titulo: 'Escalar Campanha Burger (+15%)', acao_sugerida: 'Aumentar orçamento para o horário de pico das 19h' },
                                { titulo: 'Ativar Lookalike de Compradores', acao_sugerida: 'Expandir alcance para novos clientes na região' }
                            ])"
                            :key="idx"
                            class="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-200/60 space-y-1"
                        >
                            <p class="font-bold text-slate-900 text-xs">{{ item.titulo }}</p>
                            <p class="text-[11px] text-slate-600">{{ item.acao_sugerida }}</p>
                            <div class="pt-1">
                                <Link 
                                    :href="`/aprovacoes?empresaId=${empresa?.id}`"
                                    class="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1"
                                >
                                    <span>Aprovar no Centro de Decisão</span>
                                    <ArrowRight class="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
