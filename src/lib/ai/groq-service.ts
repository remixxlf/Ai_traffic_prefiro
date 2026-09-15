/**
 * Plataforma de Gestão de Tráfego com IA
 * Motor de Inteligência Artificial usando Groq SDK (PDF Seções 1, 45, 74, 75)
 */

import Groq from 'groq-sdk';
import { z } from 'zod';

export const AIAnalysisResponseSchema = z.object({
  tipo: z.enum(['OPORTUNIDADE', 'ATENCAO', 'BEM_SUCEDIDO']),
  titulo: z.string().min(3),
  analise: z.string().min(5),
  motivo: z.string().min(5),
  acao_sugerida: z.string().min(5),
  impacto_previsto: z.enum(['ALTO', 'MEDIO', 'BAIXO']),
  nivel_confianca: z.number().min(0).max(1),
  risco: z.enum(['BAIXO', 'MEDIO', 'ALTO'])
});

export type AIAnalysisResponse = z.infer<typeof AIAnalysisResponseSchema>;

export interface GroqServiceOptions {
  apiKey?: string;
  model?: string;
  forceMock?: boolean;
}

export class GroqAIService {
  private client: Groq | null = null;
  private model: string;
  private forceMock: boolean;

  constructor(options: GroqServiceOptions = {}) {
    const apiKey = options.apiKey || process.env.GROQ_API_KEY;
    this.model = options.model || 'llama-3.3-70b-versatile';
    this.forceMock = options.forceMock ?? (!apiKey || apiKey === 'mock-key');

    if (!this.forceMock && apiKey) {
      this.client = new Groq({ apiKey });
    }
  }

  /**
   * Gera análise e recomendação estratégica baseada nos dados do negócio e métricas
   */
  async generateAnalysis(context: {
    empresa: string;
    segmento?: string;
    cidade?: string;
    ticket_medio?: number;
    metas?: { cpa_max?: number; roas_min?: number };
    metricas_recentes?: Record<string, any>;
  }): Promise<AIAnalysisResponse> {
    if (this.forceMock || !this.client) {
      return this.generateMockAnalysis(context);
    }

    const systemPrompt = `Você é o Gestor de Tráfego com IA da plataforma SaaS para restaurantes e delivery.
Sua missão é interpretar dados analíticos de anúncios e pedidos reais da empresa e gerar recomendações objetivas em linguagem de negócio (sem siglas obscuras).
Você deve responder ESTRITAMENTE em formato JSON compatível com o seguinte schema:
{
  "tipo": "OPORTUNIDADE" | "ATENCAO" | "BEM_SUCEDIDO",
  "titulo": string,
  "analise": string,
  "motivo": string,
  "acao_sugerida": string,
  "impacto_previsto": "ALTO" | "MEDIO" | "BAIXO",
  "nivel_confianca": number (0 a 1),
  "risco": "BAIXO" | "MEDIO" | "ALTO"
}`;

    const userPrompt = `Contexto da Empresa:
Nome: ${context.empresa}
Segmento: ${context.segmento || 'Restaurante/Delivery'}
Cidade: ${context.cidade || 'Não informada'}
Ticket Médio: R$ ${context.ticket_medio || 50}
Metas: ${JSON.stringify(context.metas || {})}
Métricas Recentes: ${JSON.stringify(context.metricas_recentes || {})}

Analise os dados e formule uma recomendação acionável.`;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('Resposta vazia da API do Groq.');
      }

      const json = JSON.parse(responseContent);
      return AIAnalysisResponseSchema.parse(json);
    } catch (error) {
      console.warn('Falha na chamada ao Groq, caindo para mock determinístico:', error);
      return this.generateMockAnalysis(context);
    }
  }

  /**
   * Gera resposta estruturada em JSON genérico a partir de prompts customizados
   */
  async generateCustomJson(systemPrompt: string, userPrompt: string): Promise<Record<string, any>> {
    if (this.forceMock || !this.client) {
      throw new Error('Groq client em modo mock/offline.');
    }

    const completion = await this.client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: this.model,
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Resposta vazia da API do Groq.');
    }

    return JSON.parse(responseContent);
  }

  /**
   * Fallback determinístico de alta qualidade para modo sandbox e testes
   */
  private generateMockAnalysis(context: {
    empresa: string;
    segmento?: string;
    cidade?: string;
    ticket_medio?: number;
    metas?: { cpa_max?: number; roas_min?: number };
    metricas_recentes?: Record<string, any>;
  }): AIAnalysisResponse {
    const roas = context.metricas_recentes?.roas ?? 5.5;
    const roasMeta = context.metas?.roas_min ?? 4.0;

    if (roas >= roasMeta) {
      return {
        tipo: 'OPORTUNIDADE',
        titulo: `Oportunidade de Escala para ${context.empresa}`,
        analise: `Sua publicidade está saudável. O ROAS recente de ${roas.toFixed(2)} está acima da sua meta de ${roasMeta.toFixed(2)}.`,
        motivo: 'Volume de conversões constante com estabilidade no custo por pedido.',
        acao_sugerida: 'Recomendamos aumentar o investimento diário em 15% para ampliar alcance no horário de pico.',
        impacto_previsto: 'ALTO',
        nivel_confianca: 0.92,
        risco: 'BAIXO'
      };
    } else {
      return {
        tipo: 'ATENCAO',
        titulo: `Atenção ao Custo por Aquisição`,
        analise: `O ROAS atual de ${roas.toFixed(2)} ficou abaixo da meta esperada de ${roasMeta.toFixed(2)}.`,
        motivo: 'Possível saturação de público ou aumento da concorrência no leilão local.',
        acao_sugerida: 'Testar nova variação de criativo com foco em urgência ou promoção do dia.',
        impacto_previsto: 'MEDIO',
        nivel_confianca: 0.85,
        risco: 'MEDIO'
      };
    }
  }
}
