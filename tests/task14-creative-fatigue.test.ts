import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { CreativeFatigueService } from '../src/lib/services/creative-fatigue-service';

describe('Task 14: Biblioteca de Criativos & Módulo de Detecção de Fadiga (PDF Seções 35, 37, 39, 40)', () => {
  let empresaId: string;
  let produtoId: string;
  let criativoSaudavelId: string;
  let criativoSaturadoId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Criativos Test',
        slug_prefiro: `bella-napoli-criat-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA'
      }
    });
    empresaId = empresa.id;

    // Criar produto no catálogo
    const prod = await db.metaProduto.create({
      data: {
        empresa_id: empresaId,
        external_id: 'prod_pizza_4queijos',
        nome: 'Pizza Quatro Queijos',
        preco: 69.90,
        disponibilidade: true,
        status: 'ATIVO'
      }
    });
    produtoId = prod.id;
  });

  afterAll(async () => {
    await db.alerta.deleteMany({ where: { empresa_id: empresaId } });
    await db.criativo.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaProduto.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve cadastrar criativo vinculado a produto do catálogo com tags e formato (PDF Seções 35 e 37)', async () => {
    const service = new CreativeFatigueService();

    const criativo = await service.createCreative(empresaId, {
      nome: 'Foto Pizza Quatro Queijos Fumegante',
      tipo_midia: 'IMAGE',
      formato: '1:1',
      url_midia: 'https://images.unsplash.com/photo-pizza-4q.jpg',
      produto_id: produtoId,
      categoria: 'Pizzas Salgadas',
      tags: ['queijo', 'artesanal', 'promocao']
    });

    criativoSaudavelId = criativo.id;

    expect(criativo.id).toBeDefined();
    expect(criativo.nome).toBe('Foto Pizza Quatro Queijos Fumegante');
    expect(criativo.formato).toBe('1:1');
    expect(criativo.produto_id).toBe(produtoId);
    expect(criativo.status_fadiga).toBe('SAUDAVEL');
  });

  it('deve registrar métricas de desempenho para o criativo (PDF Seção 39)', async () => {
    const service = new CreativeFatigueService();

    const criativoComMetricas = await service.updateCreativeMetrics(criativoSaudavelId, {
      impressoes: 15000,
      cliques: 600,
      frequencia: 1.3,
      conversoes: 30,
      investimento: 300.0,
      receita: 2100.0
    });

    expect(criativoComMetricas.ctr).toBe(4.0); // 600 / 15000 = 4%
    expect(criativoComMetricas.cpa).toBe(10.0); // 300 / 30 = R$ 10
    expect(criativoComMetricas.roas).toBe(7.0); // 2100 / 300 = 7x
    expect(criativoComMetricas.status_fadiga).toBe('SAUDAVEL');
  });

  it('deve detectar fadiga de criativo por frequência alta, queda de CTR e alta de CPA (PDF Seção 40)', async () => {
    const service = new CreativeFatigueService();

    // Criar um segundo criativo que sofrerá fadiga
    const criativo = await service.createCreative(empresaId, {
      nome: 'Banner Promocional Pizza Antiga',
      tipo_midia: 'IMAGE',
      formato: '4:5',
      url_midia: 'https://images.unsplash.com/photo-banner-antigo.jpg',
      categoria: 'Promocional'
    });
    criativoSaturadoId = criativo.id;

    // Simula métricas que indicam fadiga: Frequência 3.6, CTR caiu para 1.1%, CPA subiu para R$ 24
    await service.updateCreativeMetrics(criativoSaturadoId, {
      impressoes: 45000,
      cliques: 495, // CTR = 1.1%
      frequencia: 3.6, // Frequência muito alta (> 2.8)
      conversoes: 15,
      investimento: 360.0, // CPA = 360 / 15 = R$ 24 (aumento expressivo)
      receita: 1050.0
    });

    const resultadoDiagnostico = await service.analyzeFatigue(empresaId);

    expect(resultadoDiagnostico.saturados.length).toBeGreaterThanOrEqual(1);

    const criativoSaturado = resultadoDiagnostico.saturados.find(c => c.id === criativoSaturadoId);
    expect(criativoSaturado).toBeDefined();
    expect(criativoSaturado?.status_fadiga).toBe('SATURADO');

    // Mensagem de alerta exigida na Seção 40 do PDF
    expect(resultadoDiagnostico.alertasGerados.length).toBeGreaterThan(0);
    const alerta = resultadoDiagnostico.alertasGerados.find(a => a.criativoId === criativoSaturadoId);
    expect(alerta?.mensagem).toContain('está saturado');
    expect(alerta?.mensagem).toContain('Recomendamos pausar ou substituir por uma nova imagem');

    // Alerta deve ter sido persistido na tabela Alerta do banco
    const alertaNoBanco = await db.alerta.findFirst({
      where: { empresa_id: empresaId, tipo: 'FADIGA_CRIATIVO' }
    });
    expect(alertaNoBanco).not.toBeNull();
  });

  it('deve listar criativos com informações de produto vinculado e status visual (PDF Seções 35 e 37)', async () => {
    const service = new CreativeFatigueService();
    const biblioteca = await service.getCreativesLibrary(empresaId);

    expect(biblioteca.length).toBe(2);

    const comProduto = biblioteca.find(c => c.id === criativoSaudavelId);
    expect(comProduto?.produto).toBeDefined();
    expect(comProduto?.produto?.nome).toBe('Pizza Quatro Queijos');
    expect(comProduto?.produto?.preco).toBe(69.90);
  });
});
