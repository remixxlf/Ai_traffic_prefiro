/**
 * Plataforma de Gestão de Tráfego com IA
 * Motor de Copywriting com IA (Groq) & 3 Variações Estratégicas
 * (PDF Seções 36, 37, 88)
 */

import { z } from 'zod';
import { BusinessMemoryService } from './business-memory-service';
import { GroqAIService } from '../ai/groq-service';

export interface CopywritingRequest {
  empresaId: string;
  produtoNome?: string;
  preco?: number;
  precoPromocional?: number;
  publicoAlvo?: string;
  ganchoEspecial?: string;
}

export interface AdCopyVariation {
  estrategia: 'FOCO_PRODUTO' | 'FOCO_BENEFICIO' | 'FOCO_URGENCIA';
  titulo: string;
  textoPrincipal: string;
  descricao: string;
  cta: 'Peça Agora' | 'Pedir Agora' | 'Comprar Agora' | 'ORDER_NOW';
  porQueFunciona: string;
}

export interface CopywritingResult {
  empresa: string;
  produto: string;
  variacoes: {
    focoProduto: AdCopyVariation;
    focoBeneficio: AdCopyVariation;
    focoUrgencia: AdCopyVariation;
  };
}

const CopySchema = z.object({
  focoProduto: z.object({
    titulo: z.string(),
    textoPrincipal: z.string(),
    descricao: z.string(),
    cta: z.string(),
    porQueFunciona: z.string()
  }),
  focoBeneficio: z.object({
    titulo: z.string(),
    textoPrincipal: z.string(),
    descricao: z.string(),
    cta: z.string(),
    porQueFunciona: z.string()
  }),
  focoUrgencia: z.object({
    titulo: z.string(),
    textoPrincipal: z.string(),
    descricao: z.string(),
    cta: z.string(),
    porQueFunciona: z.string()
  })
});

export class CopywritingService {
  private memoryService: BusinessMemoryService;
  private aiService: GroqAIService;

  constructor() {
    this.memoryService = new BusinessMemoryService();
    this.aiService = new GroqAIService();
  }

  /**
   * Gera as 3 variações estratégicas de copy para anúncios de delivery (PDF Seção 36 e 37)
   */
  async generateStrategicCopies(req: CopywritingRequest): Promise<CopywritingResult> {
    const memory = await this.memoryService.getBusinessContext(req.empresaId);
    const produtoFinal = req.produtoNome || memory.produto_principal || 'Nossos Pratos Mais Pedidos';
    const precoTexto = req.precoPromocional
      ? `De R$ ${req.preco?.toFixed(2)} por apenas R$ ${req.precoPromocional.toFixed(2)}`
      : req.preco
      ? `Apenas R$ ${req.preco.toFixed(2)}`
      : '';

    const systemPrompt = `Você é um copywriter de elite especializado em delivery de comida e tráfego pago na Meta Ads.
Você SEMPRE fala a língua direta do dono do restaurante, sem jargões corporativos (PDF Seção 88).
Seu objetivo é gerar 3 variações de anúncios de alta conversão:
1. FOCO_PRODUTO: Destaque sensorial irresistível do sabor, ingredientes frescos e qualidade.
2. FOCO_BENEFICIO: Comodidade, rapidez, não sujar a cozinha, relaxar com quem ama em casa.
3. FOCO_URGENCIA: Escassez, tempo limitado para pedir hoje à noite, pedir antes que feche ou esgote.

Memória do Negócio:
${await this.memoryService.getBusinessContextAsPrompt(req.empresaId)}`;

    const userPrompt = `Gere 3 variações de copy para o produto: "${produtoFinal}".
${precoTexto ? `Preço: ${precoTexto}` : ''}
${req.ganchoEspecial ? `Gancho extra: ${req.ganchoEspecial}` : ''}

Retorne estritamente um JSON com a seguinte estrutura:
{
  "focoProduto": {
    "titulo": "Título curto e impactante (max 40 caracteres)",
    "textoPrincipal": "Texto envolvente para o feed (3 a 5 linhas)",
    "descricao": "Texto de apoio curto (max 30 caracteres)",
    "cta": "Peça Agora",
    "porQueFunciona": "Explicação em 1 frase simples para o empresário"
  },
  "focoBeneficio": {
    "titulo": "Título com foco em praticidade",
    "textoPrincipal": "Texto com foco em comodidade",
    "descricao": "Texto de apoio",
    "cta": "Peça Agora",
    "porQueFunciona": "Explicação em 1 frase simples para o empresário"
  },
  "focoUrgencia": {
    "titulo": "Título com urgência / promoção",
    "textoPrincipal": "Texto com urgência para hoje",
    "descricao": "Texto de apoio",
    "cta": "Peça Agora",
    "porQueFunciona": "Explicação em 1 frase simples para o empresário"
  }
}`;

    // Tentar chamada direta via Groq AI
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'mock-groq-key') {
        const rawJson = await this.aiService.generateCustomJson(systemPrompt, userPrompt);
        const parsed = CopySchema.parse(rawJson);

        return {
          empresa: memory.empresa,
          produto: produtoFinal,
          variacoes: {
            focoProduto: { ...parsed.focoProduto, estrategia: 'FOCO_PRODUTO', cta: 'Peça Agora' },
            focoBeneficio: { ...parsed.focoBeneficio, estrategia: 'FOCO_BENEFICIO', cta: 'Peça Agora' },
            focoUrgencia: { ...parsed.focoUrgencia, estrategia: 'FOCO_URGENCIA', cta: 'Peça Agora' }
          }
        };
      }
    } catch (err) {
      console.warn('Fallback para cópia heurística de alta conversão:', err);
    }

    // Fallback Heurístico Determinístico de Alta Conversão (Sandbox / Modo Offline)
    return this.generateDeterministicCopies(memory.empresa, produtoFinal, precoTexto, memory.cidade);
  }

  private generateDeterministicCopies(
    empresa: string,
    produto: string,
    precoTexto: string,
    cidade: string
  ): CopywritingResult {
    return {
      empresa,
      produto,
      variacoes: {
        focoProduto: {
          estrategia: 'FOCO_PRODUTO',
          titulo: `${produto} Perfeita!`,
          textoPrincipal: `Dá uma olhada nisso! Nosso(a) ${produto} é preparado(a) com ingredientes frescos, massa artesanal e muito recheio que derrete na boca. Quem prova uma vez, pede sempre. Experimente o verdadeiro sabor em ${cidade}!`,
          descricao: precoTexto || 'O sabor favorito da cidade',
          cta: 'Peça Agora',
          porQueFunciona: 'Desperta desejo imediato e fome visual através do foco nos ingredientes e sabor artesanal.'
        },
        focoBeneficio: {
          estrategia: 'FOCO_BENEFICIO',
          titulo: 'Seu Jantar Quentinho em Casa',
          textoPrincipal: `Cansou do dia puxado? Deixe a cozinha com a gente. Peça seu(sua) ${produto} e receba quentinho, rápido e embalado com todo cuidado para você só relaxar e aproveitar no conforto do seu sofá.`,
          descricao: 'Entrega rápida e segura',
          cta: 'Peça Agora',
          porQueFunciona: 'Ataca a dor da preguiça de cozinhar ou lavar louça, vendendo descanso e comodidade.'
        },
        focoUrgencia: {
          estrategia: 'FOCO_URGENCIA',
          titulo: 'Peça Hoje Antes que Esgote!',
          textoPrincipal: `A fornada de hoje do(a) ${produto} já está saindo a todo vapor! Não deixe para última hora porque nosso estoque é limitado e a fila de entrega lota rápido nos horários de pico. Peça agora mesmo!`,
          descricao: precoTexto || 'Disponível enquanto durar a fornada',
          cta: 'Peça Agora',
          porQueFunciona: 'Gera senso de escassez e acelera a decisão de compra sem dar tempo para o cliente adiar.'
        }
      }
    };
  }
}
