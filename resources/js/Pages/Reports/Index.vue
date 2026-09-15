<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    FileText, 
    Calendar, 
    TrendingUp, 
    Sparkles, 
    CheckCircle2, 
    DollarSign,
    ShoppingBag
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    diario: Object,
    semanal: Object,
});

const tab = ref('DIARIO');

const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};
</script>

<template>
    <AppLayout title="Relatórios Automáticos" :module-icon="FileText">
        <div class="max-w-5xl mx-auto space-y-6">
            <!-- Tabs -->
            <div class="flex items-center space-x-3">
                <button 
                    @click="tab = 'DIARIO'"
                    :class="[
                        'px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center space-x-2',
                        tab === 'DIARIO' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    ]"
                >
                    <Calendar class="w-4 h-4" />
                    <span>Resumo de Ontem (Diário)</span>
                </button>
                <button 
                    @click="tab = 'SEMANAL'"
                    :class="[
                        'px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center space-x-2',
                        tab === 'SEMANAL' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    ]"
                >
                    <TrendingUp class="w-4 h-4" />
                    <span>Relatório Semanal Consolidado</span>
                </button>
            </div>

            <!-- Relatório Diário (PRD Seção 50) -->
            <div v-if="tab === 'DIARIO'" class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Fechamento de Desempenho Diário</h2>
                    <p class="text-xs text-slate-500 mt-1">
                        Resultados apurados cruzando dados do Meta Ads com faturamento real da Prefiro Delivery.
                    </p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span class="text-[11px] text-slate-400 font-bold uppercase block">Investido</span>
                        <p class="text-lg font-bold text-slate-900 mt-1">{{ formatMoney(diario?.investido) }}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span class="text-[11px] text-emerald-600 font-bold uppercase block">Receita Real</span>
                        <p class="text-lg font-bold text-emerald-700 mt-1">{{ formatMoney(diario?.receita) }}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span class="text-[11px] text-slate-400 font-bold uppercase block">Pedidos Delivery</span>
                        <p class="text-lg font-bold text-slate-900 mt-1">{{ diario?.pedidos }}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span class="text-[11px] text-indigo-600 font-bold uppercase block">ROAS Real</span>
                        <p class="text-lg font-bold text-indigo-700 mt-1">{{ diario?.roas }}x</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                        <span class="text-[11px] text-slate-400 font-bold uppercase block">Custo / Pedido</span>
                        <p class="text-lg font-bold text-slate-900 mt-1">{{ formatMoney(diario?.custoPorPedido) }}</p>
                    </div>
                </div>

                <div class="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/80 space-y-2 text-xs">
                    <div class="flex items-center space-x-2 text-indigo-950 font-bold">
                        <Sparkles class="w-4 h-4 text-indigo-600" />
                        <span>Síntese da IA sobre o Fechamento de Ontem</span>
                    </div>
                    <p class="text-indigo-900/80 leading-relaxed">{{ diario?.destaque }}</p>
                    <ul class="list-disc list-inside space-y-1 pt-2 text-indigo-900/70">
                        <li v-for="(al, idx) in diario?.alertas" :key="idx">{{ al }}</li>
                    </ul>
                </div>
            </div>

            <!-- Relatório Semanal Consolidado -->
            <div v-if="tab === 'SEMANAL'" class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Consolidado Semanal de Vendas & Tráfego</h2>
                    <p class="text-xs text-slate-500 mt-1">
                        Análise de tendências, evolução de faturamento e escala de investimento.
                    </p>
                </div>

                <!-- Growth Badges -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                        <span class="text-[11px] font-bold text-emerald-800 uppercase">Receita Semanal</span>
                        <p class="text-2xl font-bold text-emerald-950 mt-1">{{ formatMoney(semanal?.receita) }}</p>
                        <span class="text-xs font-semibold text-emerald-700 mt-1 block">↑ +{{ semanal?.comparativoSemanaAnterior?.receitaCrescimento }}% vs semana anterior</span>
                    </div>
                    <div class="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                        <span class="text-[11px] font-bold text-indigo-800 uppercase">ROAS Médio</span>
                        <p class="text-2xl font-bold text-indigo-950 mt-1">{{ semanal?.roas }}x</p>
                        <span class="text-xs font-semibold text-indigo-700 mt-1 block">↑ +{{ semanal?.comparativoSemanaAnterior?.roasCrescimento }}% de eficiência</span>
                    </div>
                    <div class="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                        <span class="text-[11px] font-bold text-purple-800 uppercase">Total de Pedidos</span>
                        <p class="text-2xl font-bold text-purple-950 mt-1">{{ semanal?.pedidos }} pedidos</p>
                        <span class="text-xs font-semibold text-purple-700 mt-1 block">↑ +{{ semanal?.comparativoSemanaAnterior?.pedidosCrescimento }}% novos clientes</span>
                    </div>
                </div>

                <!-- Top Campaigns Table -->
                <div class="border border-slate-100 rounded-2xl overflow-hidden">
                    <div class="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700">
                        Desempenho por Campanha nesta Semana
                    </div>
                    <div class="divide-y divide-slate-100 text-xs">
                        <div 
                            v-for="(cmp, idx) in semanal?.topCampanhas" 
                            :key="idx"
                            class="p-4 flex items-center justify-between"
                        >
                            <span class="font-bold text-slate-900">{{ cmp.nome }}</span>
                            <div class="flex items-center space-x-6 text-slate-600">
                                <span>Investido: <strong>{{ formatMoney(cmp.investido) }}</strong></span>
                                <span>Retorno: <strong class="text-emerald-700">{{ formatMoney(cmp.receita) }}</strong></span>
                                <span class="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                                    {{ cmp.roas }}x ROAS
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Conclusion -->
                <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                    <p class="font-bold text-slate-900">Recomendação Estratégica do Gestor IA</p>
                    <p class="leading-relaxed">{{ semanal?.conclusaoIa }}</p>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
