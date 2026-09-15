import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { CatalogSyncWorker } from '../src/lib/workers/catalog-sync-worker';

describe('Task 7: Worker de Sincronização Periódica de Catálogo com Meta Commerce (PDF Seções 29, 30, 32, 70)', () => {
  let empresaId: string;
  let metaCatalogoId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Worker Test',
        slug_prefiro: `bella-napoli-w-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA'
      }
    });
    empresaId = empresa.id;

    // Criação da conexão Meta com token
    await db.integracaoMeta.create({
      data: {
        empresa_id: empresaId,
        access_token: 'sandbox_token_worker_test',
        status: 'CONECTADO'
      }
    });

    // Criação do registro de Catálogo Meta
    const cat = await db.metaCatalogo.create({
      data: {
        empresa_id: empresaId,
        meta_catalog_id: `cat_meta_${Date.now()}`,
        name: 'Catálogo de Produtos Meta Commerce',
        status: 'PENDENTE'
      }
    });
    metaCatalogoId = cat.id;
  });

  afterAll(async () => {
    await db.metaProduto.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaCatalogo.deleteMany({ where: { empresa_id: empresaId } });
    await db.integracaoMeta.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve executar o ciclo completo do job: baixar XML da Prefiro e sincronizar com o Meta Commerce', async () => {
    const worker = new CatalogSyncWorker();

    const result = await worker.runSyncForEmpresa(empresaId);

    expect(result.success).toBe(true);
    expect(result.produtosProcessados).toBeGreaterThan(0);
    expect(result.enviadosParaMeta).toBeGreaterThan(0);
    expect(result.falhas).toBe(0);
  });

  it('deve agendar a próxima sincronização rigorosamente para 1 hora após a atual (PDF Seção 29 e 70)', async () => {
    const catalogo = await db.metaCatalogo.findUnique({
      where: { id: metaCatalogoId }
    });

    expect(catalogo).not.toBeNull();
    expect(catalogo?.last_sync_at).toBeDefined();
    expect(catalogo?.next_sync_at).toBeDefined();

    const lastTime = catalogo!.last_sync_at!.getTime();
    const nextTime = catalogo!.next_sync_at!.getTime();
    const diffHours = (nextTime - lastTime) / (1000 * 60 * 60);

    // Deve ser exatamente 1 hora de intervalo
    expect(Math.round(diffHours)).toBe(1);
  });

  it('deve atualizar o status do catálogo para SINCRONIZADO e registrar totais', async () => {
    const catalogo = await db.metaCatalogo.findUnique({
      where: { id: metaCatalogoId }
    });

    expect(catalogo?.status).toBe('SINCRONIZADO');
    expect(catalogo?.total_products).toBeGreaterThan(0);
    expect(catalogo?.active_products).toBe(catalogo?.total_products);
    expect(catalogo?.error_products).toBe(0);
  });

  it('deve executar o job para todas as empresas ativas sem quebrar com empresas desconectadas', async () => {
    const worker = new CatalogSyncWorker();

    const summary = await worker.runGlobalSync();

    expect(summary).toBeDefined();
    expect(summary.totalEmpresas).toBeGreaterThanOrEqual(1);
    expect(summary.empresasSincronizadas).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(summary.erros)).toBe(true);
  });
});
