/**
 * Plataforma de Gestão de Tráfego com IA
 * Contexto de Isolamento Multi-tenant (PDF Seção 6)
 */

import { Role } from '../rbac/permissions';

export class MultiTenantContext {
  private readonly empresaId: string;
  private readonly usuarioId: string;
  private readonly role: Role;

  constructor(empresaId: string, usuarioId: string, role: Role) {
    if (!empresaId || empresaId.trim() === '') {
      throw new Error('Contexto multi-tenant inválido: empresa_id é obrigatório.');
    }
    if (!usuarioId || usuarioId.trim() === '') {
      throw new Error('Contexto multi-tenant inválido: usuario_id é obrigatório.');
    }
    this.empresaId = empresaId.trim();
    this.usuarioId = usuarioId.trim();
    this.role = role;
  }

  public getEmpresaId(): string {
    return this.empresaId;
  }

  public getUsuarioId(): string {
    return this.usuarioId;
  }

  public getRole(): Role {
    return this.role;
  }

  public isSameTenant(otherEmpresaId: string): boolean {
    return this.empresaId === otherEmpresaId;
  }

  /**
   * Helper para construir cláusulas where seguras no Prisma garantindo isolamento por tenant.
   */
  public scopedWhere<T extends object>(whereClause: T): T & { empresa_id: string } {
    return {
      ...whereClause,
      empresa_id: this.empresaId
    };
  }
}
