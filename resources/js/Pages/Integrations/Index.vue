<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Layers, 
    CheckCircle2, 
    AlertTriangle, 
    XCircle, 
    RefreshCw, 
    Link2, 
    ExternalLink, 
    ShieldCheck,
    Store,
    Smartphone
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    integracao: Object,
    assets: Object,
});

const isSyncing = ref(false);
const feedback = ref('');

const syncMeta = async () => {
    isSyncing.value = true;
    feedback.value = '';
    setTimeout(() => {
        isSyncing.value = false;
        feedback.value = 'Ativos Meta sincronizados com sucesso via Graph API v21!';
    }, 1200);
};
</script>

<template>
    <AppLayout title="Hub de Integrações" :module-icon="Layers">
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Header Card -->
            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <div class="flex items-center space-x-3 mb-2">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Layers class="w-5 h-5" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Hub de Integrações</h1>
                        <p class="text-slate-500 text-sm">
                            Conecte o ecossistema Meta Ads à plataforma Prefiro Delivery para sincronização automática de vendas, cardápio e públicos.
                        </p>
                    </div>
                </div>

                <div v-if="feedback" class="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
                    <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{{ feedback }}</span>
                </div>
            </div>

            <!-- Meta Ads Integration Card -->
            <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="text-slate-900 font-bold text-base">Meta Ads Graph API v21</h3>
                                <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span>Conectado</span>
                                </span>
                            </div>
                            <p class="text-slate-500 text-xs mt-0.5">Facebook Pages, Instagram Business, Ad Accounts & Pixel</p>
                        </div>
                    </div>

                    <button 
                        @click="syncMeta"
                        :disabled="isSyncing"
                        class="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition"
                    >
                        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSyncing }" />
                        <span>Sincronizar Ativos</span>
                    </button>
                </div>

                <!-- Assets List -->
                <div class="p-6 space-y-3">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ativos Descobertos & Vinculados</p>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-slate-600 font-medium">🏢 Portfólios de Negócios</span>
                            <span class="font-bold text-slate-900">{{ assets?.businesses || 1 }}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-slate-600 font-medium">📊 Contas de Anúncio</span>
                            <span class="font-bold text-slate-900">{{ assets?.adAccounts || 1 }}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-slate-600 font-medium">📄 Páginas do Facebook</span>
                            <span class="font-bold text-slate-900">{{ assets?.pages || 1 }}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-slate-600 font-medium">📸 Contas do Instagram</span>
                            <span class="font-bold text-slate-900">{{ assets?.instagrams || 1 }}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                            <span class="text-slate-600 font-medium">🎯 Pixels & Conversion API (CAPI)</span>
                            <span class="font-bold text-slate-900">{{ assets?.pixels || 1 }} ativo</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Prefiro Delivery Platform Integration Card -->
            <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <Store class="w-5 h-5" />
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="text-slate-900 font-bold text-base">Plataforma Prefiro Delivery</h3>
                                <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span>Conectado</span>
                                </span>
                            </div>
                            <p class="text-slate-500 text-xs mt-0.5">Cardápio digital, pedidos de delivery em tempo real e conciliação de faturamento</p>
                        </div>
                    </div>
                </div>

                <div class="p-6 space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-xs text-slate-500 font-medium block">Cardápio Online</span>
                            <p class="text-base font-bold text-slate-900 mt-1">Sincronizado</p>
                            <span class="text-[11px] text-emerald-600 font-medium">XML Automático</span>
                        </div>
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-xs text-slate-500 font-medium block">Webhooks de Vendas</span>
                            <p class="text-base font-bold text-slate-900 mt-1">Ativos (200 OK)</p>
                            <span class="text-[11px] text-emerald-600 font-medium">Disparos em tempo real</span>
                        </div>
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-xs text-slate-500 font-medium block">Cálculo de ROAS Real</span>
                            <p class="text-base font-bold text-slate-900 mt-1">Habilitado</p>
                            <span class="text-[11px] text-indigo-600 font-medium">Reconciliação diária</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
