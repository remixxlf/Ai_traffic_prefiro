<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { 
    MessageSquare, 
    Send, 
    Bot, 
    Sparkles, 
    CheckCircle2, 
    TrendingUp, 
    DollarSign,
    Layers
} from 'lucide-vue-next';

const props = defineProps({
    empresa: Object,
});

const messages = ref([
    {
        sender: 'ia',
        text: `Olá! Sou o seu Gestor de Tráfego com IA para ${props.empresa?.nome || 'seu delivery'}. Você pode me fazer perguntas sobre seu ROAS Real, métricas de vendas do cardápio, ou me dar comandos em português (ex: "Quero investir R$ 3.000 este mês para vender hambúrguer"). Como posso te ajudar hoje?`
    }
]);

const inputMessage = ref('');
const isLoading = ref(false);

const quickPrompts = [
    'Como estão minhas campanhas?',
    'Quanto investi esta semana?',
    'Qual produto está vendendo mais?',
    'Quero investir R$ 3.000 este mês para vender hambúrguer'
];

const handleSend = async (customText = null) => {
    const text = customText || inputMessage.value;
    if (!text.trim() || isLoading.value) return;

    messages.value.push({ sender: 'user', text });
    inputMessage.value = '';
    isLoading.value = true;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                empresaId: props.empresa?.id,
                mensagem: text,
            })
        });
        const json = await res.json();
        if (json.success && json.resposta) {
            messages.value.push({
                sender: 'ia',
                text: json.resposta.texto,
                comando: json.resposta.comandoEstruturado,
            });
        } else {
            messages.value.push({
                sender: 'ia',
                text: 'Desculpe, ocorreu uma instabilidade momentânea ao processar sua dúvida.'
            });
        }
    } catch (e) {
        messages.value.push({
            sender: 'ia',
            text: 'Falha de comunicação com o servidor de IA.'
        });
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <AppLayout title="Chat IA & Assistente" :module-icon="MessageSquare">
        <div class="max-w-4xl mx-auto space-y-4">
            <!-- Chat Window Box -->
            <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
                <!-- Chat Header -->
                <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                            <Bot class="w-5 h-5" />
                        </div>
                        <div>
                            <h2 class="text-sm font-bold text-slate-900">Gestor de Tráfego Conversacional (Llama 3.3 70B)</h2>
                            <div class="flex items-center space-x-1.5 mt-0.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span class="text-[11px] text-slate-500 font-medium">Conectado ao Meta Ads & Cardápio Prefiro Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Messages Container -->
                <div class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                    <div 
                        v-for="(msg, idx) in messages" 
                        :key="idx"
                        class="flex"
                        :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
                    >
                        <div 
                            :class="[
                                'max-w-xl rounded-2xl p-4 text-xs leading-relaxed shadow-xs',
                                msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                            ]"
                        >
                            <div class="whitespace-pre-line">{{ msg.text }}</div>

                            <!-- Structured Command Card if present -->
                            <div v-if="msg.comando" class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-2 text-xs">
                                <div class="flex items-center justify-between font-bold text-indigo-700">
                                    <span>🚀 Proposta de Campanha Pronta</span>
                                    <span>R$ {{ msg.comando.orcamentoDiario }}/dia</span>
                                </div>
                                <div class="text-[11px] text-slate-600 space-y-1">
                                    <p><strong>Estratégia:</strong> {{ msg.comando.estrategia }}</p>
                                    <p><strong>Produto:</strong> {{ msg.comando.produtoFoco }}</p>
                                    <p><strong>Público:</strong> {{ msg.comando.publico }}</p>
                                </div>
                                <div class="pt-2">
                                    <button 
                                        class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                                    >
                                        Confirmar e Publicar Anúncio
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="isLoading" class="flex justify-start">
                        <div class="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center space-x-2 text-xs text-slate-500">
                            <span class="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            <span>Consultando Llama 3.3 70B & métricas de vendas...</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Prompts Pills -->
                <div class="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto text-[11px]">
                    <button 
                        v-for="qp in quickPrompts" 
                        :key="qp"
                        @click="handleSend(qp)"
                        class="px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 transition shrink-0"
                    >
                        {{ qp }}
                    </button>
                </div>

                <!-- Input Footer -->
                <div class="p-4 bg-white border-t border-slate-100">
                    <form @submit.prevent="handleSend()" class="flex gap-2">
                        <input 
                            v-model="inputMessage"
                            type="text"
                            placeholder="Digite uma dúvida sobre métricas ou um comando para criar anúncios..."
                            class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                        <button 
                            type="submit"
                            :disabled="isLoading || !inputMessage.trim()"
                            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Send class="w-3.5 h-3.5" />
                            <span>Enviar</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
