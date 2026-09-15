<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    Sparkles, 
    Copy, 
    Check, 
    UtensilsCrossed, 
    Flame, 
    ShieldCheck, 
    Clock, 
    Zap 
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
});

const produtoNome = ref(props.empresa?.produto_mais_vendido || 'Smash Burger Especial');
const preco = ref('38,00');
const precoPromocional = ref('29,90');
const ganchoEspecial = ref('');
const isLoading = ref(false);
const result = ref(null);
const copiedField = ref(null);

const handleGenerate = async () => {
    isLoading.value = true;
    try {
        const res = await fetch('/api/copywriting/gerar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                empresaId: props.empresa?.id,
                produtoNome: produtoNome.value,
                preco: preco.value,
                precoPromocional: precoPromocional.value,
                ganchoEspecial: ganchoEspecial.value,
            })
        });
        const json = await res.json();
        if (json.success) {
            result.value = json.resultado;
        }
    } catch (e) {
        console.error('Erro ao gerar copys:', e);
    } finally {
        isLoading.value = false;
    }
};

const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    copiedField.value = key;
    setTimeout(() => {
        copiedField.value = null;
    }, 2000);
};
</script>

<template>
    <AppLayout title="Copywriting com IA" :module-icon="Sparkles">
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Header Card -->
            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <div class="flex items-center space-x-3 mb-2">
                    <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                        <Sparkles class="w-5 h-5" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Gerador de Copywriting com IA</h1>
                        <p class="text-slate-500 text-sm">
                            Crie textos de anúncios de alta conversão para o Meta Ads com 3 abordagens estratégicas comprovadas no delivery.
                        </p>
                    </div>
                </div>

                <!-- Input form -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Produto em Destaque</label>
                        <input 
                            v-model="produtoNome"
                            type="text"
                            placeholder="Ex: Burger Artesanal Duplo"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Gancho ou Diferencial Especial</label>
                        <input 
                            v-model="ganchoEspecial"
                            type="text"
                            placeholder="Ex: Queijo cheddar derretido na hora e pão brioche"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Preço Normal (R$)</label>
                        <input 
                            v-model="preco"
                            type="text"
                            placeholder="38,00"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Preço Promocional (Opcional)</label>
                        <input 
                            v-model="precoPromocional"
                            type="text"
                            placeholder="29,90"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button 
                        @click="handleGenerate"
                        :disabled="isLoading"
                        class="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm shadow-indigo-200"
                    >
                        <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
                        <span>{{ isLoading ? 'Gerando 3 Variações com IA...' : 'Gerar 3 Textos Estratégicos' }}</span>
                    </button>
                </div>
            </div>

            <!-- Results Section (3 Variations) -->
            <div v-if="result" class="space-y-6">
                <h2 class="text-lg font-bold text-slate-900">3 Abordagens Estratégicas para {{ result.produto }}</h2>

                <div class="grid grid-cols-1 gap-6">
                    <!-- Variation 1: Sensorial -->
                    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div class="flex items-center space-x-2">
                                <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">Variação 1: Sensorial & Experiência</span>
                            </div>
                            <span class="text-xs text-slate-400 font-medium">Ideal para fotos de dar água na boca</span>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[11px] font-bold text-slate-500 uppercase">Título (Headline)</span>
                                <button 
                                    @click="copyToClipboard(result.variacoes.focoProduto.titulo, 'v1-titulo')"
                                    class="text-slate-400 hover:text-slate-700 text-xs flex items-center space-x-1"
                                >
                                    <Check v-if="copiedField === 'v1-titulo'" class="w-3.5 h-3.5 text-emerald-600" />
                                    <Copy v-else class="w-3.5 h-3.5" />
                                    <span>{{ copiedField === 'v1-titulo' ? 'Copiado' : 'Copiar' }}</span>
                                </button>
                            </div>
                            <p class="font-bold text-slate-900 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">{{ result.variacoes.focoProduto.titulo }}</p>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[11px] font-bold text-slate-500 uppercase">Texto Principal</span>
                                <button 
                                    @click="copyToClipboard(result.variacoes.focoProduto.textoPrincipal, 'v1-texto')"
                                    class="text-slate-400 hover:text-slate-700 text-xs flex items-center space-x-1"
                                >
                                    <Check v-if="copiedField === 'v1-texto'" class="w-3.5 h-3.5 text-emerald-600" />
                                    <Copy v-else class="w-3.5 h-3.5" />
                                    <span>{{ copiedField === 'v1-texto' ? 'Copiado' : 'Copiar' }}</span>
                                </button>
                            </div>
                            <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{{ result.variacoes.focoProduto.textoPrincipal }}</p>
                        </div>

                        <div class="p-3 bg-indigo-50/50 rounded-xl text-[11px] text-indigo-900 flex items-center space-x-2">
                            <Zap class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span><strong>Por que converte:</strong> {{ result.variacoes.focoProduto.porQueFunciona }}</span>
                        </div>
                    </div>

                    <!-- Variation 2: Benefício / Comodidade -->
                    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div class="flex items-center space-x-2">
                                <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                                <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Variação 2: Comodidade & Benefício</span>
                            </div>
                            <span class="text-xs text-slate-400 font-medium">Conecta com a praticidade de comer bem em casa</span>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[11px] font-bold text-slate-500 uppercase">Título (Headline)</span>
                                <button 
                                    @click="copyToClipboard(result.variacoes.focoBeneficio.titulo, 'v2-titulo')"
                                    class="text-slate-400 hover:text-slate-700 text-xs flex items-center space-x-1"
                                >
                                    <Check v-if="copiedField === 'v2-titulo'" class="w-3.5 h-3.5 text-emerald-600" />
                                    <Copy v-else class="w-3.5 h-3.5" />
                                    <span>{{ copiedField === 'v2-titulo' ? 'Copiado' : 'Copiar' }}</span>
                                </button>
                            </div>
                            <p class="font-bold text-slate-900 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">{{ result.variacoes.focoBeneficio.titulo }}</p>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[11px] font-bold text-slate-500 uppercase">Texto Principal</span>
                                <button 
                                    @click="copyToClipboard(result.variacoes.focoBeneficio.textoPrincipal, 'v2-texto')"
                                    class="text-slate-400 hover:text-slate-700 text-xs flex items-center space-x-1"
                                >
                                    <Check v-if="copiedField === 'v2-texto'" class="w-3.5 h-3.5 text-emerald-600" />
                                    <Copy v-else class="w-3.5 h-3.5" />
                                    <span>{{ copiedField === 'v2-texto' ? 'Copiado' : 'Copiar' }}</span>
                                </button>
                            </div>
                            <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{{ result.variacoes.focoBeneficio.textoPrincipal }}</p>
                        </div>

                        <div class="p-3 bg-emerald-50/50 rounded-xl text-[11px] text-emerald-900 flex items-center space-x-2">
                            <Zap class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span><strong>Por que converte:</strong> {{ result.variacoes.focoBeneficio.porQueFunciona }}</span>
                        </div>
                    </div>

                    <!-- Variation 3: Urgência -->
                    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div class="flex items-center space-x-2">
                                <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                                <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">Variação 3: Urgência & Fome Imediata</span>
                            </div>
                            <span class="text-xs text-slate-400 font-medium">Acelera a decisão de compra para o jantar</span>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[11px] font-bold text-slate-500 uppercase">Título (Headline)</span>
                                <button 
                                    @click="copyToClipboard(result.variacoes.focoUrgencia.titulo, 'v3-titulo')"
                                    class="text-slate-400 hover:text-slate-700 text-xs flex items-center space-x-1"
                                >
                                    <Check v-if="copiedField === 'v3-titulo'" class="w-3.5 h-3.5 text-emerald-600" />
                                    <Copy v-else class="w-3.5 h-3.5" />
                                    <span>{{ copiedField === 'v3-titulo' ? 'Copiado' : 'Copiar' }}</span>
                                </button>
                            </div>
                            <p class="font-bold text-slate-900 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">{{ result.variacoes.focoUrgencia.titulo }}</p>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[11px] font-bold text-slate-500 uppercase">Texto Principal</span>
                                <button 
                                    @click="copyToClipboard(result.variacoes.focoUrgencia.textoPrincipal, 'v3-texto')"
                                    class="text-slate-400 hover:text-slate-700 text-xs flex items-center space-x-1"
                                >
                                    <Check v-if="copiedField === 'v3-texto'" class="w-3.5 h-3.5 text-emerald-600" />
                                    <Copy v-else class="w-3.5 h-3.5" />
                                    <span>{{ copiedField === 'v3-texto' ? 'Copiado' : 'Copiar' }}</span>
                                </button>
                            </div>
                            <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{{ result.variacoes.focoUrgencia.textoPrincipal }}</p>
                        </div>

                        <div class="p-3 bg-amber-50/50 rounded-xl text-[11px] text-amber-900 flex items-center space-x-2">
                            <Zap class="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span><strong>Por que converte:</strong> {{ result.variacoes.focoUrgencia.porQueFunciona }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
