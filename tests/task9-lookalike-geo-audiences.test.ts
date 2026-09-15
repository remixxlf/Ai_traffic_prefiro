import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { LookalikeAndGeoAudienceService } from '../src/lib/services/lookalike-geo-service';

describe('Task 9: Automação de Públicos Semelhantes (Lookalikes) e Geográficos (PDF Seções 21, 22, 23, 26, 89)', () => {
  let empresaId: string;
  let customAudienceId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Lookalike Test',
        slug_prefiro: `bella-napoli-look-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        raio_atendimento: 8.0,
        ticket_medio: 78.0
      }
    });
    empresaId = empresa.id;

    await db.integracaoMeta.create({
      data: {
        empresa_id: empresaId,
        access_token: 'sandbox_token_lookalike_test',
        status: 'CONECTADO'
      }
    });

    await db.metaAdAccount.create({
      data: {
        empresa_id: empresaId,
        meta_account_id: 'act_sandbox_look_123',
        name: 'Conta Anuncios Lookalike',
        currency: 'BRL'
      }
    });

    // Simular existência prévia do público "Meus clientes" (Custom Audience de origem)
    const seedAudience = await db.publico.create({
      data: {
        empresa_id: empresaId,
        meta_audience_id: 'aud_seed_custom_101',
        nome: 'Meus clientes',
        tipo: 'CUSTOM_CLIENTES',
        origem: 'Clientes Prefiro Delivery',
        tamanho_estimado: 250
      }
    });
    customAudienceId = seedAudience.id;
  });

  afterAll(async () => {
    await db.publico.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaAdAccount.deleteMany({ where: { empresa_id: empresaId } });
    await db.integracaoMeta.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve avaliar elegibilidade e sugerir criação de Lookalike quando houver base de clientes (PDF Seção 26)', async () => {
    const service = new LookalikeAndGeoAudienceService();

    const oportunidade = await service.checkLookalikeEligibility(empresaId);

    expect(oportunidade.elegivel).toBe(true);
    expect(oportunidade.mensagem).toContain('Encontramos uma base de clientes que pode ser utilizada para encontrar pessoas semelhantes');
    expect(oportunidade.seedAudienceId).toBe('aud_seed_custom_101');
  });

  it('deve criar Lookalike com proporção 1% e nomenclatura simplificada (PDF Seção 23 e 89)', async () => {
    const service = new LookalikeAndGeoAudienceService();

    const result = await service.createLookalikeAudience(empresaId, {
      ratio: 0.01 // 1%
    });

    expect(result.success).toBe(true);
    expect(result.publico.nome).toContain('Pessoas semelhantes aos meus clientes');
    expect(result.publico.tipo).toBe('LOOKALIKE');
    expect(result.publico.origem).toBe('Clientes Prefiro Delivery');
    expect(result.publico.tamanho_estimado).toBeGreaterThanOrEqual(10000);

    // Verificar se foi persistido no banco
    const salvo = await db.publico.findUnique({ where: { id: result.publico.id } });
    expect(salvo).not.toBeNull();
    expect(salvo?.tipo).toBe('LOOKALIKE');
  });

  it('deve criar Público Geográfico configurado com o raio e faixa etária da pizzaria (PDF Seção 21 e 22)', async () => {
    const service = new LookalikeAndGeoAudienceService();

    const result = await service.createGeographicAudience(empresaId);

    expect(result.success).toBe(true);
    expect(result.publico.tipo).toBe('GEOGRAFICO');
    expect(result.publico.cidade).toBe('Feira de Santana');
    expect(result.publico.raio_km).toBe(8.0);
    expect(result.publico.idade_min).toBe(18);
    expect(result.publico.idade_max).toBe(55); // Seção 22: Idade 18–55 anos
    expect(result.publico.nome).toContain('Público local');
  });

  it('deve listar os públicos com dados consolidados para a Biblioteca de Públicos (PDF Seção 23)', async () => {
    const service = new LookalikeAndGeoAudienceService();

    const biblioteca = await service.getAudienceLibrary(empresaId);

    expect(biblioteca.length).toBeGreaterThanOrEqual(3); // Custom + Lookalike + Geográfico
    const lookalike = biblioteca.find(p => p.tipo === 'LOOKALIKE');
    expect(lookalike).toBeDefined();
    expect(lookalike?.origem).toBe('Clientes Prefiro Delivery');
  });
});
