/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Automação de Públicos Semelhantes (Lookalikes) e Geográficos
 * (PDF Seções 21, 22, 23, 26, 89)
 */

import { db } from '../db';
import { getMetaAdsService } from '../adapters';

export interface LookalikeEligibility {
  elegivel: boolean;
  mensagem: string;
  seedAudienceId?: string;
  tamanhoBase?: number;
}

export class LookalikeAndGeoAudienceService {
  /**
   * Avalia se a empresa possui base de clientes com volume e qualidade suficientes (PDF Seção 26)
   */
  async checkLookalikeEligibility(empresaId: string): Promise<LookalikeEligibility> {
    const seedAudience = await db.publico.findFirst({
      where: {
        empresa_id: empresaId,
        tipo: 'CUSTOM_CLIENTES'
      },
      orderBy: { tamanho_estimado: 'desc' }
    });

    if (!seedAudience || !seedAudience.meta_audience_id) {
      return {
        elegivel: false,
        mensagem: 'É necessário conectar e sincronizar seus clientes da Prefiro Delivery antes de criar públicos semelhantes.'
      };
    }

    const tamanho = seedAudience.tamanho_estimado || 0;
    if (tamanho < 50) {
      return {
        elegivel: false,
        mensagem: `Sua base possui ${tamanho} clientes. Recomendamos pelo menos 50 clientes para gerar um público semelhante de alta fidelidade.`,
        tamanhoBase: tamanho
      };
    }

    return {
      elegivel: true,
      mensagem: 'Encontramos uma base de clientes que pode ser utilizada para encontrar pessoas semelhantes.',
      seedAudienceId: seedAudience.meta_audience_id,
      tamanhoBase: tamanho
    };
  }

  /**
   * Cria Público Semelhante (Lookalike) com nomenclatura amigável (PDF Seção 23, 26 e 89)
   */
  async createLookalikeAudience(
    empresaId: string,
    options: { ratio?: number; country?: string } = {}
  ) {
    const eligibility = await this.checkLookalikeEligibility(empresaId);
    if (!eligibility.elegivel || !eligibility.seedAudienceId) {
      throw new Error(eligibility.mensagem);
    }

    const empresa = await db.empresa.findUnique({ where: { id: empresaId } });
    const integracao = await db.integracaoMeta.findFirst({
      where: { empresa_id: empresaId, status: 'CONECTADO' }
    });
    const adAccount = await db.metaAdAccount.findFirst({
      where: { empresa_id: empresaId }
    });

    if (!integracao || !adAccount) {
      throw new Error('Conta de anúncios ou integração Meta não disponível.');
    }

    const ratio = options.ratio || 0.01; // 1% mais semelhante (padrão recomendado)
    const ratioPercent = Math.round(ratio * 100);
    const cidade = empresa?.cidade ? ` — ${empresa.cidade}` : '';
    const nomeAmigavel = `Pessoas semelhantes aos meus clientes (${ratioPercent}%)${cidade}`;

    const metaService = getMetaAdsService();
    const metaLookalike = await metaService.createLookalikeAudience(
      integracao.access_token,
      adAccount.meta_account_id,
      {
        name: nomeAmigavel,
        origin_audience_id: eligibility.seedAudienceId,
        country: options.country || 'BR',
        ratio
      }
    );

    const publico = await db.publico.create({
      data: {
        empresa_id: empresaId,
        meta_audience_id: metaLookalike.id,
        nome: nomeAmigavel,
        tipo: 'LOOKALIKE',
        origem: 'Clientes Prefiro Delivery',
        descricao: `Público semelhante de ${ratioPercent}% com base nos melhores compradores do delivery`,
        tamanho_estimado: Math.round(1500000 * ratio), // Estimativa de base no Brasil
        cidade: empresa?.cidade || undefined
      }
    });

    return {
      success: true,
      publico
    };
  }

  /**
   * Cria Público Geográfico com o raio de atendimento e faixa etária recomendada pela IA (PDF Seção 21 e 22)
   */
  async createGeographicAudience(empresaId: string) {
    const empresa = await db.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) {
      throw new Error(`Empresa ${empresaId} não encontrada.`);
    }

    const cidade = empresa.cidade || 'Sua Região';
    const raio = empresa.raio_atendimento || 6.0;
    const nomeAmigavel = `Público local — ${cidade} (Raio ${raio}km)`;

    const publico = await db.publico.create({
      data: {
        empresa_id: empresaId,
        meta_audience_id: `geo_${empresaId}_${Date.now()}`,
        nome: nomeAmigavel,
        tipo: 'GEOGRAFICO',
        origem: 'Geográfico Local (Raio Delivery)',
        descricao: `Pessoas localizadas a até ${raio}km em ${cidade}, idade de 18 a 55 anos.`,
        cidade,
        raio_km: raio,
        idade_min: 18,
        idade_max: 55, // Seção 22: Idade 18–55 anos
        tamanho_estimado: Math.round(raio * 15000) // Estimativa aproximada por densidade urbana
      }
    });

    return {
      success: true,
      publico
    };
  }

  /**
   * Retorna a biblioteca de públicos completa da empresa (PDF Seção 23)
   */
  async getAudienceLibrary(empresaId: string) {
    return db.publico.findMany({
      where: { empresa_id: empresaId },
      orderBy: { created_at: 'desc' }
    });
  }
}
