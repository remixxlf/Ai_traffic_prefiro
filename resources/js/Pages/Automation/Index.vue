<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Bot, 
    Sparkles, 
    Check, 
    X, 
    Sliders, 
    AlertTriangle, 
    ArrowRight,
    RefreshCw,
    Shield
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    aprovacoes: Array,
    automacoes: Array,
    recomendacoes: Array,
});

const aprovacoesList = ref([...props.aprovacoes]);
const recomendacoesList = ref([...props.recomendacoes]);
const generating = ref(false);
const decidingId = ref(null);
const feedbackMsg = ref('');

const decide = async (aprovacao, status) => {
    decidingId.value = aprovacao.id;
    try {
        const res = await fetch(`/api/automation/approvals/${aprovacao.id}/decide`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ status }),
        });
        const data = await res.json();
        if (res.ok) {
            aprovacao.status = status;
            feedbackMsg.value = `Ação ${status === 'APROVADO' ? 'aprovada' : 'recusada'} com sucesso!`;
            setTimeout(() => feedbackMsg.value = '', 3000);
        }
    } catch (e) {
        console.error(e);
    } finally {
        decidingId.value = null;
    }
};

const triggerNewAnalysis = async () => {
    generating.value = true;
    try {
        const res = await fetch('/api/automation/recommendations/generate', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (res.ok && data.recommendations) {
            recomendacoesList.value.unshift(...data.recommendations);
            feedbackMsg.value = data.message;
            setTimeout(() => feedbackMsg.value = '', 4000);
        }
    } catch (e) {
        console.error(e);
    } finally {
        generating.value = false;
    }
};
</script>

<template>
    <AppLayout>
        <template #header>Central de IA & Regras de Automação</template>

        <div class="max-w-7xl mx-auto space-y-8">
            <!-- Header Action Card -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
                        <Bot class="w-5 h-5" />
                    </div>
                    <div>
                        <h2 class="text-base font-bold text-slate-900">Motor de Inteligência Artificial — Groq Llama 3.3 70B</h2>
                        <p class="text-xs text-slate-500 mt-1">Especialista dedicado em conversão para cardápios e pedidos de delivery.</p>
                    </div>
                </div>

                <button 
                    @click="triggerNewAnalysis"
                    :disabled="generating"
                    class="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 flex items-center gap-2 transition-all"
                >
                    <Sparkles :class="[generating ? 'animate-spin' : '', 'w-4 h-4']" />
                    <span>{{ generating ? 'Analisando Tráfego...' : 'Disparar Nova Análise IA' }}</span>
                </button>
            </div>

            <!-- Feedback Alert -->
            <div v-if="feedbackMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Check class="w-4 h-4" />
                <span>{{ feedbackMsg }}</span>
            </div>

            <!-- Section 1: Pending Approvals -->
            <div class="space-y-4">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders class="w-4 h-4 text-indigo-600" />
                    <span>Aprovações Pendentes (Decisão Humana Necessária)</span>
                </h3>

                <div v-if="!aprovacoesList.length" class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                    Nenhuma aprovação pendente no momento.
                </div>

                <div v-else class="space-y-3">
                    <div 
                        v-for="ap in aprovacoesList" 
                        :key="ap.id"
                        class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span 
                                    :class="[
                                        ap.status === 'PENDENTE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        ap.status === 'APROVADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200',
                                        'px-2 py-0.5 rounded text-[10px] font-bold border'
                                    ]"
                                >
                                    {{ ap.status }}
                                </span>
                                <span class="text-xs font-bold text-slate-800">{{ ap.titulo }}</span>
                            </div>
                            <p class="text-xs text-slate-600">{{ ap.descricao }}</p>
                        </div>

                        <div v-if="ap.status === 'PENDENTE'" class="flex items-center gap-2 shrink-0">
                            <button 
                                @click="decide(ap, 'RECUSADO')"
                                :disabled="decidingId === ap.id"
                                class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                            >
                                <X class="w-3.5 h-3.5" />
                                <span>Recusar</span>
                            </button>
                            <button 
                                @click="decide(ap, 'APROVADO')"
                                :disabled="decidingId === ap.id"
                                class="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 text-xs font-bold flex items-center gap-1"
                            >
                                <Check class="w-3.5 h-3.5" />
                                <span>Aprovar & Executar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 2: All AI Recommendations -->
            <div class="space-y-4">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bot class="w-4 h-4 text-indigo-600" />
                    <span>Recomendações Estratégicas da IA</span>
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        v-for="rec in recomendacoesList" 
                        :key="rec.id"
                        class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
                    >
                        <div class="flex items-center justify-between">
                            <span 
                                :class="[
                                    rec.tipo === 'OPORTUNIDADE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                                    'px-2 py-0.5 rounded text-[10px] font-bold border'
                                ]"
                            >
                                {{ rec.tipo }}
                            </span>
                            <span class="text-[11px] font-medium text-slate-400">Risco: {{ rec.risco }}</span>
                        </div>

                        <h4 class="text-xs font-bold text-slate-900">{{ rec.titulo }}</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">{{ rec.analise }}</p>

                        <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
                            <p><strong>Ação sugerida:</strong> {{ rec.acao_sugerida }}</p>
                            <p class="text-emerald-700"><strong>Impacto previsto:</strong> {{ rec.impacto_prev }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
