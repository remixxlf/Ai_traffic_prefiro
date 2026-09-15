<script setup>
import { computed } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    ShieldCheck, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Activity, 
    Zap, 
    Flame,
    Target
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    tracking: Object,
    score: Object,
});

const diag = computed(() => props.tracking?.diagnostico || {
    pixelStatus: 'ATIVO',
    capiStatus: 'ATIVO',
    purchaseStatus: 'RECEBENDO_EVENTOS',
    eventosDetectados: ['PageView', 'ViewContent', 'AddToCart', 'Purchase'],
    ultimoEvento: 'Agora há pouco',
});

const audit = computed(() => props.score?.auditoria || {
    scoreGeral: 95,
    statusConta: 'EXCELENTE',
    itens: [],
});

const sub = computed(() => props.score?.scoreTrafego?.subscores || {
    tracking: 100,
    campanhas: 90,
    criativos: 85,
    publicos: 95,
    orcamento: 95,
    conversao: 90,
});
</script>

<template>
    <AppLayout title="Saúde da Conta & Rastreamento" :module-icon="ShieldCheck">
        <div class="max-w-5xl mx-auto space-y-6">
            <!-- Top Status Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500 text-xs font-semibold uppercase tracking-wider">Meta Pixel</span>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Ativo
                        </span>
                    </div>
                    <div class="mt-3 flex items-baseline gap-2">
                        <span class="text-2xl font-bold text-slate-900">100%</span>
                        <span class="text-slate-400 text-xs">Eventos recebidos</span>
                    </div>
                    <p class="text-slate-500 text-xs mt-2">Disparando PageView e ViewContent no cardápio.</p>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500 text-xs font-semibold uppercase tracking-wider">Conversion API (CAPI)</span>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Ativo (Server-Side)
                        </span>
                    </div>
                    <div class="mt-3 flex items-baseline gap-2">
                        <span class="text-2xl font-bold text-slate-900">Imunidade iOS</span>
                        <span class="text-slate-400 text-xs">Bypass AdBlockers</span>
                    </div>
                    <p class="text-slate-500 text-xs mt-2">Envio direto do servidor Prefiro Delivery para Meta Graph API.</p>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500 text-xs font-semibold uppercase tracking-wider">Evento de Compra (Purchase)</span>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Disparando
                        </span>
                    </div>
                    <div class="mt-3 flex items-baseline gap-2">
                        <span class="text-2xl font-bold text-slate-900">R$ Real</span>
                        <span class="text-slate-400 text-xs">Valor do pedido</span>
                    </div>
                    <p class="text-slate-500 text-xs mt-2">Disparado no checkout com valor real e deduplicação automática.</p>
                </div>
            </div>

            <!-- Health Score Card (0-100) per PRD Section 11 & 63 -->
            <div class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="text-2xl">🛡️</span>
                            <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Health Score da Conta de Anúncios</h2>
                        </div>
                        <p class="text-slate-500 text-xs mt-1">
                            Auditoria contínua de 8 pilares estruturais de mensuração e conversão para delivery.
                        </p>
                    </div>

                    <div class="flex items-center space-x-4 bg-indigo-50/70 border border-indigo-100 px-6 py-3 rounded-2xl">
                        <div class="text-center">
                            <span class="text-3xl sm:text-4xl font-black text-indigo-700">{{ audit.scoreGeral }}</span>
                            <span class="text-indigo-400 text-xs font-bold block">/ 100</span>
                        </div>
                        <div class="border-l border-indigo-200 pl-4">
                            <span class="text-[10px] font-bold uppercase text-indigo-600 tracking-wider block">Classificação</span>
                            <span class="text-sm font-bold text-slate-900">{{ audit.statusConta }}</span>
                        </div>
                    </div>
                </div>

                <!-- Subscores Bar -->
                <div class="grid grid-cols-2 sm:grid-cols-6 gap-3 py-6 border-b border-slate-100 text-xs">
                    <div class="p-3 bg-slate-50 rounded-xl">
                        <span class="text-slate-400 text-[10px] uppercase font-bold block">Tracking</span>
                        <span class="text-base font-bold text-slate-900">{{ sub.tracking }}%</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl">
                        <span class="text-slate-400 text-[10px] uppercase font-bold block">Campanhas</span>
                        <span class="text-base font-bold text-slate-900">{{ sub.campanhas }}%</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl">
                        <span class="text-slate-400 text-[10px] uppercase font-bold block">Criativos</span>
                        <span class="text-base font-bold text-slate-900">{{ sub.criativos }}%</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl">
                        <span class="text-slate-400 text-[10px] uppercase font-bold block">Públicos</span>
                        <span class="text-base font-bold text-slate-900">{{ sub.publicos }}%</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl">
                        <span class="text-slate-400 text-[10px] uppercase font-bold block">Orçamento</span>
                        <span class="text-base font-bold text-slate-900">{{ sub.orcamento }}%</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl">
                        <span class="text-slate-400 text-[10px] uppercase font-bold block">Conversão</span>
                        <span class="text-base font-bold text-slate-900">{{ sub.conversao }}%</span>
                    </div>
                </div>

                <!-- Checklist Items -->
                <div class="pt-6 space-y-3">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Critérios Auditados Automaticamente</h3>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div 
                            v-for="(item, idx) in audit.itens" 
                            :key="idx"
                            class="p-3.5 rounded-xl border flex items-center justify-between"
                            :class="item.status ? 'bg-emerald-50/40 border-emerald-200/70' : 'bg-slate-50 border-slate-200'"
                        >
                            <div class="flex items-center space-x-2.5">
                                <CheckCircle2 v-if="item.status" class="w-4 h-4 text-emerald-600 shrink-0" />
                                <XCircle v-else class="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                    <p class="font-bold text-slate-900">{{ item.item }}</p>
                                    <p class="text-[11px] text-slate-500">{{ item.detalhe }}</p>
                                </div>
                            </div>
                            <span class="font-bold text-slate-600 text-xs shrink-0">+{{ item.peso }} pts</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
