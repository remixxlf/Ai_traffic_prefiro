import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { CopywritingService, CopywritingRequest } from '../src/lib/services/copywriting-service';

describe('Task 15: Motor de Copywriting com IA (Groq) & 3 Variações Estratégicas (PDF Seções 36, 37, 88)', () => {
  let empresaId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Forno a Lenha Copy Test',
        slug_prefiro: `bella-napoli-copy-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        ticket_medio: 75.0,
        produto_mais_vendido: 'Pizza Calabresa Especial com Borda Recheada',
        horario_forte_inicio: '18:30',
        horario_forte_fim: '23:00',
        dias_fortes: 'quinta, sexta, sábado, domingo'
      }
    });
    empresaId = empresa.id;
  });

  afterAll(async () => {
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve gerar 3 variações estratégicas completas: Produto, Benefício e Urgência (PDF Seção 37)', async () => {
    const service = new CopywritingService();

    const request: CopywritingRequest = {
      empresaId,
      produtoNome: 'Pizza Calabresa Especial com Borda Recheada',
      preco: 69.90,
      precoPromocional: 59.90
    };

    const resultado = await service.generateStrategicCopies(request);

    expect(resultado.empresa).toBe('Pizzaria Forno a Lenha Copy Test');
    expect(resultado.variacoes).toBeDefined();

    // 1. Foco no Produto (sabor, apresentação, ingredientes)
    expect(resultado.variacoes.focoProduto).toBeDefined();
    expect(resultado.variacoes.focoProduto.estrategia).toBe('FOCO_PRODUTO');
    expect(resultado.variacoes.focoProduto.textoPrincipal.length).toBeGreaterThan(20);
    expect(resultado.variacoes.focoProduto.titulo.length).toBeGreaterThan(5);

    // 2. Foco no Benefício / Comodidade (praticidade, quentinho em casa)
    expect(resultado.variacoes.focoBeneficio).toBeDefined();
    expect(resultado.variacoes.focoBeneficio.estrategia).toBe('FOCO_BENEFICIO');
    expect(resultado.variacoes.focoBeneficio.textoPrincipal.length).toBeGreaterThan(20);

    // 3. Foco na Urgência / Promoção (tempo limitado, hoje à noite)
    expect(resultado.variacoes.focoUrgencia).toBeDefined();
    expect(resultado.variacoes.focoUrgencia.estrategia).toBe('FOCO_URGENCIA');
    expect(resultado.variacoes.focoUrgencia.textoPrincipal.length).toBeGreaterThan(20);
  });

  it('deve validar os 4 elementos estruturais do anúncio da Seção 36 em cada variação', async () => {
    const service = new CopywritingService();

    const resultado = await service.generateStrategicCopies({
      empresaId,
      produtoNome: 'Hambúrguer Artesanal Duplo Bacon',
      preco: 42.00
    });

    const todas = [
      resultado.variacoes.focoProduto,
      resultado.variacoes.focoBeneficio,
      resultado.variacoes.focoUrgencia
    ];

    for (const v of todas) {
      // 1. Texto principal
      expect(v.textoPrincipal).toBeDefined();
      expect(typeof v.textoPrincipal).toBe('string');

      // 2. Título (Headline)
      expect(v.titulo).toBeDefined();
      expect(v.titulo.length).toBeLessThanOrEqual(60);

      // 3. Descrição
      expect(v.descricao).toBeDefined();
      expect(typeof v.descricao).toBe('string');

      // 4. Chamada para Ação (CTA)
      expect(v.cta).toBeDefined();
      expect(['Peça Agora', 'Pedir Agora', 'Comprar Agora', 'ORDER_NOW']).toContain(v.cta);

      // Explicação de negócio (Seção 88)
      expect(v.porQueFunciona).toBeDefined();
    }
  });

  it('deve injetar a Memória do Negócio automaticamente no contexto da copy (Seção 36 e 88)', async () => {
    const service = new CopywritingService();

    // Sem especificar produto, deve usar o produto principal da Memória do Negócio
    const resultado = await service.generateStrategicCopies({
      empresaId
    });

    expect(resultado.variacoes.focoProduto.textoPrincipal).toContain('Calabresa');
  });

  it('deve operar com resiliência e fallback caso o Groq SDK esteja em mock ou sem chave', async () => {
    const service = new CopywritingService();

    const resultado = await service.generateStrategicCopies({
      empresaId,
      produtoNome: 'Combo Família',
      preco: 89.90
    });

    expect(resultado.variacoes.focoUrgencia.textoPrincipal).toBeDefined();
    expect(resultado.variacoes.focoBeneficio.titulo).toBeDefined();
  });
});
