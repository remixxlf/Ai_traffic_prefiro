import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { CatalogIngestionService } from '../src/lib/services/catalog-ingestion-service';

describe('Task 6: Ingestão, Parser e Cache do Catálogo XML da Prefiro Delivery (PDF Seções 28, 29, 30, 31)', () => {
  let empresaId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Catálogo Test',
        slug_prefiro: `bella-napoli-cat-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA'
      }
    });
    empresaId = empresa.id;
  });

  afterAll(async () => {
    await db.metaProduto.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaCatalogo.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve fazer o parse de um feed XML válido extraindo todos os 11 campos da Seção 31', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<produtos>
  <produto>
    <id>prod_100</id>
    <nome>Pizza Calabresa Especial</nome>
    <descricao>Calabresa artesanal, cebola roxa e mussarela.</descricao>
    <preco>65.00</preco>
    <preco_promocional>58.00</preco_promocional>
    <disponibilidade>true</disponibilidade>
    <categoria>Pizzas Salgadas</categoria>
    <url>https://prefirodelivery.com/bella-napoli/calabresa</url>
    <imagem>https://images.unsplash.com/calabresa.jpg</imagem>
    <marca>Bella Napoli</marca>
    <estabelecimento>Pizzaria Bella Napoli</estabelecimento>
    <status>ATIVO</status>
  </produto>
</produtos>`;

    const service = new CatalogIngestionService();
    const parsed = service.parseProductsXml(xml);

    expect(parsed.length).toBe(1);
    const item = parsed[0];
    expect(item.id).toBe('prod_100');
    expect(item.nome).toBe('Pizza Calabresa Especial');
    expect(item.preco).toBe(65.00);
    expect(item.preco_promocional).toBe(58.00);
    expect(item.disponibilidade).toBe(true);
    expect(item.categoria).toBe('Pizzas Salgadas');
    expect(item.url).toBe('https://prefirodelivery.com/bella-napoli/calabresa');
    expect(item.imagem).toBe('https://images.unsplash.com/calabresa.jpg');
    expect(item.marca).toBe('Bella Napoli');
    expect(item.estabelecimento).toBe('Pizzaria Bella Napoli');
    expect(item.status).toBe('ATIVO');
  });

  it('deve sincronizar o catálogo com o banco identificando produtos novos (Passo 5 da Seção 30)', async () => {
    const service = new CatalogIngestionService();

    const result = await service.syncFromPrefiro(empresaId);

    expect(result.success).toBe(true);
    expect(result.novos).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);

    const produtosNoBanco = await db.metaProduto.findMany({ where: { empresa_id: empresaId } });
    expect(produtosNoBanco.length).toBe(result.total);
    expect(produtosNoBanco.some(p => p.nome.includes('Pizza'))).toBe(true);
  });

  it('deve identificar produtos alterados e atualizar preços e dados (Passo 6 da Seção 30)', async () => {
    const service = new CatalogIngestionService();

    // Simula XML com preço promocional alterado para um produto existente
    const customXml = `<?xml version="1.0" encoding="UTF-8"?>
<produtos>
  <produto>
    <id>prod_001</id>
    <nome>Pizza Família Especial - Atualizada</nome>
    <descricao>Nova descrição promocional.</descricao>
    <preco>85.00</preco>
    <preco_promocional>62.00</preco_promocional>
    <disponibilidade>true</disponibilidade>
    <categoria>Pizzas</categoria>
    <url>https://prefirodelivery.com/bella-napoli/pizza-familia</url>
    <imagem>https://images.unsplash.com/photo-1513104890138-7c749659a591</imagem>
    <marca>Bella Napoli</marca>
    <status>ATIVO</status>
  </produto>
</produtos>`;

    const result = await service.ingestXmlString(empresaId, customXml);

    expect(result.alterados).toBe(1);

    const produtoAtualizado = await db.metaProduto.findFirst({
      where: { empresa_id: empresaId, external_id: 'prod_001' }
    });

    expect(produtoAtualizado?.nome).toBe('Pizza Família Especial - Atualizada');
    expect(produtoAtualizado?.preco).toBe(85.00);
    expect(produtoAtualizado?.preco_promocional).toBe(62.00);
  });

  it('deve registrar última sincronização e contadores no MetaCatalogo (Passos 8 e 10 da Seção 30)', async () => {
    const catalogo = await db.metaCatalogo.findFirst({ where: { empresa_id: empresaId } });

    expect(catalogo).not.toBeNull();
    expect(catalogo?.last_sync_at).toBeDefined();
    expect(catalogo?.status).toBe('SINCRONIZADO');
    expect(catalogo?.total_products).toBeGreaterThanOrEqual(1);
  });

  it('deve tratar e registrar erros em produtos com dados inválidos (Passo 9 da Seção 30)', async () => {
    const service = new CatalogIngestionService();

    const invalidXml = `<?xml version="1.0" encoding="UTF-8"?>
<produtos>
  <produto>
    <id></id>
    <nome>Produto Sem ID</nome>
  </produto>
  <produto>
    <id>prod_valido_99</id>
    <nome>Pizza Quatro Queijos</nome>
    <preco>70.00</preco>
    <status>ATIVO</status>
  </produto>
</produtos>`;

    const result = await service.ingestXmlString(empresaId, invalidXml);

    expect(result.com_erro).toBe(1);
    expect(result.erros.length).toBeGreaterThan(0);
    expect(result.erros[0]).toContain('ID é obrigatório');
  });
});
