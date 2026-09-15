import { describe, it, expect } from 'vitest';
import { 
  getMetaAdsService, 
  getPrefiroDeliveryService,
  SandboxMetaAdsService,
  SandboxPrefiroDeliveryService
} from '../src/lib/adapters';

describe('Task 3: Adaptadores de Sandbox e Produção (PDF Seções 9, 24, 71, 91)', () => {
  it('deve instanciar os adaptadores de Sandbox por padrão quando ambiente for sandbox', () => {
    const metaService = getMetaAdsService('sandbox');
    const prefiroService = getPrefiroDeliveryService('sandbox');

    expect(metaService).toBeInstanceOf(SandboxMetaAdsService);
    expect(prefiroService).toBeInstanceOf(SandboxPrefiroDeliveryService);
  });

  it('SandboxMetaAdsService deve retornar portfólios, contas de anúncio, páginas, instagram e pixels', async () => {
    const metaService = new SandboxMetaAdsService();
    
    const portfolios = await metaService.getBusinessPortfolios('mock-token');
    expect(portfolios.length).toBeGreaterThan(0);
    expect(portfolios[0].name).toBeDefined();

    const adAccounts = await metaService.getAdAccounts('mock-token');
    expect(adAccounts.length).toBeGreaterThan(0);
    expect(adAccounts[0].currency).toBe('BRL');

    const pages = await metaService.getPages('mock-token');
    expect(pages.length).toBeGreaterThan(0);

    const igs = await metaService.getInstagramAccounts('mock-token');
    expect(igs.length).toBeGreaterThan(0);

    const pixels = await metaService.getPixels('mock-token', adAccounts[0].id);
    expect(pixels.length).toBeGreaterThan(0);
    expect(pixels[0].status).toBe('ATIVO');
  });

  it('SandboxPrefiroDeliveryService deve retornar dados cadastrais do negócio e clientes com histórico', async () => {
    const prefiroService = new SandboxPrefiroDeliveryService();
    const slug = 'bella-napoli';

    const info = await prefiroService.getCompanyInfo(slug);
    expect(info.nome).toContain('Bella Napoli');
    expect(info.ticket_medio).toBeGreaterThan(0);

    const customers = await prefiroService.getCustomers(slug);
    expect(customers.length).toBeGreaterThan(0);
    expect(customers[0].email).toBeDefined();
    expect(customers[0].ltv).toBeGreaterThan(0);

    const xml = await prefiroService.getProductsXml(slug);
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<produtos>');
  });

  it('SandboxMetaAdsService deve simular alteração de orçamento e criação de estrutura', async () => {
    const metaService = new SandboxMetaAdsService();
    const campaign = await metaService.createCampaign('mock-token', 'act_123', {
      name: 'Campanha Pizza de Domingo',
      daily_budget: 100.0,
      objective: 'OUTCOME_SALES'
    });

    expect(campaign.id).toBeDefined();
    expect(campaign.status).toBe('PAUSED');

    const budgetUpdate = await metaService.updateCampaignBudget('mock-token', campaign.id, 120.0);
    expect(budgetUpdate.success).toBe(true);
    expect(budgetUpdate.newBudget).toBe(120.0);
  });
});
