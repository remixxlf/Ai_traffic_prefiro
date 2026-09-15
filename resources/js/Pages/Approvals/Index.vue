<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Sliders, 
    CheckCircle2, 
    XCircle, 
    Sparkles, 
    ShieldCheck, 
    TrendingUp, 
    ArrowLeft,
    Clock
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    aprovacoes: Array,
});

const processingId = ref(null);
const feedback = ref('');

const handleDecidir = async (aprovacaoId, decisao) => {
    processingId.value = aprovacaoId;
    feedback.value = '';
    try {
        const res = await fetch('/api/aprovacoes/decidir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aprovacaoId, decisao })
        });
        const json = await res.json();
        if (json.success) {
            feedback.value = decisao === 'APROVAR' 
                ? '✅ Decisão executada com sucesso! As alterações foram enviadas para o Meta Ads.' 
                : '🛑 Recomendação recusada e arquivada.';
            const item = props.aprovacoes.find(a => a.id === aprovacaoId);
            if (item) {
                item.status = decisao === 'APROVAR' ? 'APROVADO' : 'REJEITADO';
            }
        }
    } catch (e) {
        feedback.value = 'Erro ao processar decisão.';
    } finally {
        processingId.value = null;
    }
};
</script>

<template>
    <AppLayout title="Central de Aprovações" :module-icon="Sliders">
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Header Card -->
            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center space-x-3 mb-1">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <Sliders class="w-5 h-5" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Central de Aprovações</h1>
                            <p class="text-slate-500 text-sm">
                                No Modo Assistido, a IA elabora a estratégia e você decide com 1 clique antes da execução no Meta Ads.
                            </p>
                        </div>
                    </div>
                </div>

                <Link 
                    :href="`/minha-ia?empresaId=${empresa?.id}`"
                    class="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
                >
                    <ArrowLeft class="w-3.5 h-3.5" />
                    <span>Ver Diagnóstico IA</span>
                </Link>
            </div>

            <!-- Feedback Alert -->
            <div v-if="feedback" class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
                {{ feedback }}
            </div>

            <!-- Approvals List -->
            <div class="space-y-4">
                <div v-if="!aprovacoes || aprovacoes.length === 0" class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        ✓
                    </div>
                    <h3 class="font-bold text-slate-900 text-base">Tudo em dia!</h3>
                    <p class="text-xs text-slate-500 mt-1">Nenhuma recomendação pendente de aprovação humana no momento.</p>
                </div>

                <div 
                    v-for="ap in aprovacoes" 
                    :key="ap.id"
                    class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 transition"
                    :class="{ 'opacity-60 bg-slate-50/50': ap.status !== 'PENDENTE' }"
                >
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div class="flex items-center space-x-2">
                            <span class="w-2 h-2 rounded-full" :class="ap.status === 'PENDENTE' ? 'bg-amber-500 animate-pulse' : ap.status === 'APROVADO' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ ap.tipo_acao }}</span>
                        </div>
                        <span :class="[
                            'text-[11px] font-bold px-2.5 py-0.5 rounded-full border',
                            ap.status === 'PENDENTE' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            ap.status === 'APROVADO' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-rose-50 text-rose-800 border-rose-200'
                        ]">
                            {{ ap.status === 'PENDENTE' ? 'Aguardando Decisão Humana' : ap.status === 'APROVADO' ? 'Aprovado & Executado' : 'Recusado' }}
                        </span>
                    </div>

                    <div class="space-y-1.5">
                        <h4 class="font-bold text-slate-900 text-sm">{{ ap.descricao }}</h4>
                        <p v-if="ap.recomendacao?.analise" class="text-xs text-slate-600 leading-relaxed">
                            {{ ap.recomendacao.analise }}
                        </p>
                    </div>

                    <div v-if="ap.recomendacao?.impacto_prev" class="p-3 bg-emerald-50/50 rounded-xl text-xs text-emerald-900 font-medium flex items-center space-x-2">
                        <Sparkles class="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Impacto Estimado:</strong> {{ ap.recomendacao.impacto_prev }}</span>
                    </div>

                    <div v-if="ap.status === 'PENDENTE'" class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                        <button 
                            @click="handleDecidir(ap.id, 'RECUSAR')"
                            :disabled="processingId === ap.id"
                            class="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded-xl transition"
                        >
                            Descartar
                        </button>
                        <button 
                            @click="handleDecidir(ap.id, 'APROVAR')"
                            :disabled="processingId === ap.id"
                            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                        >
                            <span v-if="processingId === ap.id" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <CheckCircle2 v-else class="w-3.5 h-3.5" />
                            <span>Aprovar e Executar Agora</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
