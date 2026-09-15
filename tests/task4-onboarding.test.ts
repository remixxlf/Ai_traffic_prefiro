import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { OnboardingService, OnboardingStepData } from '../src/lib/services/onboarding-service';
import { BusinessMemoryService } from '../src/lib/services/business-memory-service';

describe('Task 4: Onboarding Guiado (PDF Seções 5, 8)', () => {
  let empresaId: string;
  let usuarioId: string;

  beforeAll(async () => {
    const usuario = await db.usuario.create({
      data: { email: 'dono@pizzaria-test.com', nome: 'João Dono', senha_hash: 'hash_test' }
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    if (empresaId) {
      await db.empresaUsuario.deleteMany({ where: { empresa_id: empresaId } });
      await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
    }
    await db.usuario.delete({ where: { id: usuarioId } }).catch(() => {});
  });

  it('Passo 1: deve criar a empresa com dados básicos do negócio', async () => {
    const service = new OnboardingService();

    const step1: OnboardingStepData = {
      step: 1,
      data: {
        nome: 'Pizzaria Bella Napoli',
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA'
      }
    };

    const empresa = await service.processStep(step1, usuarioId);
    empresaId = empresa.id;

    expect(empresa.id).toBeDefined();
    expect(empresa.nome).toBe('Pizzaria Bella Napoli');
    expect(empresa.segmento).toBe('Pizzaria');
    expect(empresa.cidade).toBe('Feira de Santana');
  });

  it('Passo 2: deve atualizar com dados operacionais (raio, ticket, público)', async () => {
    const service = new OnboardingService();

    const step2: OnboardingStepData = {
      step: 2,
      empresaId,
      data: {
        raio_atendimento: 8.0,
        ticket_medio: 78.50,
        publico_alvo: 'Famílias e jovens adultos 18-45 anos',
        descricao: 'Pizzaria artesanal com delivery rápido'
      }
    };

    const empresa = await service.processStep(step2, usuarioId);

    expect(empresa.raio_atendimento).toBe(8.0);
    expect(empresa.ticket_medio).toBe(78.50);
    expect(empresa.publico_alvo).toContain('Famílias');
  });

  it('Passo 3: deve salvar a Memória do Negócio (horários fortes, dias, produtos)', async () => {
    const service = new OnboardingService();

    const step3: OnboardingStepData = {
      step: 3,
      empresaId,
      data: {
        horario_forte_inicio: '19:00',
        horario_forte_fim: '23:00',
        dias_fortes: 'sexta, sabado, domingo',
        produto_mais_vendido: 'Pizza Família Especial',
        produtos_chave: JSON.stringify(['Pizza Família', 'Combo Weekend', 'Pizza Doce'])
      }
    };

    const empresa = await service.processStep(step3, usuarioId);

    expect(empresa.horario_forte_inicio).toBe('19:00');
    expect(empresa.horario_forte_fim).toBe('23:00');
    expect(empresa.dias_fortes).toContain('sexta');
    expect(empresa.produto_mais_vendido).toBe('Pizza Família Especial');
  });

  it('Passo 4: deve vincular slug da Prefiro Delivery e auto-preencher dados', async () => {
    const service = new OnboardingService();

    const uniqueSlug = `bella-napoli-onboarding-${Date.now()}`;
    const step4: OnboardingStepData = {
      step: 4,
      empresaId,
      data: {
        slug_prefiro: uniqueSlug
      }
    };

    const empresa = await service.processStep(step4, usuarioId);
    expect(empresa.slug_prefiro).toBe(uniqueSlug);
  });

  it('deve associar o usuário como ADMINISTRADOR da empresa durante o onboarding', async () => {
    const vinculo = await db.empresaUsuario.findFirst({
      where: { empresa_id: empresaId, usuario_id: usuarioId }
    });

    expect(vinculo).not.toBeNull();
    expect(vinculo!.role).toBe('ADMINISTRADOR');
  });
});

describe('Task 4: Memória do Negócio para Contexto de IA (PDF Seção 46)', () => {
  let empresaId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Burger Rock Test',
        segmento: 'Hamburgueria',
        cidade: 'Salvador',
        estado: 'BA',
        raio_atendimento: 5.0,
        ticket_medio: 55.0,
        publico_alvo: 'Jovens 18-35 anos',
        horario_forte_inicio: '18:00',
        horario_forte_fim: '22:00',
        dias_fortes: 'sexta, sabado',
        produto_mais_vendido: 'Smash Burger Duplo',
        produtos_chave: JSON.stringify(['Smash Burger', 'Combo Duplo', 'Milkshake']),
        orcamento_max_diario: 200.0
      }
    });
    empresaId = empresa.id;
  });

  afterAll(async () => {
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve gerar o contexto de negócio estruturado para injeção nos prompts da IA', async () => {
    const memoryService = new BusinessMemoryService();
    const context = await memoryService.getBusinessContext(empresaId);

    expect(context).toBeDefined();
    expect(context.empresa).toBe('Burger Rock Test');
    expect(context.segmento).toBe('Hamburgueria');
    expect(context.cidade).toBe('Salvador');
    expect(context.ticket_medio).toBe(55.0);
    expect(context.horario_pico).toBe('18:00 - 22:00');
    expect(context.dias_fortes).toContain('sexta');
    expect(context.produto_principal).toBe('Smash Burger Duplo');
    expect(context.orcamento_max_diario).toBe(200.0);
  });

  it('deve formatar o contexto como string para system prompt da IA', async () => {
    const memoryService = new BusinessMemoryService();
    const prompt = await memoryService.getBusinessContextAsPrompt(empresaId);

    expect(prompt).toContain('Burger Rock Test');
    expect(prompt).toContain('Hamburgueria');
    expect(prompt).toContain('Salvador');
    expect(prompt).toContain('18:00');
    expect(prompt).toContain('Smash Burger Duplo');
  });
});
