<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { Link } from '@inertiajs/vue3';
import { 
    DollarSign, 
    ShoppingBag, 
    TrendingUp, 
    Target, 
    Sparkles, 
    AlertCircle, 
    ArrowUpRight, 
    ShieldCheck, 
    Clock,
    Flame
} from 'lucide-vue-next';

defineProps({
    empresa: Object,
    kpis: Object,
    chart_data: Array,
    campanhas: Array,
    recomendacoes: Array,
    aprovacoes_pendentes: Number,
    alertas: Array,
    top_criativos: Array,
});

const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};
</script>

<template>
    <AppLayout>
        <template #header>Dashboard de Performance & ROAS Real</template>

        <div class="max-w-7xl mx-auto space-y-8">
            <!-- Header Title & Mode Banner -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h2 class="text-xl font-bold text-slate-900 tracking-tight">
                        {{ empresa.nome }}
                    </h2>
                    <p class="text-sm text-slate-500 mt-1">
                        Operação em modo <span class="font-semibold text-indigo-600">{{ empresa.modo_operacao || 'ASSISTIDO' }}</span> · Teto diário configurado: <span class="font-medium text-slate-700">{{ formatMoney(empresa.orcamento_max_diario) }}</span>
                    </p>
                </div>

                <div class="flex items-center gap-3">
                    <Link 
                        href="/automation" 
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                    >
                        <Sparkles class="w-3.5 h-3.5" />
                        <span>{{ aprovacoes_pendentes }} Decisões Pendentes</span>
                    </Link>
                    <Link 
                        href="/campaigns" 
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
                    >
                        <span>Gerenciar Campanhas</span>
                        <ArrowUpRight class="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            <!-- 4 Primary KPI Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <!-- Investimento -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div class="flex items-center justify-between text-slate-500 mb-3">
                        <span class="text-xs font-semibold uppercase tracking-wider">Investimento Total</span>
                        <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <DollarSign class="w-4 h-4" />
                        </div>
                    </div>
                    <div class="text-2xl font-bold text-slate-900">{{ formatMoney(kpis.investimento) }}</div>
                    <div class="text-xs text-slate-500 mt-1">Últimos 7 dias de veiculação</div>
                </div>

                <!-- Pedidos Reais vs Meta -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div class="flex items-center justify-between text-slate-500 mb-3">
                        <span class="text-xs font-semibold uppercase tracking-wider">Pedidos Reais</span>
                        <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                            <ShoppingBag class="w-4 h-4" />
                        </div>
                    </div>
                    <div class="text-2xl font-bold text-slate-900">{{ kpis.pedidos_reais }} <span class="text-xs font-normal text-slate-500">pedidos</span></div>
                    <div class="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                        <span>Meta reportou {{ kpis.vendas_meta }} conv. (+{{ Math.round(((kpis.pedidos_reais - kpis.vendas_meta)/kpis.vendas_meta)*100) }}% reconciliado)</span>
                    </div>
                </div>

                <!-- ROAS Real vs ROAS Meta -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div class="flex items-center justify-between text-slate-500 mb-3">
                        <span class="text-xs font-semibold uppercase tracking-wider">ROAS Real (Prefiro)</span>
                        <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                            <TrendingUp class="w-4 h-4" />
                        </div>
                    </div>
                    <div class="text-2xl font-bold text-indigo-600">{{ kpis.roas_real }}x</div>
                    <div class="text-xs text-slate-500 mt-1">ROAS Meta estimado: {{ kpis.roas_meta }}x</div>
                </div>

                <!-- CPA Real -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div class="flex items-center justify-between text-slate-500 mb-3">
                        <span class="text-xs font-semibold uppercase tracking-wider">CPA Real por Pedido</span>
                        <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                            <Target class="w-4 h-4" />
                        </div>
                    </div>
                    <div class="text-2xl font-bold text-slate-900">{{ formatMoney(kpis.cpa_real) }}</div>
                    <div class="text-xs text-slate-500 mt-1">Ticket Médio: {{ formatMoney(empresa.ticket_medio) }}</div>
                </div>
            </div>

            <!-- Two Column Layout: Recommendations & Historical Table -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- AI Recommendations Column -->
                <div class="lg:col-span-1 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles class="w-4 h-4 text-indigo-600" />
                            <span>Recomendações da IA</span>
                        </h3>
                        <Link href="/automation" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                            Ver todas
                        </Link>
                    </div>

                    <div class="space-y-3">
                        <div 
                            v-for="rec in recomendacoes" 
                            :key="rec.id"
                            class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors"
                        >
                            <div class="flex items-start justify-between gap-2">
                                <span 
                                    :class="[
                                        rec.tipo === 'OPORTUNIDADE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                                        'px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border'
                                    ]"
                                >
                                    {{ rec.tipo }}
                                </span>
                                <span class="text-[10px] text-slate-400 font-medium">Confiança: {{ Math.round(rec.nivel_confianca * 100) }}%</span>
                            </div>

                            <h4 class="text-xs font-bold text-slate-800 mt-2 line-clamp-2">{{ rec.titulo }}</h4>
                            <p class="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">{{ rec.analise }}</p>

                            <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span class="text-slate-500 font-medium">Impacto: {{ rec.impacto_prev || '+ Vendas' }}</span>
                                <Link 
                                    href="/automation" 
                                    class="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                                >
                                    <span>Avaliar</span>
                                    <ArrowUpRight class="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Historical Reconciliation Table -->
                <div class="lg:col-span-2 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck class="w-4 h-4 text-emerald-600" />
                            <span>Histórico de Reconciliação (Últimos 7 Dias)</span>
                        </h3>
                        <Link href="/reconciliation" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                            Abrir Auditoria Completa
                        </Link>
                    </div>

                    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th class="p-3.5 pl-5">Data</th>
                                        <th class="p-3.5">Investimento</th>
                                        <th class="p-3.5">Pedidos Reais</th>
                                        <th class="p-3.5">Receita Real</th>
                                        <th class="p-3.5">ROAS Real</th>
                                        <th class="p-3.5 pr-5">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                                    <tr v-for="item in chart_data" :key="item.data" class="hover:bg-slate-50/60 transition-colors">
                                        <td class="p-3.5 pl-5 font-semibold text-slate-900">{{ item.data }}</td>
                                        <td class="p-3.5">{{ formatMoney(item.investimento) }}</td>
                                        <td class="p-3.5 font-bold text-emerald-600">{{ item.pedidos_reais }}</td>
                                        <td class="p-3.5 font-semibold">{{ formatMoney(item.receita_real) }}</td>
                                        <td class="p-3.5">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                                                {{ item.roas_real }}x
                                            </span>
                                        </td>
                                        <td class="p-3.5 pr-5">
                                            <span class="text-emerald-700 font-medium flex items-center gap-1">
                                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Auditado
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Top Creatives Overview -->
                    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Saúde dos Criativos</h4>
                        <div class="space-y-3">
                            <div 
                                v-for="crt in top_criativos" 
                                :key="crt.id"
                                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                            >
                                <div class="flex items-center gap-3">
                                    <div 
                                        :class="[
                                            crt.status_fadiga === 'FADIGADO' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700',
                                            'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs'
                                        ]"
                                    >
                                        <Flame v-if="crt.status_fadiga === 'FADIGADO'" class="w-4 h-4" />
                                        <ShieldCheck v-else class="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-800">{{ crt.nome }}</p>
                                        <p class="text-[11px] text-slate-500">Freq: {{ crt.frequencia }} · CTR: {{ crt.ctr }}% · ROAS: {{ crt.roas }}x</p>
                                    </div>
                                </div>
                                <span 
                                    :class="[
                                        crt.status_fadiga === 'FADIGADO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                        'px-2.5 py-1 text-[11px] font-bold rounded-md border'
                                    ]"
                                >
                                    {{ crt.status_fadiga }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
