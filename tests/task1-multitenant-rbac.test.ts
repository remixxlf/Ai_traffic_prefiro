import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  Role, 
  Permission, 
  hasPermission, 
  ROLE_PERMISSIONS 
} from '../src/lib/rbac/permissions';
import { MultiTenantContext } from '../src/lib/multitenant/context';
import { db } from '../src/lib/db';

describe('Task 1: RBAC - Matriz de Permissões (PDF Seção 7)', () => {
  it('Administrador deve possuir todas as permissões de gestão e administração', () => {
    expect(hasPermission(Role.ADMINISTRADOR, Permission.CONNECT_META)).toBe(true);
    expect(hasPermission(Role.ADMINISTRADOR, Permission.MANAGE_USERS)).toBe(true);
    expect(hasPermission(Role.ADMINISTRADOR, Permission.MANAGE_CAMPAIGNS)).toBe(true);
    expect(hasPermission(Role.ADMINISTRADOR, Permission.APPROVE_RECOMMENDATIONS)).toBe(true);
    expect(hasPermission(Role.ADMINISTRADOR, Permission.CHANGE_BUDGET)).toBe(true);
    expect(hasPermission(Role.ADMINISTRADOR, Permission.CONFIGURE_AUTOMATIONS)).toBe(true);
    expect(hasPermission(Role.ADMINISTRADOR, Permission.VIEW_REPORTS)).toBe(true);
    expect(hasPermission(Role.ADMINISTRADOR, Permission.MANAGE_INTEGRATIONS)).toBe(true);
  });

  it('Gestor deve administrar campanhas e anúncios, mas não gerenciar integrações ou usuários', () => {
    expect(hasPermission(Role.GESTOR, Permission.MANAGE_CAMPAIGNS)).toBe(true);
    expect(hasPermission(Role.GESTOR, Permission.VIEW_REPORTS)).toBe(true);
    expect(hasPermission(Role.GESTOR, Permission.CHANGE_BUDGET)).toBe(true);
    
    // Proibições para Gestor
    expect(hasPermission(Role.GESTOR, Permission.MANAGE_USERS)).toBe(false);
    expect(hasPermission(Role.GESTOR, Permission.MANAGE_INTEGRATIONS)).toBe(false);
    expect(hasPermission(Role.GESTOR, Permission.CONNECT_META)).toBe(false);
  });

  it('Analista deve visualizar resultados e gerar análises, sem alterar orçamentos ou campanhas', () => {
    expect(hasPermission(Role.ANALISTA, Permission.VIEW_REPORTS)).toBe(true);
    expect(hasPermission(Role.ANALISTA, Permission.GENERATE_ANALYSES)).toBe(true);
    
    // Proibições para Analista
    expect(hasPermission(Role.ANALISTA, Permission.MANAGE_CAMPAIGNS)).toBe(false);
    expect(hasPermission(Role.ANALISTA, Permission.CHANGE_BUDGET)).toBe(false);
    expect(hasPermission(Role.ANALISTA, Permission.APPROVE_RECOMMENDATIONS)).toBe(false);
  });

  it('Cliente deve visualizar indicadores e aprovar ações, sem alterar configurações avançadas', () => {
    expect(hasPermission(Role.CLIENTE, Permission.VIEW_REPORTS)).toBe(true);
    expect(hasPermission(Role.CLIENTE, Permission.APPROVE_RECOMMENDATIONS)).toBe(true);
    
    // Proibições para Cliente
    expect(hasPermission(Role.CLIENTE, Permission.MANAGE_INTEGRATIONS)).toBe(false);
    expect(hasPermission(Role.CLIENTE, Permission.CONFIGURE_AUTOMATIONS)).toBe(false);
    expect(hasPermission(Role.CLIENTE, Permission.MANAGE_USERS)).toBe(false);
  });

  it('Somente Leitura deve apenas visualizar informações', () => {
    expect(hasPermission(Role.SOMENTE_LEITURA, Permission.VIEW_REPORTS)).toBe(true);
    
    expect(hasPermission(Role.SOMENTE_LEITURA, Permission.APPROVE_RECOMMENDATIONS)).toBe(false);
    expect(hasPermission(Role.SOMENTE_LEITURA, Permission.MANAGE_CAMPAIGNS)).toBe(false);
    expect(hasPermission(Role.SOMENTE_LEITURA, Permission.CHANGE_BUDGET)).toBe(false);
    expect(hasPermission(Role.SOMENTE_LEITURA, Permission.MANAGE_INTEGRATIONS)).toBe(false);
  });
});

describe('Task 1: Multi-tenant Context & Isolamento (PDF Seção 6)', () => {
  it('deve isolar o escopo de execução por empresa_id', () => {
    const tenantA = new MultiTenantContext('empresa-pizzaria-1', 'user-1', Role.GESTOR);
    const tenantB = new MultiTenantContext('empresa-hamburgueria-2', 'user-2', Role.ADMINISTRADOR);

    expect(tenantA.getEmpresaId()).toBe('empresa-pizzaria-1');
    expect(tenantB.getEmpresaId()).toBe('empresa-hamburgueria-2');
    expect(tenantA.isSameTenant(tenantB.getEmpresaId())).toBe(false);
  });

  it('deve rejeitar contexto com empresa_id vazio ou inválido', () => {
    expect(() => new MultiTenantContext('', 'user-1', Role.GESTOR)).toThrowError(
      'Contexto multi-tenant inválido: empresa_id é obrigatório.'
    );
  });
});

describe('Task 1: Persistência Prisma & Isolamento Multi-tenant no Banco (PDF Seção 6 e 72)', () => {
  let empresa1Id: string;
  let empresa2Id: string;

  beforeAll(async () => {
    // Criação de duas empresas isoladas
    const emp1 = await db.empresa.create({
      data: {
        nome: 'Pizzaria Bella Napoli',
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        ticket_medio: 78.0,
      }
    });
    empresa1Id = emp1.id;

    const emp2 = await db.empresa.create({
      data: {
        nome: 'Burger Rock',
        segmento: 'Hamburgueria',
        cidade: 'Salvador',
        ticket_medio: 55.0,
      }
    });
    empresa2Id = emp2.id;

    // Criação de campanhas associadas a cada tenant
    await db.campanha.create({
      data: {
        empresa_id: empresa1Id,
        nome: 'Campanha Pizza Família',
        orcamento_diario: 100.0,
      }
    });

    await db.campanha.create({
      data: {
        empresa_id: empresa2Id,
        nome: 'Campanha Combo Smash',
        orcamento_diario: 80.0,
      }
    });
  });

  afterAll(async () => {
    await db.campanha.deleteMany({ where: { empresa_id: { in: [empresa1Id, empresa2Id] } } });
    await db.empresa.deleteMany({ where: { id: { in: [empresa1Id, empresa2Id] } } });
  });

  it('deve retornar apenas as campanhas do tenant consultado via context.scopedWhere', async () => {
    const tenant1 = new MultiTenantContext(empresa1Id, 'u1', Role.ADMINISTRADOR);
    const tenant2 = new MultiTenantContext(empresa2Id, 'u2', Role.ADMINISTRADOR);

    const campanhasTenant1 = await db.campanha.findMany({
      where: tenant1.scopedWhere({})
    });

    const campanhasTenant2 = await db.campanha.findMany({
      where: tenant2.scopedWhere({})
    });

    expect(campanhasTenant1.length).toBe(1);
    expect(campanhasTenant1[0].nome).toBe('Campanha Pizza Família');

    expect(campanhasTenant2.length).toBe(1);
    expect(campanhasTenant2[0].nome).toBe('Campanha Combo Smash');
  });
});
