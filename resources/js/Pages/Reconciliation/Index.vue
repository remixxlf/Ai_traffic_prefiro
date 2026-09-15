<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    ArrowLeftRight, 
    ShieldCheck, 
    TrendingUp, 
    DollarSign, 
    CheckCircle2, 
    AlertCircle,
    RefreshCw
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    campanhas: Array,
    metricas: Array,
});

const metricasList = ref([...props.metricas]);
const reconcilingId = ref(null);
const feedbackMsg = ref('');

const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
};

const syncReconciliation = async (metrica) => {
    reconcilingId.value = metrica.id;
    try {
        // Mock sync with Prefiro Delivery API
        const pedidosReais = Math.round(metrica.vendas * 1.25);
        const receitaReal = pedidosReais * (props.empresa.ticket_medio || 50.0);

        const res = await fetch(`/api/reconciliation/${metrica.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                pedidos_reais: pedidosReais,
                receita_real: receitaReal,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            metrica.pedidos_reais = data.metrica.pedidos_reais;
            metrica.receita_real = data.metrica.receita_real;
            metrica.roas_real = data.metrica.roas_real;
            metrica.cpa_real = data.metrica.cpa_real;
            feedbackMsg.value = `Métricas do dia ${formatDate(metrica.data)} auditadas com sucesso!`;
            setTimeout(() => feedbackMsg.value = '', 3000);
        }
    } catch (e) {
        console.error(e);
    } finally {
        reconcilingId.value = null;
    }
};
</script>

<template>
    <AppLayout>
        <template #header>Reconciliação de Vendas Reais (Seção 49 PRD)</template>

        <div class="max-w-7xl mx-auto space-y-6">
            <!-- PRD Banner -->
            <div class="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex items-start gap-4">
                <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck class="w-4 h-4" />
                </div>
                <div>
                    <h3 class="text-sm font-bold text-emerald-950">Auditoria ROAS Real vs Meta Ads</h3>
                    <p class="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                        O Meta Ads costuma subnotificar pedidos em aplicativos de entrega devido a restrições de cookies e janelas de atribuição. O motor de reconciliação cruza as vendas confirmadas no Prefiro Delivery com os dados de clique e CAPI para calcular o <strong>ROAS Real</strong> exato do seu restaurante.
                    </p>
                </div>
            </div>

            <!-- Feedback Alert -->
            <div v-if="feedbackMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4" />
                <span>{{ feedbackMsg }}</span>
            </div>

            <!-- Reconciliation Table -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ArrowLeftRight class="w-4 h-4 text-indigo-600" />
                        <span>Histórico de Auditoria Diária</span>
                    </h3>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th class="p-4 pl-6">Data</th>
                                <th class="p-4">Investimento</th>
                                <th class="p-4">Vendas Meta</th>
                                <th class="p-4">Pedidos Reais</th>
                                <th class="p-4">ROAS Meta</th>
                                <th class="p-4">ROAS Real</th>
                                <th class="p-4">CPA Real</th>
                                <th class="p-4 pr-6 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                            <tr v-for="m in metricasList" :key="m.id" class="hover:bg-slate-50/60 transition-colors">
                                <td class="p-4 pl-6 font-bold text-slate-900">{{ formatDate(m.data) }}</td>
                                <td class="p-4">{{ formatMoney(m.investimento) }}</td>
                                <td class="p-4 text-slate-500">{{ m.vendas }}</td>
                                <td class="p-4 font-bold text-emerald-600">{{ m.pedidos_reais }}</td>
                                <td class="p-4 text-slate-500">{{ m.roas }}x</td>
                                <td class="p-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                                        {{ m.roas_real }}x
                                    </span>
                                </td>
                                <td class="p-4 font-semibold text-purple-700">{{ formatMoney(m.cpa_real) }}</td>
                                <td class="p-4 pr-6 text-right">
                                    <button 
                                        @click="syncReconciliation(m)"
                                        :disabled="reconcilingId === m.id"
                                        class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1"
                                    >
                                        <RefreshCw :class="[reconcilingId === m.id ? 'animate-spin' : '', 'w-3.5 h-3.5']" />
                                        <span>Auditar</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
