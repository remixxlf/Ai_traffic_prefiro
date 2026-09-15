import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { 
  CustomerAudienceService, 
  normalizeAndHashEmail, 
  normalizeAndHashPhone 
} from '../src/lib/services/customer-audience-service';

describe('Task 8: Governança de Dados, Hashing LGPD & Custom Audiences (PDF Seções 21, 24, 25, 27, 92)', () => {
  let empresaId: string;

  beforeAll(async () => {
    const empresa = await db.empresa.create({
      data: {
        nome: 'Pizzaria Audiences Test',
        slug_prefiro: `bella-napoli-aud-${Date.now()}`,
        segmento: 'Pizzaria',
        cidade: 'Feira de Santana',
        estado: 'BA',
        ticket_medio: 75.0
      }
    });
    empresaId = empresa.id;

    await db.integracaoMeta.create({
      data: {
        empresa_id: empresaId,
        access_token: 'sandbox_token_audience_test',
        status: 'CONECTADO'
      }
    });

    await db.metaAdAccount.create({
      data: {
        empresa_id: empresaId,
        meta_account_id: 'act_sandbox_aud_123',
        name: 'Conta Anuncios Audiences',
        currency: 'BRL'
      }
    });
  });

  afterAll(async () => {
    await db.publico.deleteMany({ where: { empresa_id: empresaId } });
    await db.metaAdAccount.deleteMany({ where: { empresa_id: empresaId } });
    await db.integracaoMeta.deleteMany({ where: { empresa_id: empresaId } });
    await db.empresa.delete({ where: { id: empresaId } }).catch(() => {});
  });

  it('deve aplicar hash SHA-256 obrigatório em e-mails conforme LGPD e regras da Meta (PDF Seção 25 e 92)', () => {
    const rawEmail = '  Carlos.Oliveira@Email.com ';
    const hash = normalizeAndHashEmail(rawEmail);

    // O hash SHA-256 de 'carlos.oliveira@email.com' deve ter 64 caracteres hexadecimais
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain('@');
    expect(hash).not.toContain('carlos');

    // Determinismo: o mesmo e-mail sanitizado deve gerar o mesmo hash
    expect(normalizeAndHashEmail('carlos.oliveira@email.com')).toBe(hash);
  });

  it('deve normalizar e hashear telefones com código do país (+55)', () => {
    const rawPhone = '(75) 99999-1111';
    const hash = normalizeAndHashPhone(rawPhone);

    expect(hash).toHaveLength(64);
    expect(hash).not.toContain('99999');

    // Determinismo com formato internacional
    expect(normalizeAndHashPhone('+55 75 99999-1111')).toBe(hash);
  });

  it('deve segmentar clientes da Prefiro Delivery em categorias inteligentes (PDF Seção 27)', async () => {
    const service = new CustomerAudienceService();
    const segments = await service.segmentPrefiroCustomers(empresaId);

    expect(segments.todos.length).toBeGreaterThan(0);
    expect(segments.melhores.length).toBeGreaterThan(0);
    expect(segments.recorrentes.length).toBeGreaterThan(0);

    // Nenhum dado nos segmentos preparados para envio deve conter e-mail ou telefone em texto puro
    for (const user of segments.todos) {
      expect(user.email_hash).toHaveLength(64);
      expect(user.phone_hash).toHaveLength(64);
    }
  });

  it('deve criar Custom Audience na Meta com nome amigável e registrar no banco (PDF Seção 25, 52, 89)', async () => {
    const service = new CustomerAudienceService();
    const result = await service.syncCustomersToMetaAudience(empresaId);

    expect(result.success).toBe(true);
    expect(result.audiencesCreated.length).toBeGreaterThan(0);

    // Verificar se foi persistido na tabela Publico com nome em linguagem de negócio (Seção 89: "Meus clientes")
    const publicos = await db.publico.findMany({ where: { empresa_id: empresaId } });
    expect(publicos.length).toBeGreaterThan(0);

    const publicoBase = publicos.find(p => p.nome.includes('Meus clientes'));
    expect(publicoBase).toBeDefined();
    expect(publicoBase?.tipo).toBe('CUSTOM_CLIENTES');
    expect(publicoBase?.origem).toBe('Clientes Prefiro Delivery');
    expect(publicoBase?.tamanho_estimado).toBeGreaterThan(0);
  });
});
