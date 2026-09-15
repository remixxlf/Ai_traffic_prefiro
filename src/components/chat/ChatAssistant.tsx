'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Message {
  sender: 'user' | 'ia';
  text: string;
  comando?: any;
}

interface ChatAssistantProps {
  empresaId: string;
}

export default function ChatAssistant({ empresaId }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ia',
      text: 'Olá! Sou o seu Gestor de Tráfego com IA. Você pode me fazer perguntas sobre o desempenho dos seus anúncios, pedir relatórios ou simplesmente me dar um comando em português (ex: "Quero investir R$ 3.000 este mês para vender hambúrguer"). Como posso te ajudar hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Como estão minhas campanhas?',
    'Quanto investi esta semana?',
    'Qual produto está vendendo mais?',
    'Quero investir R$ 3.000 este mês para vender hambúrguer'
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          mensagem: text
        })
      });

      const json = await res.json();
      if (json.success && json.resposta) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ia',
            text: json.resposta.texto,
            comando: json.resposta.comandoEstruturado
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ia',
            text: 'Desculpe, ocorreu uma instabilidade momentânea ao processar sua dúvida.'
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ia',
          text: 'Falha de comunicação com o servidor de IA.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-3xl border border-gray-800 flex flex-col h-[650px] shadow-2xl overflow-hidden">
      {/* Header do Chat */}
      <div className="p-4 md:p-5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Gestor de Tráfego com IA</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-gray-400">Ativo • Conectado à Meta Ads & Prefiro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Card de Proposta Estruturada por Comando (PDF Seção 48) */}
              {m.comando && (
                <div className="mt-3 pt-3 border-t border-gray-800 space-y-2.5">
                  <div className="bg-gray-900 p-3 rounded-xl border border-blue-500/30 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-blue-400 uppercase block">
                      ⚡ Sugestão Pronta para Lançamento
                    </span>
                    <p className="text-white">
                      <strong>Orçamento:</strong> R$ {m.comando.orcamentoDiario?.toFixed(2)}/dia
                    </p>
                    <p className="text-gray-300">
                      <strong>Produto:</strong> {m.comando.produtoFoco}
                    </p>
                    <p className="text-gray-300">
                      <strong>Público:</strong> {m.comando.publico}
                    </p>
                  </div>
                  <Link
                    href={`/campanhas/nova?empresaId=${empresaId}`}
                    className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    🚀 Abrir Wizard e Criar Esta Campanha
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-3 text-xs text-gray-400 flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              IA analisando métricas e elaborando resposta...
            </div>
          </div>
        )}
      </div>

      {/* Sugestões Rápidas de Perguntas (PDF Seção 47) */}
      <div className="px-4 py-2 bg-gray-950 border-t border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-gray-500 font-bold uppercase flex-shrink-0">
          Sugestões:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="flex-shrink-0 px-3 py-1 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-[11px] transition-all hover:text-white"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input de Mensagem */}
      <div className="p-3 md:p-4 bg-gray-950 border-t border-gray-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Faça uma pergunta ou dê uma instrução à sua IA..."
          className="flex-1 bg-gray-900 text-white text-xs md:text-sm px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm rounded-xl transition-all shadow-md flex items-center gap-1"
        >
          <span>Enviar</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
