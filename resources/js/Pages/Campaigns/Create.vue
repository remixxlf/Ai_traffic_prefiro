<script setup>
import { ref, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    TrendingUp, 
    Sparkles, 
    MapPin, 
    DollarSign, 
    Image as ImageIcon, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft,
    ShieldCheck
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
});

const step = ref(1);
const isAnalyzing = ref(false);
const isSubmitting = ref(false);
const feedback = ref('');
const errorMessage = ref('');

// Step 1: Intenção & Produto
const promptTexto = ref('');
const nomeCampanha = ref('');
const produtoNome = ref('');
const urlDestino = ref('');

// Step 2: Geolocalização
const cidade = ref(props.empresa?.cidade || 'São Paulo');
const raioKm = ref(props.empresa?.raio_atendimento || 8);

// Step 3: Orçamento
const orcamentoDiario = ref(80);
const recomendacaoIa = ref(null);

// Step 4: Criativo
const tituloAnuncio = ref('');
const textoPrincipal = ref('');
const descricao = ref('');
const cta = ref('ORDER_NOW');
const imageUrl = ref('https://images.unsplash.com/photo-1568901346375-23c9450c58cd');

onMounted(async () => {
    urlDestino.value = props.empresa?.site || 'https://cardapio.prefirodelivery.com.br';
    produtoNome.value = props.empresa?.produto_mais_vendido || 'Burger Artesanal Especial';
    nomeCampanha.value = `Campanha de Vendas - ${produtoNome.value}`;
    tituloAnuncio.value = `Peça ${produtoNome.value} Quentinho em Casa`;
    textoPrincipal.value = `O sabor inconfundível do delivery que você ama. Peça agora pelo cardápio com entrega rápida!`;
    descricao.value = 'Entrega rápida e segura direto na sua porta';

    try {
        const res = await fetch(`/api/campanhas/orcamento?empresaId=${props.empresa?.id}`);
        const data = await res.json();
        if (data.success && data.recomendacao) {
            recomendacaoIa.value = data.recomendacao;
            orcamentoDiario.value = data.recomendacao.orcamentoDiarioRecomendado;
        }
    } catch (e) {
        console.error(e);
    }
});

const handleInterpretar = async () => {
    if (!promptTexto.value.trim()) return;
    isAnalyzing.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch('/api/campanhas/interpretar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empresaId: props.empresa?.id, promptTexto: promptTexto.value })
        });
        const data = await res.json();
        if (data.success && data.interpretacao) {
            produtoNome.value = data.interpretacao.produtoFoco;
            nomeCampanha.value = `Campanha - ${data.interpretacao.produtoFoco}`;
            tituloAnuncio.value = `Peça ${data.interpretacao.produtoFoco} Quentinho em Casa`;
            textoPrincipal.value = `${data.interpretacao.sugestaoGancho} Peça online pelo cardápio oficial.`;
        }
    } catch (e) {
        errorMessage.value = 'Erro ao interpretar prompt.';
    } finally {
        isAnalyzing.value = false;
    }
};

const handleCreateCampaign = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch('/api/campanhas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                empresaId: props.empresa?.id,
                nomeCampanha: nomeCampanha.value,
                orcamentoDiario: orcamentoDiario.value,
                produtoNome: produtoNome.value,
                criativo: {
                    titulo: tituloAnuncio.value,
                    textoPrincipal: textoPrincipal.value,
                    descricao: descricao.value,
                    cta: cta.value,
                    imageUrl: imageUrl.value,
                }
            })
        });
        const data = await res.json();
        if (data.success) {
            router.visit(`/campanhas?empresaId=${props.empresa?.id}`);
        } else {
            errorMessage.value = data.error || 'Erro ao publicar campanha.';
        }
    } catch (e) {
        errorMessage.value = 'Erro na comunicação com o servidor.';
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <AppLayout title="Nova Campanha Guiada" :module-icon="TrendingUp">
        <div class="max-w-3xl mx-auto space-y-6">
            <!-- Header Card -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold text-slate-900">Criação Guiada de Campanha</h1>
                    <p class="text-xs text-slate-500 mt-0.5">Configure sua campanha em 5 etapas com inteligência artificial.</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span 
                        v-for="s in [1, 2, 3, 4, 5]" 
                        :key="s"
                        :class="[
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition',
                            step === s ? 'bg-indigo-600 text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                        ]"
                    >
                        {{ step > s ? '✓' : s }}
                    </span>
                </div>
            </div>

            <!-- Error Feedback -->
            <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {{ errorMessage }}
            </div>

            <!-- Step 1: Intenção Livre & Produto -->
            <div v-if="step === 1" class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <div class="flex items-center space-x-2">
                    <Sparkles class="w-5 h-5 text-indigo-600" />
                    <h2 class="text-lg font-bold text-slate-900">Passo 1: Qual é o foco da sua campanha?</h2>
                </div>
                
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Intenção em Linguagem Natural (Opcional)</label>
                    <div class="flex gap-2">
                        <input 
                            v-model="promptTexto" 
                            type="text" 
                            placeholder="Ex: Quero vender mais combos de hambúrguer artesanal nas noites de quinta a domingo"
                            class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                        <button 
                            @click="handleInterpretar"
                            :disabled="isAnalyzing"
                            class="px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition"
                        >
                            <Sparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': isAnalyzing }" />
                            <span>Interpretar</span>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Nome da Campanha</label>
                        <input 
                            v-model="nomeCampanha"
                            type="text"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Produto Principal</label>
                        <input 
                            v-model="produtoNome"
                            type="text"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Link de Destino do Cardápio Online</label>
                    <input 
                        v-model="urlDestino"
                        type="url"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                </div>

                <div class="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                        @click="step = 2"
                        class="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                        <span>Avançar para Geolocalização</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <!-- Step 2: Geolocalização -->
            <div v-if="step === 2" class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <div class="flex items-center space-x-2">
                    <MapPin class="w-5 h-5 text-indigo-600" />
                    <h2 class="text-lg font-bold text-slate-900">Passo 2: Onde estão os seus clientes?</h2>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Cidade Base</label>
                        <input 
                            v-model="cidade"
                            type="text"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Raio de Atendimento do Delivery</label>
                        <div class="flex items-center space-x-3">
                            <input 
                                v-model.number="raioKm"
                                type="range" 
                                min="2" 
                                max="25"
                                class="flex-1 accent-indigo-600 cursor-pointer"
                            />
                            <span class="text-sm font-bold text-slate-800 w-16 text-right">{{ raioKm }} km</span>
                        </div>
                    </div>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    💡 <strong>Otimização por Raio Geográfico:</strong> A Meta Ads direcionará os anúncios exclusivamente para pessoas conectadas dentro de um raio de <strong>{{ raioKm }} km</strong> em torno do restaurante em {{ cidade }}, garantindo entrega rápida e quentinha.
                </div>

                <div class="flex justify-between pt-4 border-t border-slate-100">
                    <button @click="step = 1" class="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                        <ArrowLeft class="w-3.5 h-3.5" />
                        <span>Voltar</span>
                    </button>
                    <button 
                        @click="step = 3"
                        class="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                        <span>Avançar para Orçamento</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <!-- Step 3: Orçamento -->
            <div v-if="step === 3" class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <div class="flex items-center space-x-2">
                    <DollarSign class="w-5 h-5 text-indigo-600" />
                    <h2 class="text-lg font-bold text-slate-900">Passo 3: Orçamento Diário Recomendado</h2>
                </div>

                <div v-if="recomendacaoIa" class="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-2">
                    <p class="font-bold flex items-center space-x-1.5">
                        <Sparkles class="w-4 h-4 text-indigo-600" />
                        <span>Sugestão Inteligente da IA</span>
                    </p>
                    <p class="leading-relaxed">{{ recomendacaoIa.justificativa }}</p>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Investimento Diário (R$)</label>
                    <input 
                        v-model.number="orcamentoDiario"
                        type="number"
                        min="20"
                        max="1000"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-lg font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                </div>

                <div>
                    <span class="text-xs font-semibold text-slate-500 block mb-2">Valores Sugeridos:</span>
                    <div class="flex flex-wrap gap-2">
                        <button 
                            v-for="op in (recomendacaoIa?.opcoesRapidas || [50, 80, 120, 200])"
                            :key="op"
                            type="button"
                            @click="orcamentoDiario = op"
                            :class="[
                                'px-3.5 py-1.5 rounded-lg text-xs font-bold border transition',
                                orcamentoDiario === op ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            ]"
                        >
                            R$ {{ op }}/dia
                        </button>
                    </div>
                </div>

                <div class="flex justify-between pt-4 border-t border-slate-100">
                    <button @click="step = 2" class="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                        <ArrowLeft class="w-3.5 h-3.5" />
                        <span>Voltar</span>
                    </button>
                    <button 
                        @click="step = 4"
                        class="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                        <span>Avançar para Criativo & Textos</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <!-- Step 4: Criativo & Textos -->
            <div v-if="step === 4" class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <div class="flex items-center space-x-2">
                    <ImageIcon class="w-5 h-5 text-indigo-600" />
                    <h2 class="text-lg font-bold text-slate-900">Passo 4: Textos & Criativo de Alta Conversão</h2>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Título do Anúncio (Headline)</label>
                    <input 
                        v-model="tituloAnuncio"
                        type="text"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Texto Principal (Copy do Post)</label>
                    <textarea 
                        v-model="textoPrincipal"
                        rows="3"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                    ></textarea>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Chamada para Ação (Botão CTA)</label>
                    <select 
                        v-model="cta"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                    >
                        <option value="ORDER_NOW">Fazer Pedido (ORDER_NOW)</option>
                        <option value="SHOP_NOW">Comprar Agora (SHOP_NOW)</option>
                        <option value="SEE_MORE">Ver Cardápio (SEE_MORE)</option>
                    </select>
                </div>

                <div class="flex justify-between pt-4 border-t border-slate-100">
                    <button @click="step = 3" class="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                        <ArrowLeft class="w-3.5 h-3.5" />
                        <span>Voltar</span>
                    </button>
                    <button 
                        @click="step = 5"
                        class="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                        <span>Revisar e Publicar</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <!-- Step 5: Revisão & Publicação -->
            <div v-if="step === 5" class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                <div class="flex items-center space-x-2">
                    <ShieldCheck class="w-5 h-5 text-emerald-600" />
                    <h2 class="text-lg font-bold text-slate-900">Passo 5: Revisão Final com Guardrails</h2>
                </div>

                <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                    <div class="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span class="text-slate-500">Campanha:</span>
                        <span class="font-bold text-slate-900">{{ nomeCampanha }}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span class="text-slate-500">Produto Foco:</span>
                        <span class="font-bold text-slate-900">{{ produtoNome }}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span class="text-slate-500">Região de Entrega:</span>
                        <span class="font-bold text-slate-900">Raio de {{ raioKm }} km ({{ cidade }})</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span class="text-slate-500">Orçamento Diário:</span>
                        <span class="font-bold text-indigo-700">R$ {{ orcamentoDiario.toFixed(2) }}/dia</span>
                    </div>
                    <div class="flex justify-between py-1.5">
                        <span class="text-slate-500">Segurança Orçamentária:</span>
                        <span class="font-bold text-emerald-700">Guardrail 20% & Cooldown 24h Ativos</span>
                    </div>
                </div>

                <div class="flex justify-between pt-4 border-t border-slate-100">
                    <button @click="step = 4" class="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                        <ArrowLeft class="w-3.5 h-3.5" />
                        <span>Voltar</span>
                    </button>
                    <button 
                        @click="handleCreateCampaign"
                        :disabled="isSubmitting"
                        class="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm shadow-emerald-200"
                    >
                        <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <CheckCircle2 v-else class="w-4 h-4" />
                        <span>Publicar Campanha no Meta Ads</span>
                    </button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
