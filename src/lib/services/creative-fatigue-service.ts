/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço da Biblioteca de Criativos & Módulo de Detecção de Fadiga
 * (PDF Seções 35, 37, 39, 40)
 */

import { db } from '../db';

export interface CreateCreativeDTO {
  nome: string;
  tipo_midia?: string;
  formato?: '1:1' | '4:5' | '9:16';
  url_midia?: string;
  produto_id?: string;
  categoria?: string;
  tags?: string[];
  texto_principal?: string;
  titulo?: string;
  descricao?: string;
}

export interface CreativeMetricsUpdate {
  impressoes: number;
  cliques: number;
  frequencia?: number;
  conversoes: number;
  investimento: number;
  receita: number;
}

export interface FatigueAlert {
  criativoId: string;
  nome: string;
  mensagem: string;
  frequencia: number;
  cpa: number;
  ctr: number;
}

export class CreativeFatigueService {
  /**
   * Cadastra criativo na biblioteca vinculando ao catálogo da Prefiro (PDF Seções 35 e 37)
   */
  async createCreative(empresaId: string, data: CreateCreativeDTO) {
    return db.criativo.create({
      data: {
        empresa_id: empresaId,
        nome: data.nome,
        tipo: data.tipo_midia || 'IMAGEM',
        formato: data.formato || '1:1',
        url_midia: data.url_midia,
        produto_id: data.produto_id || null,
        categoria: data.categoria,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        texto_principal: data.texto_principal,
        titulo: data.titulo,
        descricao: data.descricao,
        status_fadiga: 'SAUDAVEL'
      }
    });
  }

  /**
   * Atualiza métricas individuais do criativo (PDF Seção 39)
   */
  async updateCreativeMetrics(criativoId: string, metrics: CreativeMetricsUpdate) {
    const ctr = metrics.impressoes > 0
      ? Number(((metrics.cliques / metrics.impressoes) * 100).toFixed(2))
      : 0;
    const cpa = metrics.conversoes > 0
      ? Number((metrics.investimento / metrics.conversoes).toFixed(2))
      : 0;
    const roas = metrics.investimento > 0
      ? Number((metrics.receita / metrics.investimento).toFixed(2))
      : 0;
    const frequencia = metrics.frequencia ?? 1.0;

    return db.criativo.update({
      where: { id: criativoId },
      data: {
        impressoes: metrics.impressoes,
        cliques: metrics.cliques,
        ctr,
        frequencia,
        conversoes: metrics.conversoes,
        cpa,
        roas,
        investimento: metrics.investimento,
        receita: metrics.receita
      }
    });
  }

  /**
   * Algoritmo de Detecção de Fadiga / Saturação de Anúncio (PDF Seção 40)
   * Sinais de alerta:
   *   - Frequência >= 2.8 (público impactado repetidamente)
   *   - Queda de CTR <= 1.5%
   *   - Aumento do Custo por Pedido (CPA >= R$ 18.00)
   */
  async analyzeFatigue(empresaId: string) {
    const criativos = await db.criativo.findMany({
      where: { empresa_id: empresaId }
    });

    const saturados = [];
    const saudaveis = [];
    const alertasGerados: FatigueAlert[] = [];

    for (const c of criativos) {
      // Regra de saturação do PDF Seção 40
      const isSaturado = c.frequencia >= 2.8 && (c.ctr < 2.0 || c.cpa > 18.0);

      if (isSaturado) {
        const updated = await db.criativo.update({
          where: { id: c.id },
          data: { status_fadiga: 'SATURADO' }
        });
        saturados.push(updated);

        const mensagemAlerta = `O anúncio "${c.nome}" está saturado. O público já visualizou este anúncio muitas vezes (frequência de ${c.frequencia.toFixed(1)}) e o custo por pedido subiu para R$ ${c.cpa.toFixed(2)}. Recomendamos pausar ou substituir por uma nova imagem.`;

        // Registrar alerta preventivo no banco (PDF Seção 40 e 64)
        await db.alerta.create({
          data: {
            empresa_id: empresaId,
            tipo: 'FADIGA_CRIATIVO',
            nivel: 'AVISO',
            titulo: 'Saturação de Anúncio Detectada',
            mensagem: mensagemAlerta
          }
        });

        alertasGerados.push({
          criativoId: c.id,
          nome: c.nome,
          mensagem: mensagemAlerta,
          frequencia: c.frequencia,
          cpa: c.cpa,
          ctr: c.ctr
        });
      } else {
        saudaveis.push(c);
      }
    }

    return {
      totalAnalisados: criativos.length,
      saturados,
      saudaveis,
      alertasGerados
    };
  }

  /**
   * Retorna todos os criativos da empresa com informações do produto vinculado (PDF Seção 35 e 37)
   */
  async getCreativesLibrary(empresaId: string) {
    return db.criativo.findMany({
      where: { empresa_id: empresaId },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            preco: true,
            preco_promocional: true,
            categoria: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }
}
