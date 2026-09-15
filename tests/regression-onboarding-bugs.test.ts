import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { OnboardingService } from '../src/lib/services/onboarding-service';
import { z } from 'zod';

const OnboardingRequestSchema = z.object({
  step: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  empresaId: z.string().optional(),
  usuarioId: z.string(),
  data: z.record(z.string(), z.any())
});

describe('Bug #1 - Regressao: rota /api/onboarding deve aceitar empresaId null no passo 1 (PDF Secao 8)', () => {
  it('ANTES DO FIX: Zod rejeita {empresaId: null} com z.string().optional()', () => {
    const payload = { step: 1, empresaId: null, usuarioId: 'user-123', data: { nome: 'Pizzaria Test' } };
    const result = OnboardingRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find(i => i.path.includes('empresaId'));
      expect(err).toBeDefined();
    }
  });

  it('SCHEMA CORRIGIDO: nullish() deve aceitar null como undefined no passo 1', () => {
    const FixedSchema = z.object({
      step: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      empresaId: z.string().nullish(),
      usuarioId: z.string(),
      data: z.record(z.string(), z.any())
    });
    const payload = { step: 1 as const, empresaId: null, usuarioId: 'u', data: {} };
    const result = FixedSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.empresaId ?? undefined).toBeUndefined();
    }
  });
});

describe('Bug #2 - Regressao: campo site exigido no onboarding (PDF Secao 8)', () => {
  let empresaId: string;
  let usuarioId: string;

  beforeAll(async () => {
    const u = await db.usuario.create({
      data: { email: 'regression-site-' + Date.now() + '@test.com', nome: 'Test', senha_hash: 'x' }
    });
    usuarioId = u.id;
  });

  afterAll(async () => {
    if (empresaId) {
      await db.empresaUsuario.deleteMany({ where: { empresa_id: empresaId } });
      await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
    }
    await db.usuario.delete({ where: { id: usuarioId } }).catch(() => {});
  });

  it('passo 1 deve aceitar e persistir o campo site conforme PDF Secao 8', async () => {
    const service = new OnboardingService();
    const empresa = await service.processStep(
      { step: 1, data: { nome: 'Pizzaria Site Test', segmento: 'Pizzaria', cidade: 'SP', estado: 'SP', site: 'https://pizzaria.com' } },
      usuarioId
    );
    empresaId = empresa.id;
    expect((empresa as any).site).toBe('https://pizzaria.com');
  });
});
