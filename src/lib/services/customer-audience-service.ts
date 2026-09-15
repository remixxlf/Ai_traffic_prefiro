/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Governança de Dados, Hashing LGPD & Custom Audiences
 * (PDF Seções 21, 24, 25, 27, 89, 92)
 */

import crypto from 'crypto';
import { db } from '../db';
import { getMetaAdsService, getPrefiroDeliveryService } from '../adapters';

/**
 * Normaliza e gera o hash SHA-256 de um e-mail conforme especificação da Meta e LGPD
 */
export function normalizeAndHashEmail(email: string): string {
  if (!email) return '';
  const normalized = email.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Normaliza e gera o hash SHA-256 de um telefone celular com DDI brasileiro (+55)
 */
export function normalizeAndHashPhone(phone: string): string {
  if (!phone) return '';
  let digitsOnly = phone.replace(/\D/g, '');
  if (!digitsOnly.startsWith('55') && digitsOnly.length <= 11) {
    digitsOnly = `55${digitsOnly}`;
  }
  return crypto.createHash('sha256').update(digitsOnly, 'utf8').digest('hex');
}

export interface HashedCustomer {
  email_hash: string;
  phone_hash: string;
  ltv: number;
  total_pedidos: number;
}

export interface CustomerSegments {
  todos: HashedCustomer[];
  melhores: HashedCustomer[];
  recorrentes: HashedCustomer[];
  novos: HashedCustomer[];
}

export class CustomerAudienceService {
  /**
   * Converte clientes da Prefiro Delivery em listas segmentadas com hash criptográfico (LGPD)
   * (PDF Seções 25, 27 e 92)
   */
  async segmentPrefiroCustomers(empresaId: string): Promise<CustomerSegments> {
    const empresa = await db.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      throw new Error(`Empresa ${empresaId} não encontrada.`);
    }

    const prefiroService = getPrefiroDeliveryService();
    const rawCustomers = await prefiroService.getCustomers(empresa.slug_prefiro || 'bella-napoli');

    // 1. Anonimização e aplicação de governança LGPD imediata
    const hashedList: HashedCustomer[] = rawCustomers.map(c => ({
      email_hash: normalizeAndHashEmail(c.email),
      phone_hash: normalizeAndHashPhone(c.telefone),
      ltv: c.ltv,
      total_pedidos: c.total_pedidos
    }));

    // 2. Cálculo dos segmentos de negócio (Seção 27)
    const todos = hashedList;
    const melhores = hashedList.filter(c => c.ltv >= 500 || c.total_pedidos >= 5);
    const recorrentes = hashedList.filter(c => c.total_pedidos >= 3);
    const novos = hashedList.filter(c => c.total_pedidos === 1 || c.total_pedidos === 2);

    return {
      todos,
      melhores: melhores.length > 0 ? melhores : todos,
      recorrentes: recorrentes.length > 0 ? recorrentes : todos,
      novos: novos.length > 0 ? novos : todos
    };
  }

  /**
   * Cria os Públicos Personalizados oficiais na Meta e persiste na biblioteca local
   * (PDF Seções 25 e 89: Nomes amigáveis como "Meus clientes")
   */
  async syncCustomersToMetaAudience(empresaId: string): Promise<{
    success: boolean;
    audiencesCreated: string[];
  }> {
    const integracao = await db.integracaoMeta.findFirst({
      where: { empresa_id: empresaId, status: 'CONECTADO' }
    });

    if (!integracao || !integracao.access_token) {
      throw new Error('Empresa sem conexão ativa com a Meta.');
    }

    const adAccount = await db.metaAdAccount.findFirst({
      where: { empresa_id: empresaId }
    });

    if (!adAccount) {
      throw new Error('Nenhuma conta de anúncios encontrada para a empresa.');
    }

    const segments = await this.segmentPrefiroCustomers(empresaId);
    const metaService = getMetaAdsService();
    const token = integracao.access_token;
    const accountId = adAccount.meta_account_id;

    const audiencesCreated: string[] = [];

    // Definição dos públicos a criar na Meta com nomenclaturas amigáveis (PDF Seção 89)
    const audiencesToCreate = [
      {
        nome: 'Meus clientes', // Em vez de "Custom Audience"
        descricao: 'Base geral de compradores do delivery',
        data: segments.todos
      },
      {
        nome: 'Melhores clientes (Alto LTV)',
        descricao: 'Clientes mais fiéis e com maior ticket acumulado',
        data: segments.melhores
      }
    ];

    for (const audDef of audiencesToCreate) {
      // 1. Criar Custom Audience na Meta
      const metaAudience = await metaService.createCustomAudience(token, accountId, {
        name: audDef.nome,
        description: audDef.descricao,
        customer_file_source: 'USER_PROVIDED_ONLY'
      });

      // 2. Fazer upload em lote com hashes SHA-256
      await metaService.uploadHashedUsersToAudience(
        token,
        metaAudience.id,
        audDef.data.map(u => ({ email_hash: u.email_hash, phone_hash: u.phone_hash }))
      );

      // 3. Salvar ou atualizar na Biblioteca de Públicos local (PDF Seção 23)
      const existing = await db.publico.findFirst({
        where: { empresa_id: empresaId, meta_audience_id: metaAudience.id }
      });

      if (existing) {
        await db.publico.update({
          where: { id: existing.id },
          data: {
            nome: audDef.nome,
            tamanho_estimado: audDef.data.length,
            descricao: audDef.descricao
          }
        });
      } else {
        await db.publico.create({
          data: {
            empresa_id: empresaId,
            meta_audience_id: metaAudience.id,
            nome: audDef.nome,
            tipo: 'CUSTOM_CLIENTES',
            origem: 'Clientes Prefiro Delivery',
            descricao: audDef.descricao,
            tamanho_estimado: audDef.data.length
          }
        });
      }

      audiencesCreated.push(audDef.nome);
    }

    return {
      success: true,
      audiencesCreated
    };
  }
}
