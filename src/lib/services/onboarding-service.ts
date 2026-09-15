/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Onboarding Guiado (PDF Seções 5, 8)
 *
 * Wizard de 4 passos para configuração inicial da empresa:
 *   Passo 1: Dados básicos (nome, segmento, cidade, estado)
 *   Passo 2: Dados operacionais (raio, ticket médio, público-alvo)
 *   Passo 3: Memória do Negócio (horários fortes, dias, produtos)
 *   Passo 4: Conexão com Prefiro Delivery (slug para auto-preenchimento)
 */

import { db } from '../db';
import { getPrefiroDeliveryService } from '../adapters';

export interface OnboardingStepData {
  step: 1 | 2 | 3 | 4;
  empresaId?: string;
  data: Record<string, any>;
}

export class OnboardingService {
  /**
   * Processa um passo do wizard de onboarding.
   * No passo 1, cria a empresa e vincula o usuário como ADMINISTRADOR.
   * Nos passos subsequentes, atualiza os dados progressivamente.
   */
  async processStep(stepData: OnboardingStepData, usuarioId: string) {
    switch (stepData.step) {
      case 1:
        return this.processStep1(stepData.data, usuarioId);
      case 2:
        return this.processStep2(stepData.empresaId!, stepData.data);
      case 3:
        return this.processStep3(stepData.empresaId!, stepData.data);
      case 4:
        return this.processStep4(stepData.empresaId!, stepData.data);
      default:
        throw new Error(`Passo de onboarding inválido: ${stepData.step}`);
    }
  }

  /**
   * Passo 1: Criação da empresa com dados básicos e vínculo do proprietário.
   */
  private async processStep1(data: Record<string, any>, usuarioId: string) {
    const empresa = await db.empresa.create({
      data: {
        nome: data.nome,
        segmento: data.segmento || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        site: data.site || null,         // URL do restaurante (PDF Seção 8 — Etapa 1)
      }
    });

    // Vincula o usuário criador como ADMINISTRADOR da empresa
    await db.empresaUsuario.create({
      data: {
        empresa_id: empresa.id,
        usuario_id: usuarioId,
        role: 'ADMINISTRADOR'
      }
    });

    return empresa;
  }

  /**
   * Passo 2: Dados operacionais do delivery.
   */
  private async processStep2(empresaId: string, data: Record<string, any>) {
    return db.empresa.update({
      where: { id: empresaId },
      data: {
        raio_atendimento: data.raio_atendimento ?? undefined,
        ticket_medio: data.ticket_medio ?? undefined,
        publico_alvo: data.publico_alvo ?? undefined,
        descricao: data.descricao ?? undefined,
      }
    });
  }

  /**
   * Passo 3: Memória do Negócio — contexto permanente para a IA.
   */
  private async processStep3(empresaId: string, data: Record<string, any>) {
    return db.empresa.update({
      where: { id: empresaId },
      data: {
        horario_forte_inicio: data.horario_forte_inicio ?? undefined,
        horario_forte_fim: data.horario_forte_fim ?? undefined,
        dias_fortes: data.dias_fortes ?? undefined,
        produto_mais_vendido: data.produto_mais_vendido ?? undefined,
        produtos_chave: data.produtos_chave ?? undefined,
      }
    });
  }

  /**
   * Passo 4: Vinculação com Prefiro Delivery e auto-preenchimento.
   */
  private async processStep4(empresaId: string, data: Record<string, any>) {
    const slug = data.slug_prefiro;
    const updateData: Record<string, any> = { slug_prefiro: slug };

    // Tenta auto-preencher dados a partir da Prefiro Delivery
    if (slug) {
      try {
        const prefiroService = getPrefiroDeliveryService();
        const companyInfo = await prefiroService.getCompanyInfo(slug);

        // Só sobrescreve campos que ainda estão vazios
        const empresa = await db.empresa.findUnique({ where: { id: empresaId } });
        if (empresa) {
          if (!empresa.ticket_medio && companyInfo.ticket_medio) {
            updateData.ticket_medio = companyInfo.ticket_medio;
          }
          if (!empresa.produtos_chave && companyInfo.produtos_chave?.length) {
            updateData.produtos_chave = JSON.stringify(companyInfo.produtos_chave);
          }
        }
      } catch (err) {
        // Falha no auto-preenchimento não deve bloquear o onboarding
        console.warn('Auto-preenchimento via Prefiro falhou:', err);
      }
    }

    return db.empresa.update({
      where: { id: empresaId },
      data: updateData
    });
  }
}
