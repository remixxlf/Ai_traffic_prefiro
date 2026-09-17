<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Users, 
    ShieldCheck, 
    RefreshCw, 
    CheckCircle2, 
    PlusCircle,
    MapPin
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    publicos: Array,
    lookalikeEligibility: Object,
});

const isSyncing = ref(false);
const isCreatingLookalike = ref(false);
const feedback = ref('');

const handleSyncClientes = async () => {
    isSyncing.value = true;
    feedback.value = '';
    try {
        const res = await fetch(`/api/publicos/sync-clientes?empresaId=${props.empresa?.id}`, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
            feedback.value = 'Clientes do delivery sincronizados com sucesso via hashing SHA-256 (LGPD)!';
        }
    } catch (e) {
        feedback.value = 'Erro ao sincronizar clientes.';
    } finally {
        isSyncing.value = false;
    }
};

const handleCreateLookalike = async () => {
    isCreatingLookalike.value = true;
    feedback.value = '';
    try {
        const res = await fetch(`/api/publicos/lookalike?empresaId=${props.empresa?.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ratio: 0.01 })
        });
        const json = await res.json();
        if (json.success) {
            feedback.value = `Público Semelhante (1%) gerado com sucesso pelo algoritmo da Meta!`;
        }
    } catch (e) {
        feedback.value = 'Erro ao criar lookalike.';
    } finally {
        isCreatingLookalike.value = false;
    }
};
</script>

<template>
    <AppLayout title="Públicos & Segmentação LGPD" :module-icon="Users">
        <div class="max-w-5xl mx-auto space-y-6">
            <!-- Header Card -->
            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center space-x-3 mb-1">
                        <div class="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                            <Users class="w-5 h-5" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Públicos & Segmentação LGPD</h1>
                            <p class="text-slate-500 text-sm">
                                Audiências inteligentes com nomes de negócio e hashing irreversível SHA-256 em conformidade com a LGPD.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex items-center space-x-2">
                    <button 
                        @click="handleSyncClientes"
                        :disabled="isSyncing"
                        class="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
                    >
                        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSyncing }" />
                        <span>Sincronizar Meus Clientes (LGPD)</span>
                    </button>
                    <button 
                        @click="handleCreateLookalike"
                        :disabled="isCreatingLookalike"
                        class="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-200"
                    >
                        <Sparkles class="w-3.5 h-3.5" />
                        <span>Gerar Semelhante (1%)</span>
                    </button>
                </div>
            </div>

            <!-- Feedback Alert -->
            <div v-if="feedback" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{{ feedback }}</span>
            </div>


            <!-- Audiences Table -->
            <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="font-bold text-slate-900 text-sm">Audiências Cadastradas no Meta Ads</h3>
                    <span class="text-xs text-slate-400 font-medium">Nomes amigáveis mapeados automaticamente</span>
                </div>

                <div class="divide-y divide-slate-100">
                    <div 
                        v-for="pub in publicos" 
                        :key="pub.id"
                        class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                    >
                        <div class="space-y-1">
                            <div class="flex items-center space-x-2">
                                <span class="font-bold text-slate-900 text-sm">{{ pub.nome }}</span>
                                <span :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    pub.tipo === 'LOOKALIKE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    pub.tipo === 'CUSTOM' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    'bg-teal-50 text-teal-700 border-teal-200'
                                ]">
                                    {{ pub.tipo === 'LOOKALIKE' ? 'Semelhante (Lookalike)' : pub.tipo === 'CUSTOM' ? 'Meus Clientes' : 'Público Local' }}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500">{{ pub.descricao || 'Público otimizado para o delivery' }}</p>
                        </div>

                        <div class="flex items-center space-x-6 text-xs text-slate-600 shrink-0">
                            <div>
                                <span class="text-[11px] text-slate-400 block font-semibold">Tamanho Estimado</span>
                                <span class="font-bold text-slate-900">{{ pub.tamanho_estimado ? pub.tamanho_estimado.toLocaleString('pt-BR') : '140.000 - 180.000' }} pessoas</span>
                            </div>
                            <div>
                                <span class="text-[11px] text-slate-400 block font-semibold">Raio Geográfico</span>
                                <span class="font-bold text-slate-900">{{ pub.raio_km || empresa?.raio_atendimento || 8 }} km</span>
                            </div>
                            <span class="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Pronto</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
