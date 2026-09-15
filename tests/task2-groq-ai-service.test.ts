import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { GroqAIService, AIAnalysisResponseSchema } from '../src/lib/ai/groq-service';

describe('Task 2: Motor de IA com Groq SDK e Schemas Estruturados (PDF Seções 1, 45, 74)', () => {
  it('deve validar o schema de resposta da IA com seções bem definidas (análise, motivo, oportunidade, confiança)', () => {
    const validData = {
      titulo: 'Aumento de Eficiência em Campanha Pizza',
      analise: 'Campanha apresentou ROAS de 6.2 nos últimos 7 dias, superando a média do negócio.',
      motivo: 'Volume de conversões concentrado no período das 19h às 22h na sexta e sábado.',
      acao_sugerida: 'Aumentar orçamento diário em 15%',
      impacto_previsto: 'ALTO',
      nivel_confianca: 0.95,
      risco: 'BAIXO',
      tipo: 'OPORTUNIDADE'
    };

    const parsed = AIAnalysisResponseSchema.parse(validData);
    expect(parsed.titulo).toBe(validData.titulo);
    expect(parsed.nivel_confianca).toBe(0.95);
    expect(parsed.tipo).toBe('OPORTUNIDADE');
  });

  it('deve rejeitar respostas da IA que não respeitam o contrato tipado (Zod)', () => {
    const invalidData = {
      titulo: 'Título incompleto',
      // Faltando campos obrigatórios
    };

    expect(() => AIAnalysisResponseSchema.parse(invalidData)).toThrow();
  });

  it('deve gerar análise estruturada via GroqAIService em modo sandbox ou live', async () => {
    const aiService = new GroqAIService({ apiKey: process.env.GROQ_API_KEY || 'mock-key', forceMock: true });
    
    const context = {
      empresa: 'Pizzaria Bella Napoli',
      segmento: 'Pizzaria',
      cidade: 'Feira de Santana',
      ticket_medio: 78.0,
      metas: { cpa_max: 15.0, roas_min: 4.0 },
      metricas_recentes: {
        investimento: 1850.0,
        receita: 11400.0,
        pedidos: 146,
        roas: 6.16
      }
    };

    const result = await aiService.generateAnalysis(context);
    expect(result).toBeDefined();
    expect(result.tipo).toBeDefined();
    expect(result.acao_sugerida).toBeDefined();
    expect(result.nivel_confianca).toBeGreaterThanOrEqual(0);
  });
});
