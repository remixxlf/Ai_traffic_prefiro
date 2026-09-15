<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Layers, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    PlusCircle, 
    TrendingUp,
    UtensilsCrossed,
    Tag,
    DollarSign
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    produtos: Array,
    resumo: Object,
});

const isSyncing = ref(false);
const feedback = ref('');
const modalType = ref(null); // 'PRODUTO' | 'CATEGORIA' | 'CARDAPIO'
const selectedProduto = ref(null);
const selectedCategoria = ref('');
const orcamentoDiario = ref(50);
const isLaunching = ref(false);

const openProductModal = (produto) => {
    selectedProduto.value = produto;
    modalType.value = 'PRODUTO';
};

const openCategoryModal = (cat) => {
    selectedCategoria.value = cat;
    modalType.value = 'CATEGORIA';
};

const openCardapioModal = () => {
    modalType.value = 'CARDAPIO';
};

const closeModal = () => {
    modalType.value = null;
    selectedProduto.value = null;
};

const handleSync = async () => {
    isSyncing.value = true;
    feedback.value = '';
    try {
        const res = await fetch(`/api/catalogo?empresaId=${props.empresa?.id}`, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
            feedback.value = 'Cardápio sincronizado com sucesso no catálogo Meta!';
        }
    } catch (e) {
        feedback.value = 'Erro ao sincronizar catálogo.';
    } finally {
        isSyncing.value = false;
    }
};

const handleLaunchCampaign = async () => {
    isLaunching.value = true;
    feedback.value = '';
    try {
        let endpoint = '/api/catalogo/anunciar/cardapio';
        let body = { empresaId: props.empresa?.id, orcamentoDiario: orcamentoDiario.value };

        if (modalType.value === 'PRODUTO' && selectedProduto.value) {
            endpoint = '/api/catalogo/anunciar/produto';
            body.produtoId = selectedProduto.value.id;
        } else if (modalType.value === 'CATEGORIA') {
            endpoint = '/api/catalogo/anunciar/categoria';
            body.categoria = selectedCategoria.value;
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        if (json.success) {
            feedback.value = `🚀 Anúncio publicado com sucesso! (ID Meta: ${json.resultado.metaCampaignId})`;
            closeModal();
        }
    } catch (e) {
        feedback.value = 'Erro ao criar anúncio de prato.';
    } finally {
        isLaunching.value = false;
    }
};

const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};
</script>

<template>
    <AppLayout title="Catálogo & Campanhas de Pratos" :module-icon="Layers">
        <div class="max-w-6xl mx-auto space-y-6">
            <!-- Header Card -->
            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center space-x-3 mb-1">
                        <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <UtensilsCrossed class="w-5 h-5" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Catálogo & Campanhas de Pratos</h1>
                            <p class="text-slate-500 text-sm">
                                Sincronização automática do cardápio Prefiro Delivery com o catálogo de produtos da Meta.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex items-center space-x-2">
                    <button 
                        @click="handleSync"
                        :disabled="isSyncing"
                        class="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
                    >
                        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSyncing }" />
                        <span>Sincronizar XML</span>
                    </button>
                    <button 
                        @click="openCardapioModal"
                        class="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-200"
                    >
                        <Sparkles class="w-3.5 h-3.5" />
                        <span>Anunciar Cardápio Inteiro</span>
                    </button>
                </div>
            </div>

            <!-- Feedback Alert -->
            <div v-if="feedback" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{{ feedback }}</span>
            </div>

            <!-- Resumo Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span class="text-xs font-semibold text-slate-500 uppercase">Total de Itens</span>
                    <p class="text-2xl font-bold text-slate-900 mt-1">{{ resumo?.total || produtos?.length || 0 }}</p>
                    <span class="text-[11px] text-slate-400 font-medium">Cadastrados no cardápio</span>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span class="text-xs font-semibold text-emerald-600 uppercase">Disponíveis</span>
                    <p class="text-2xl font-bold text-emerald-700 mt-1">{{ resumo?.ativos || produtos?.length || 0 }}</p>
                    <span class="text-[11px] text-emerald-600 font-medium">Aptos para anúncio</span>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span class="text-xs font-semibold text-slate-500 uppercase">Pausados / Esgotados</span>
                    <p class="text-2xl font-bold text-slate-900 mt-1">{{ resumo?.inativos || 0 }}</p>
                    <span class="text-[11px] text-slate-400 font-medium">Pausa automática ativada</span>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span class="text-xs font-semibold text-indigo-600 uppercase">Status XML</span>
                    <p class="text-base font-bold text-indigo-700 mt-2">100% Válido</p>
                    <span class="text-[11px] text-indigo-600 font-medium">Meta Commerce Manager</span>
                </div>
            </div>

            <!-- Products List Table -->
            <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="font-bold text-slate-900 text-sm">Pratos e Itens do Cardápio</h3>
                    <span class="text-xs text-slate-400 font-medium">Clique em "Anunciar Prato" para criar anúncio com 1 clique</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                                <th class="py-3.5 px-4">Prato / Item</th>
                                <th class="py-3.5 px-4">Categoria</th>
                                <th class="py-3.5 px-4">Preço Normal</th>
                                <th class="py-3.5 px-4">Promoção</th>
                                <th class="py-3.5 px-4">Disponibilidade</th>
                                <th class="py-3.5 px-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="produto in produtos" :key="produto.id" class="hover:bg-slate-50/70 transition">
                                <td class="py-3.5 px-4 font-semibold text-slate-900">
                                    <div class="flex items-center space-x-2.5">
                                        <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                                            🍔
                                        </div>
                                        <div>
                                            <p class="font-semibold text-slate-900">{{ produto.nome }}</p>
                                            <p class="text-[11px] text-slate-400 font-normal truncate max-w-xs">{{ produto.descricao || 'Item do cardápio delivery' }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3.5 px-4">
                                    <button 
                                        @click="openCategoryModal(produto.categoria || 'Geral')"
                                        class="inline-block px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium transition cursor-pointer"
                                    >
                                        {{ produto.categoria || 'Principal' }}
                                    </button>
                                </td>
                                <td class="py-3.5 px-4 font-semibold text-slate-800">
                                    {{ formatMoney(produto.preco) }}
                                </td>
                                <td class="py-3.5 px-4">
                                    <span v-if="produto.preco_promocional" class="font-bold text-emerald-600">
                                        {{ formatMoney(produto.preco_promocional) }}
                                    </span>
                                    <span v-else class="text-slate-400">—</span>
                                </td>
                                <td class="py-3.5 px-4">
                                    <span class="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span>Em Estoque</span>
                                    </span>
                                </td>
                                <td class="py-3.5 px-4 text-right">
                                    <button 
                                        @click="openProductModal(produto)"
                                        class="inline-flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 transition"
                                    >
                                        <Sparkles class="w-3 h-3" />
                                        <span>Anunciar Prato</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Quick Ad Modal -->
            <div v-if="modalType" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 class="font-bold text-base text-slate-900">
                            {{ modalType === 'PRODUTO' ? `Anunciar ${selectedProduto?.nome}` : modalType === 'CATEGORIA' ? `Anunciar Categoria ${selectedCategoria}` : 'Anunciar Todo o Cardápio' }}
                        </h3>
                        <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
                    </div>

                    <p class="text-xs text-slate-500 leading-relaxed">
                        A IA irá gerar criativo otimizado com foto do produto, texto de alta conversão e direcionamento para o cardápio no raio de atendimento de {{ empresa?.raio_atendimento || 8 }}km.
                    </p>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Orçamento Diário (R$)</label>
                        <input 
                            v-model.number="orcamentoDiario"
                            type="number" 
                            min="20"
                            max="500"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                        />
                        <span class="text-[11px] text-slate-400 mt-1 block">Protegido pelo Policy Engine (Máximo de +20% de escala por dia).</span>
                    </div>

                    <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                        <button 
                            @click="closeModal"
                            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            @click="handleLaunchCampaign"
                            :disabled="isLaunching"
                            class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm flex items-center space-x-1.5"
                        >
                            <span v-if="isLaunching" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Confirmar e Publicar Anúncio</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
