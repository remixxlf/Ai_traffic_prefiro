<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Flame, 
    CheckCircle2, 
    Pause, 
    RefreshCw, 
    Sparkles, 
    ExternalLink 
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    criativos: Array,
});

const criativosList = ref([...props.criativos]);
const loadingId = ref(null);

const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const evaluateCreative = async (criativo) => {
    loadingId.value = criativo.id;
    try {
        const res = await fetch(`/api/creative-fatigue/${criativo.id}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                frequency: criativo.frequencia,
                current_ctr: criativo.ctr,
                baseline_ctr: 3.5, // baseline média restaurante
            }),
        });
        const data = await res.json();
        if (res.ok) {
            criativo.status_fadiga = data.result.status;
        }
    } catch (e) {
        console.error(e);
    } finally {
        loadingId.value = null;
    }
};

const pauseAd = async (criativo) => {
    if (!criativo.anuncios || !criativo.anuncios.length) return;
    const adId = criativo.anuncios[0].id;
    loadingId.value = criativo.id;
    try {
        const res = await fetch(`/api/creative-fatigue/ads/${adId}/pause`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (res.ok) {
            criativo.anuncios[0].status = 'PAUSED';
        }
    } catch (e) {
        console.error(e);
    } finally {
        loadingId.value = null;
    }
};
</script>

<template>
    <AppLayout>
        <template #header>Detecção de Fadiga Criativa & Saúde dos Anúncios</template>

        <div class="max-w-7xl mx-auto space-y-6">

            <!-- Creatives Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                    v-for="c in criativosList" 
                    :key="c.id"
                    class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 hover:border-indigo-200 transition-colors"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span 
                                    :class="[
                                        c.status_fadiga === 'FADIGADO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                        'px-2.5 py-0.5 rounded-full text-[11px] font-bold border'
                                    ]"
                                >
                                    {{ c.status_fadiga }}
                                </span>
                                <span class="text-xs font-mono text-slate-400">{{ c.formato }}</span>
                            </div>
                            <h4 class="text-sm font-bold text-slate-900 mt-2">{{ c.nome }}</h4>
                        </div>

                        <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                            <img :src="c.url_midia" class="w-full h-full object-cover" />
                        </div>
                    </div>

                    <!-- Metrics Grid -->
                    <div class="grid grid-cols-4 gap-2 py-3 px-3.5 bg-slate-50 rounded-xl text-center text-xs">
                        <div>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase">Frequência</span>
                            <div :class="[c.frequencia > 3.5 ? 'text-rose-600 font-black' : 'text-slate-800 font-bold']">
                                {{ c.frequencia }}
                            </div>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase">CTR</span>
                            <div class="text-slate-800 font-bold">{{ c.ctr }}%</div>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase">CPA</span>
                            <div class="text-slate-800 font-bold">{{ formatMoney(c.cpa) }}</div>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase">ROAS</span>
                            <div class="text-indigo-600 font-bold">{{ c.roas }}x</div>
                        </div>
                    </div>

                    <!-- Text Details -->
                    <p class="text-xs text-slate-600 line-clamp-2 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        "{{ c.texto_principal || c.titulo }}"
                    </p>

                    <!-- Actions -->
                    <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <button 
                            @click="evaluateCreative(c)"
                            :disabled="loadingId === c.id"
                            class="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                        >
                            <RefreshCw :class="[loadingId === c.id ? 'animate-spin' : '', 'w-3.5 h-3.5']" />
                            <span>Reavaliar Métricas</span>
                        </button>

                        <button 
                            v-if="c.status_fadiga === 'FADIGADO'"
                            @click="pauseAd(c)"
                            :disabled="loadingId === c.id"
                            class="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm shadow-rose-200 flex items-center gap-1"
                        >
                            <Pause class="w-3.5 h-3.5" />
                            <span>Pausar Imediatamente</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
