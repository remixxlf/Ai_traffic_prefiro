/**
 * Plataforma de Gestão de Tráfego com IA
 * Módulo de RBAC - Perfis e Permissões (PDF Seção 7)
 */

export enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GESTOR = 'GESTOR',
  ANALISTA = 'ANALISTA',
  CLIENTE = 'CLIENTE',
  SOMENTE_LEITURA = 'SOMENTE_LEITURA'
}

export enum Permission {
  // Conexões e Sistema
  CONNECT_META = 'CONNECT_META',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  MANAGE_USERS = 'MANAGE_USERS',
  
  // Campanhas e Anúncios
  MANAGE_CAMPAIGNS = 'MANAGE_CAMPAIGNS',
  CHANGE_BUDGET = 'CHANGE_BUDGET',
  
  // Automações e Recomendações
  APPROVE_RECOMMENDATIONS = 'APPROVE_RECOMMENDATIONS',
  CONFIGURE_AUTOMATIONS = 'CONFIGURE_AUTOMATIONS',
  
  // Visualização e Análises
  VIEW_REPORTS = 'VIEW_REPORTS',
  GENERATE_ANALYSES = 'GENERATE_ANALYSES'
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMINISTRADOR]: [
    Permission.CONNECT_META,
    Permission.MANAGE_INTEGRATIONS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_CAMPAIGNS,
    Permission.CHANGE_BUDGET,
    Permission.APPROVE_RECOMMENDATIONS,
    Permission.CONFIGURE_AUTOMATIONS,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_ANALYSES
  ],
  [Role.GESTOR]: [
    Permission.MANAGE_CAMPAIGNS,
    Permission.CHANGE_BUDGET,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_ANALYSES
  ],
  [Role.ANALISTA]: [
    Permission.VIEW_REPORTS,
    Permission.GENERATE_ANALYSES
  ],
  [Role.CLIENTE]: [
    Permission.VIEW_REPORTS,
    Permission.APPROVE_RECOMMENDATIONS
  ],
  [Role.SOMENTE_LEITURA]: [
    Permission.VIEW_REPORTS
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}
