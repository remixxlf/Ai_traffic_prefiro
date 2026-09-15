/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Memória do Negócio (PDF Seção 46)
 *
 * Gera contexto estruturado da empresa para injeção automática
 * nos prompts do motor de IA. Permite que a IA "conheça" o negócio
 * sem que o empresário precise repetir informações a cada interação.
 */

import { db } from '../db';

export interface BusinessContext {
  empresa: string;
  segmento: string;
  cidade: string;
  estado: string;
  raio_atendimento: number | null;
  ticket_medio: number | null;
  publico_alvo: string | null;
  horario_pico: string | null;
  dias_fortes: string | null;
  produto_principal: string | null;
  produtos_chave: string[];
  orcamento_max_diario: number | null;
  modo_operacao: string;
}

export class BusinessMemoryService {
  /**
   * Retorna o contexto estruturado do negócio pronto para uso em prompts de IA.
   */
  async getBusinessContext(empresaId: string): Promise<BusinessContext> {
    const empresa = await db.empresa.findUnique({ where: { id: empresaId } });

    if (!empresa) {
      throw new Error(`Empresa não encontrada: ${empresaId}`);
    }

    let produtosChave: string[] = [];
    if (empresa.produtos_chave) {
      try {
        produtosChave = JSON.parse(empresa.produtos_chave);
      } catch {
        produtosChave = [empresa.produtos_chave];
      }
    }

    const horarioPico =
      empresa.horario_forte_inicio && empresa.horario_forte_fim
        ? `${empresa.horario_forte_inicio} - ${empresa.horario_forte_fim}`
        : null;

    return {
      empresa: empresa.nome,
      segmento: empresa.segmento || 'Restaurante/Delivery',
      cidade: empresa.cidade || 'Não informada',
      estado: empresa.estado || '',
      raio_atendimento: empresa.raio_atendimento,
      ticket_medio: empresa.ticket_medio,
      publico_alvo: empresa.publico_alvo,
      horario_pico: horarioPico,
      dias_fortes: empresa.dias_fortes,
      produto_principal: empresa.produto_mais_vendido,
      produtos_chave: produtosChave,
      orcamento_max_diario: empresa.orcamento_max_diario,
      modo_operacao: empresa.modo_operacao,
    };
  }

  /**
   * Formata o contexto como texto para injeção direta no system prompt da IA.
   * A IA recebe isso em toda interação para "lembrar" do negócio.
   */
  async getBusinessContextAsPrompt(empresaId: string): Promise<string> {
    const ctx = await this.getBusinessContext(empresaId);

    const lines = [
      `=== MEMÓRIA DO NEGÓCIO ===`,
      `Nome da Empresa: ${ctx.empresa}`,
      `Segmento: ${ctx.segmento}`,
      `Localização: ${ctx.cidade}${ctx.estado ? `, ${ctx.estado}` : ''}`,
    ];

    if (ctx.raio_atendimento) {
      lines.push(`Raio de Atendimento: ${ctx.raio_atendimento} km`);
    }
    if (ctx.ticket_medio) {
      lines.push(`Ticket Médio: R$ ${ctx.ticket_medio.toFixed(2)}`);
    }
    if (ctx.publico_alvo) {
      lines.push(`Público-Alvo: ${ctx.publico_alvo}`);
    }
    if (ctx.horario_pico) {
      lines.push(`Horário de Pico: ${ctx.horario_pico}`);
    }
    if (ctx.dias_fortes) {
      lines.push(`Dias Mais Fortes: ${ctx.dias_fortes}`);
    }
    if (ctx.produto_principal) {
      lines.push(`Produto Mais Vendido: ${ctx.produto_principal}`);
    }
    if (ctx.produtos_chave.length > 0) {
      lines.push(`Produtos-Chave: ${ctx.produtos_chave.join(', ')}`);
    }
    if (ctx.orcamento_max_diario) {
      lines.push(`Orçamento Máximo Diário: R$ ${ctx.orcamento_max_diario.toFixed(2)}`);
    }
    lines.push(`Modo de Operação: ${ctx.modo_operacao}`);
    lines.push(`=========================`);

    return lines.join('\n');
  }
}
