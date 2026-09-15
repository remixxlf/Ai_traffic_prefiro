/**
 * Plataforma de Gestão de Tráfego com IA
 * Worker de Sincronização Periódica de Catálogo com Meta Commerce
 * (PDF Seções 29, 30, 32, 70)
 *
 * Executa periodicamente (job de hora em hora) para:
 *   1. Consultar a rota da Prefiro Delivery e atualizar banco interno
 *   2. Enviar lote de produtos atualizados para a API do Catálogo da Meta
 *   3. Atualizar carimbos de tempo de última sincronização e próxima (+1h)
 */

import { db } from '../db';
import { CatalogIngestionService } from '../services/catalog-ingestion-service';
import { getMetaAdsService } from '../adapters';

export interface SyncExecutionResult {
  success: boolean;
  empresaId: string;
  produtosProcessados: number;
  enviadosParaMeta: number;
  falhas: number;
  erro?: string;
}

export interface GlobalSyncSummary {
  totalEmpresas: number;
  empresasSincronizadas: number;
  erros: Array<{ empresaId: string; erro: string }>;
}

export class CatalogSyncWorker {
  private ingestionService: CatalogIngestionService;

  constructor() {
    this.ingestionService = new CatalogIngestionService();
  }

  /**
   * Executa a sincronização para uma empresa específica
   */
  async runSyncForEmpresa(empresaId: string): Promise<SyncExecutionResult> {
    try {
      const now = new Date();
      const nextSyncAt = new Date(now.getTime() + 60 * 60 * 1000); // Exatamente +1 hora (Seção 29)

      // 0. Validar existência da empresa
      const empresa = await db.empresa.findUnique({ where: { id: empresaId } });
      if (!empresa) {
        return {
          success: false,
          empresaId,
          produtosProcessados: 0,
          enviadosParaMeta: 0,
          falhas: 1,
          erro: `Empresa ${empresaId} não encontrada.`
        };
      }

      // 1. Ingestão e reconciliação dos produtos do XML da Prefiro
      const ingestion = await this.ingestionService.syncFromPrefiro(empresaId);

      // 2. Buscar produtos ativos atualizados no banco local
      const produtosAtivos = await db.metaProduto.findMany({
        where: { empresa_id: empresaId, status: 'ATIVO' }
      });

      // 3. Buscar ou vincular Catálogo Meta da empresa
      let catalogo = await db.metaCatalogo.findFirst({
        where: { empresa_id: empresaId }
      });

      if (!catalogo) {
        catalogo = await db.metaCatalogo.create({
          data: {
            empresa_id: empresaId,
            meta_catalog_id: `cat_meta_${empresaId}`,
            name: 'Catálogo de Produtos Meta Commerce',
            status: 'SINCRONIZADO'
          }
        });
      }

      // 4. Verificar se a empresa possui integração Meta ativa
      const integracaoMeta = await db.integracaoMeta.findFirst({
        where: { empresa_id: empresaId, status: 'CONECTADO' }
      });

      let enviadosParaMeta = 0;
      let falhas = 0;

      if (integracaoMeta && integracaoMeta.access_token) {
        const metaService = getMetaAdsService();
        const itemsToSync = produtosAtivos.map(p => ({
          id: p.external_id,
          title: p.nome,
          description: p.descricao || undefined,
          price: p.preco,
          sale_price: p.preco_promocional || undefined,
          availability: p.disponibilidade ? 'in stock' : 'out of stock',
          image_url: p.url_imagem || undefined,
          url: p.url_produto || undefined,
          brand: p.marca || 'Prefiro Delivery'
        }));

        const metaSync = await metaService.syncCatalogItems(
          integracaoMeta.access_token,
          catalogo.meta_catalog_id,
          itemsToSync
        );

        enviadosParaMeta = metaSync.items_synced;
        falhas = metaSync.items_failed;
      }

      // 5. Atualizar carimbos e contadores no MetaCatalogo
      await db.metaCatalogo.updateMany({
        where: { id: catalogo.id },
        data: {
          total_products: produtosAtivos.length,
          active_products: produtosAtivos.length,
          error_products: falhas,
          last_sync_at: now,
          next_sync_at: nextSyncAt,
          status: falhas > 0 ? 'ALERTA' : 'SINCRONIZADO'
        }
      });

      return {
        success: true,
        empresaId,
        produtosProcessados: ingestion.total,
        enviadosParaMeta,
        falhas
      };
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`Falha no worker de catálogo para empresa ${empresaId}:`, error);
      }
      return {
        success: false,
        empresaId,
        produtosProcessados: 0,
        enviadosParaMeta: 0,
        falhas: 1,
        erro: error.message || 'Erro desconhecido no worker'
      };
    }
  }

  /**
   * Executa a rotina horária para todas as empresas cadastradas no SaaS (PDF Seção 70)
   */
  async runGlobalSync(): Promise<GlobalSyncSummary> {
    const empresas = await db.empresa.findMany({
      select: { id: true }
    });

    let sincronizadas = 0;
    const erros: Array<{ empresaId: string; erro: string }> = [];

    for (const emp of empresas) {
      const result = await this.runSyncForEmpresa(emp.id);
      if (result.success) {
        sincronizadas++;
      } else {
        erros.push({ empresaId: emp.id, erro: result.erro || 'Falha ao sincronizar' });
      }
    }

    return {
      totalEmpresas: empresas.length,
      empresasSincronizadas: sincronizadas,
      erros
    };
  }
}
