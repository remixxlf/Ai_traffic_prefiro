<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Bell, 
    AlertTriangle, 
    CheckCircle2, 
    Info, 
    AlertOctagon,
    Check
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    alertas: Array,
});

const alertasLocal = ref([...(props.alertas || [])]);

const handleMarkAsRead = async (alertaId) => {
    try {
        const res = await fetch('/api/alertas', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alertaId })
        });
        const json = await res.json();
        if (json.success) {
            const item = alertasLocal.value.find(a => a.id === alertaId);
            if (item) item.lido = true;
        }
    } catch (e) {
        console.error(e);
    }
};
</script>

<template>
    <AppLayout title="Central de Alertas & Notificações" :module-icon="Bell">
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Header Card -->
            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <div class="flex items-center space-x-3 mb-1">
                    <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                        <Bell class="w-5 h-5" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Central de Alertas & Notificações</h1>
                        <p class="text-slate-500 text-sm">
                            Monitoramento contínuo de oscilações de CPA, rejeições de anúncios na Meta e anomalias de faturamento.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Empty State if no alerts -->
            <div v-if="alertasLocal.length === 0" class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
                <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-100">
                    ✓
                </div>
                <div>
                    <h3 class="text-lg font-bold text-slate-900 mb-1">Nenhum incidente ativo</h3>
                    <p class="text-slate-500 text-xs max-w-md mx-auto">
                        Sua conta de anúncios, catálogo de pratos e integrações de rastreamento estão operando em perfeita conformidade.
                    </p>
                </div>
            </div>

            <!-- Alerts List -->
            <div v-else class="space-y-3">
                <div 
                    v-for="al in alertasLocal"
                    :key="al.id"
                    class="p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    :class="[
                        al.lido ? 'bg-slate-50/70 border-slate-200/60 opacity-60' :
                        al.nivel === 'CRITICO' ? 'bg-rose-50/40 border-rose-200' :
                        al.nivel === 'ALERTA' ? 'bg-amber-50/40 border-amber-200' :
                        'bg-white border-slate-200/80'
                    ]"
                >
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                            <span :class="[
                                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                al.nivel === 'CRITICO' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                                al.nivel === 'ALERTA' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                            ]">
                                {{ al.nivel }}
                            </span>
                            <span class="font-bold text-slate-900 text-sm">{{ al.titulo }}</span>
                        </div>
                        <p class="text-xs text-slate-600 leading-relaxed">{{ al.mensagem }}</p>
                    </div>

                    <div class="flex items-center space-x-3 shrink-0">
                        <button 
                            v-if="!al.lido"
                            @click="handleMarkAsRead(al.id)"
                            class="inline-flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-xs"
                        >
                            <Check class="w-3.5 h-3.5 text-emerald-600" />
                            <span>Marcar como Lido</span>
                        </button>
                        <span v-else class="text-[11px] text-slate-400 font-semibold flex items-center space-x-1">
                            <CheckCircle2 class="w-3.5 h-3.5 text-slate-400" />
                            <span>Lido</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
