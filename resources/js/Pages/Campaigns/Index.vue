<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Megaphone, 
    Play, 
    Pause, 
    Edit3, 
    ShieldAlert, 
    Check, 
    X,
    TrendingUp,
    AlertCircle
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    campanhas: Array,
});

const selectedCampaign = ref(null);
const newBudget = ref('');
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const openBudgetModal = (campanha) => {
    selectedCampaign.value = campanha;
    newBudget.value = campanha.orcamento_diario;
    errorMsg.value = '';
    successMsg.value = '';
};

const closeBudgetModal = () => {
    selectedCampaign.value = null;
    newBudget.value = '';
};

const saveBudget = async () => {
    if (!selectedCampaign.value) return;
    loading.value = true;
    errorMsg.value = '';
    successMsg.value = '';

    try {
        const res = await fetch(`/api/campaigns/${selectedCampaign.value.id}/budget`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ orcamento_diario: parseFloat(newBudget.value) }),
        });
        const data = await res.json();
        if (!res.ok) {
            errorMsg.value = data.message;
            if (data.suggested) {
                errorMsg.value += ` (Sugestão máxima permitida: R$ ${data.suggested})`;
            }
            return;
        }

        selectedCampaign.value.orcamento_diario = data.orcamento_diario;
        successMsg.value = data.message;
        setTimeout(() => closeBudgetModal(), 1500);
    } catch (e) {
        errorMsg.value = 'Erro ao processar alteração de orçamento.';
    } finally {
        loading.value = false;
    }
};

const toggleCampaign = async (campanha) => {
    try {
        const res = await fetch(`/api/campaigns/${campanha.id}/toggle`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (res.ok) {
            campanha.status = data.status;
        }
    } catch (e) {
        console.error(e);
    }
};
</script>

<template>
    <AppLayout>
        <template #header>Campanhas & Políticas de Segurança</template>

        <div class="max-w-7xl mx-auto space-y-6">
            <!-- Header & Policy Engine info banner -->
            <div class="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-5 flex items-start gap-4">
                <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <ShieldAlert class="w-4 h-4" />
                </div>
                <div>
                    <h3 class="text-sm font-bold text-indigo-950">Proteção Ativa do Policy Engine</h3>
                    <p class="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                        Qualquer alteração de orçamento é validada automaticamente pelas regras do PDF: limite de escala de até <strong>20% por ação</strong>, <strong>cooldown de 24 horas</strong> entre alterações e teto diário do restaurante de <strong>{{ formatMoney(empresa.orcamento_max_diario) }}</strong>.
                    </p>
                </div>
            </div>

            <!-- Campaign Table -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Megaphone class="w-4 h-4 text-indigo-600" />
                        <span>Campanhas Cadastradas ({{ campanhas.length }})</span>
                    </h3>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th class="p-4 pl-6">Nome da Campanha</th>
                                <th class="p-4">Objetivo</th>
                                <th class="p-4">Status</th>
                                <th class="p-4">Orçamento Diário</th>
                                <th class="p-4">Conjuntos / Anúncios</th>
                                <th class="p-4 pr-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                            <tr v-for="c in campanhas" :key="c.id" class="hover:bg-slate-50/60 transition-colors">
                                <td class="p-4 pl-6 font-bold text-slate-900">
                                    {{ c.nome }}
                                </td>
                                <td class="p-4 text-slate-500 font-mono">{{ c.objetivo }}</td>
                                <td class="p-4">
                                    <span 
                                        :class="[
                                            c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200',
                                            'px-2.5 py-0.5 rounded-full text-[11px] font-bold border'
                                        ]"
                                    >
                                        {{ c.status }}
                                    </span>
                                </td>
                                <td class="p-4 font-bold text-indigo-700">
                                    {{ formatMoney(c.orcamento_diario) }}/dia
                                </td>
                                <td class="p-4 text-slate-500">
                                    {{ c.conjuntos ? c.conjuntos.length : 0 }} conjuntos
                                </td>
                                <td class="p-4 pr-6 text-right space-x-2">
                                    <button 
                                        @click="openBudgetModal(c)"
                                        class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1"
                                    >
                                        <Edit3 class="w-3.5 h-3.5" />
                                        <span>Ajustar Budget</span>
                                    </button>
                                    <button 
                                        @click="toggleCampaign(c)"
                                        :class="[
                                            c.status === 'ACTIVE' ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
                                            'px-2.5 py-1.5 rounded-lg border font-semibold inline-flex items-center gap-1'
                                        ]"
                                    >
                                        <Pause v-if="c.status === 'ACTIVE'" class="w-3.5 h-3.5" />
                                        <Play v-else class="w-3.5 h-3.5" />
                                        <span>{{ c.status === 'ACTIVE' ? 'Pausar' : 'Ativar' }}</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Budget Modal with Policy Engine Guard -->
        <div v-if="selectedCampaign" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 class="text-sm font-bold text-slate-900">Ajuste de Orçamento Diário</h4>
                    <button @click="closeBudgetModal" class="text-slate-400 hover:text-slate-600">
                        <X class="w-4 h-4" />
                    </button>
                </div>

                <p class="text-xs text-slate-600">
                    Campanha: <strong>{{ selectedCampaign.nome }}</strong><br>
                    Orçamento Atual: <strong>{{ formatMoney(selectedCampaign.orcamento_diario) }}</strong>
                </p>

                <!-- Feedback alerts -->
                <div v-if="errorMsg" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{{ errorMsg }}</span>
                </div>
                <div v-if="successMsg" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                    <Check class="w-4 h-4 shrink-0" />
                    <span>{{ successMsg }}</span>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Novo Orçamento Diário (R$)</label>
                    <input 
                        v-model="newBudget" 
                        type="number" 
                        step="5" 
                        class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <p class="text-[11px] text-slate-400 mt-1">
                        Limite de variação: máx +20% ({{ formatMoney(selectedCampaign.orcamento_diario * 1.2) }}) ou -20% ({{ formatMoney(selectedCampaign.orcamento_diario * 0.8) }}).
                    </p>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <button @click="closeBudgetModal" class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
                        Cancelar
                    </button>
                    <button 
                        :disabled="loading" 
                        @click="saveBudget"
                        class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                    >
                        <span>Validar & Aplicar</span>
                    </button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
