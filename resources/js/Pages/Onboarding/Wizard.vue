<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { 
    Store, 
    Bike, 
    Link2, 
    ShieldCheck, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2, 
    AlertCircle,
    Building2,
    Globe
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
    user: Object,
});

const currentStep = ref(1);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Step 1 Form
const form1 = ref({
    nome: props.empresa?.nome || '',
    segmento: props.empresa?.segmento || 'Hamburgueria Artesanal',
    cidade: props.empresa?.cidade || 'São Paulo',
    estado: props.empresa?.estado || 'SP',
    site: props.empresa?.site || 'https://burgermania.prefirorapido.com.br',
});

// Step 2 Form
const form2 = ref({
    raio_atendimento: props.empresa?.raio_atendimento || 7.0,
    ticket_medio: props.empresa?.ticket_medio || 48.0,
    publico_alvo: props.empresa?.publico_alvo || 'Jovens e famílias no almoço e jantar',
    horario_forte_inicio: props.empresa?.horario_forte_inicio || '18:00',
    horario_forte_fim: props.empresa?.horario_forte_fim || '23:30',
    dias_fortes: props.empresa?.dias_fortes || 'Quarta a Domingo',
    produto_mais_vendido: props.empresa?.produto_mais_vendido || 'Smash Cheddar Bacon Duplo',
    descricao: props.empresa?.descricao || '',
});

// Step 3 Form (Meta OAuth / Sandbox)
const form3 = ref({
    access_token: 'EAAB_MOCK_TOKEN_PREFIRO',
    meta_business_id: 'bm_1029384756',
    business_name: 'BM Restaurante Delivery',
    meta_account_id: 'act_9988776655',
    account_name: 'Conta Anúncios Delivery',
    meta_page_id: 'pg_1122334455',
    page_name: 'Página Delivery Oficial',
    meta_instagram_id: 'ig_5566778899',
    instagram_username: '@restauranteprefiro',
    meta_pixel_id: 'px_7788990011',
    pixel_name: 'Pixel de Conversão Prefiro',
});

// Step 4 Form
const form4 = ref({
    modo_operacao: props.empresa?.modo_operacao || 'ASSISTIDO',
    orcamento_max_diario: props.empresa?.orcamento_max_diario || 300.0,
});

const empresaId = ref(props.empresa?.id || null);

const handleStep1 = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch('/api/onboarding/step1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(form1.value),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao salvar etapa 1');
        empresaId.value = data.empresa.id;
        currentStep.value = 2;
    } catch (err) {
        errorMessage.value = err.message;
    } finally {
        loading.value = false;
    }
};

const handleStep2 = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch(`/api/onboarding/step2/${empresaId.value}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(form2.value),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao salvar etapa 2');
        currentStep.value = 3;
    } catch (err) {
        errorMessage.value = err.message;
    } finally {
        loading.value = false;
    }
};

const handleStep3 = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch(`/api/onboarding/step3/${empresaId.value}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(form3.value),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao conectar Meta');
        currentStep.value = 4;
    } catch (err) {
        errorMessage.value = err.message;
    } finally {
        loading.value = false;
    }
};

const handleStep4 = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch(`/api/onboarding/step4/${empresaId.value}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(form4.value),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao finalizar onboarding');
        router.visit('/');
    } catch (err) {
        errorMessage.value = err.message;
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <!-- Top Brand -->
        <div class="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
            <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
                P
            </div>
            <h2 class="mt-4 text-2xl font-black text-slate-900 tracking-tight">
                Configuração Inicial do Restaurante
            </h2>
            <p class="text-sm text-slate-500 mt-1">
                Setup guiado em 4 etapas conforme as diretrizes da plataforma
            </p>

            <!-- Stepper Indicator -->
            <div class="mt-8 flex items-center justify-between relative max-w-md mx-auto">
                <div class="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-0"></div>
                <div 
                    v-for="s in [1, 2, 3, 4]" 
                    :key="s"
                    :class="[
                        currentStep >= s ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' : 'bg-white text-slate-400 border border-slate-300',
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all'
                    ]"
                >
                    <CheckCircle2 v-if="currentStep > s" class="w-4 h-4" />
                    <span v-else>{{ s }}</span>
                </div>
            </div>
        </div>

        <!-- Card Container -->
        <div class="sm:mx-auto sm:w-full sm:max-w-xl">
            <div class="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
                <!-- Alert Error -->
                <div v-if="errorMessage" class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle class="w-4 h-4 shrink-0" />
                    <span>{{ errorMessage }}</span>
                </div>

                <!-- STEP 1: Identidade do Restaurante (com campo 'site' / URL do restaurante) -->
                <form v-if="currentStep === 1" @submit.prevent="handleStep1" class="space-y-4">
                    <div class="border-b border-slate-100 pb-3 mb-4">
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Store class="w-4 h-4 text-indigo-600" />
                            <span>Etapa 1: Identidade do Estabelecimento</span>
                        </h3>
                        <p class="text-xs text-slate-500">Dados cadastrais do seu restaurante parceiro</p>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Nome do Restaurante *</label>
                        <input v-model="form1.nome" required type="text" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" placeholder="Ex: Burger Mania Delivery" />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Segmento Culinário</label>
                            <input v-model="form1.segmento" type="text" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" placeholder="Ex: Hamburgueria Artesanal" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Site / URL do Restaurante *</label>
                            <div class="relative">
                                <Globe class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input v-model="form1.site" type="url" class="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" placeholder="https://burgermaniadelivery.com.br" />
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div class="col-span-2">
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                            <input v-model="form1.cidade" type="text" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
                            <input v-model="form1.estado" maxlength="2" type="text" class="w-full px-3.5 py-2 text-sm uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
                        </div>
                    </div>

                    <div class="pt-4 flex justify-end">
                        <button :disabled="loading" type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 flex items-center gap-1.5 transition-all">
                            <span>Avançar para Operação</span>
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </form>

                <!-- STEP 2: Operação de Delivery -->
                <form v-if="currentStep === 2" @submit.prevent="handleStep2" class="space-y-4">
                    <div class="border-b border-slate-100 pb-3 mb-4">
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Bike class="w-4 h-4 text-indigo-600" />
                            <span>Etapa 2: Operação & Raio de Entrega</span>
                        </h3>
                        <p class="text-xs text-slate-500">Parâmetros essenciais para a IA direcionar o tráfego pago</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Raio de Atendimento (km)</label>
                            <input v-model="form2.raio_atendimento" step="0.5" type="number" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Ticket Médio (R$)</label>
                            <input v-model="form2.ticket_medio" step="0.5" type="number" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Produto Carro-Chefe (Mais Vendido)</label>
                        <input v-model="form2.produto_mais_vendido" type="text" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Pico Início</label>
                            <input v-model="form2.horario_forte_inicio" type="time" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Pico Fim</label>
                            <input v-model="form2.horario_forte_fim" type="time" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200" />
                        </div>
                    </div>

                    <div class="pt-4 flex justify-between">
                        <button type="button" @click="currentStep = 1" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                            <ChevronLeft class="w-4 h-4" />
                            <span>Voltar</span>
                        </button>
                        <button :disabled="loading" type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 flex items-center gap-1.5">
                            <span>Avançar para Meta</span>
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </form>

                <!-- STEP 3: Conexão Meta -->
                <form v-if="currentStep === 3" @submit.prevent="handleStep3" class="space-y-4">
                    <div class="border-b border-slate-100 pb-3 mb-4">
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Link2 class="w-4 h-4 text-indigo-600" />
                            <span>Etapa 3: Integração Meta Ads Ecosystem</span>
                        </h3>
                        <p class="text-xs text-slate-500">Conexão segura com Gerenciador de Negócios, Pixel e CAPI</p>
                    </div>

                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                        <div class="flex items-center justify-between">
                            <span class="font-semibold text-slate-700">Business Manager:</span>
                            <span class="text-indigo-600 font-mono">{{ form3.meta_business_id }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-semibold text-slate-700">Conta de Anúncios:</span>
                            <span class="text-indigo-600 font-mono">{{ form3.meta_account_id }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-semibold text-slate-700">Pixel & CAPI:</span>
                            <span class="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 class="w-3.5 h-3.5" />
                                Conectado com Eventos de Compra
                            </span>
                        </div>
                    </div>

                    <div class="pt-4 flex justify-between">
                        <button type="button" @click="currentStep = 2" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                            <ChevronLeft class="w-4 h-4" />
                            <span>Voltar</span>
                        </button>
                        <button :disabled="loading" type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 flex items-center gap-1.5">
                            <span>Avançar para Políticas</span>
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </form>

                <!-- STEP 4: Modo de Operação & Políticas -->
                <form v-if="currentStep === 4" @submit.prevent="handleStep4" class="space-y-5">
                    <div class="border-b border-slate-100 pb-3 mb-4">
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck class="w-4 h-4 text-indigo-600" />
                            <span>Etapa 4: Modo de Operação & Teto de Orçamento</span>
                        </h3>
                        <p class="text-xs text-slate-500">Trava de segurança do Policy Engine</p>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-2">Modo de Autonomia da IA</label>
                        <div class="grid grid-cols-2 gap-3">
                            <label 
                                :class="[
                                    form4.modo_operacao === 'ASSISTIDO' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200',
                                    'p-3.5 rounded-xl border flex flex-col cursor-pointer transition-all'
                                ]"
                            >
                                <input type="radio" v-model="form4.modo_operacao" value="ASSISTIDO" class="sr-only" />
                                <span class="text-xs font-bold text-slate-900">Modo Assistido</span>
                                <span class="text-[11px] text-slate-500 mt-1">A IA sugere otimizações e o operador aprova</span>
                            </label>

                            <label 
                                :class="[
                                    form4.modo_operacao === 'PILOTO_AUTOMATICO' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200',
                                    'p-3.5 rounded-xl border flex flex-col cursor-pointer transition-all'
                                ]"
                            >
                                <input type="radio" v-model="form4.modo_operacao" value="PILOTO_AUTOMATICO" class="sr-only" />
                                <span class="text-xs font-bold text-slate-900">Piloto Automático</span>
                                <span class="text-[11px] text-slate-500 mt-1">A IA executa regras dentro do limite de 20%</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Teto Máximo Diário de Investimento (R$)</label>
                        <input v-model="form4.orcamento_max_diario" step="10" min="20" type="number" class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
                        <p class="text-[11px] text-slate-500 mt-1">Nenhuma campanha poderá ultrapassar esse valor sem aprovação explícita do administrador.</p>
                    </div>

                    <div class="pt-4 flex justify-between">
                        <button type="button" @click="currentStep = 3" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                            <ChevronLeft class="w-4 h-4" />
                            <span>Voltar</span>
                        </button>
                        <button :disabled="loading" type="submit" class="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 class="w-4 h-4" />
                            <span>Finalizar & Abrir Dashboard</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
