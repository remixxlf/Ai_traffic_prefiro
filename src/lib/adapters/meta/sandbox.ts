/**
 * Implementação Sandbox de Alta Fidelidade para Meta Ads API
 * Simula todas as operações sem gerar custos reais na Meta.
 */

import {
  IMetaAdsService,
  MetaBusinessPortfolio,
  MetaAdAccountInfo,
  MetaPageInfo,
  MetaInstagramInfo,
  MetaPixelInfo,
  MetaCatalogInfo,
  CreateCampaignDTO,
  CreateAdSetDTO,
  CreateAdDTO
} from './interface';

export class SandboxMetaAdsService implements IMetaAdsService {
  private campaigns: Map<string, { id: string; name: string; status: string; daily_budget?: number }> = new Map();

  async getBusinessPortfolios(_accessToken: string): Promise<MetaBusinessPortfolio[]> {
    return [
      { id: 'biz_sandbox_901', name: 'Portfólio de Negócios Delivery' },
      { id: 'biz_sandbox_902', name: 'Grupo Gastronômico Brasil' }
    ];
  }

  async getAdAccounts(_accessToken: string): Promise<MetaAdAccountInfo[]> {
    return [
      { id: 'act_sandbox_123456789', name: 'Conta Principal - Delivery', currency: 'BRL', timezone: 'America/Sao_Paulo', account_status: 'ACTIVE' },
      { id: 'act_sandbox_987654321', name: 'Conta Secundária - Promoções', currency: 'BRL', timezone: 'America/Sao_Paulo', account_status: 'ACTIVE' }
    ];
  }

  async getPages(_accessToken: string): Promise<MetaPageInfo[]> {
    return [
      { id: 'page_sandbox_101', name: 'Minha Pizzaria Oficial' },
      { id: 'page_sandbox_102', name: 'Delivery Express' }
    ];
  }

  async getInstagramAccounts(_accessToken: string): Promise<MetaInstagramInfo[]> {
    return [
      { id: 'ig_sandbox_201', username: '@minhapizzaria' },
      { id: 'ig_sandbox_202', username: '@deliveryexpress' }
    ];
  }

  async getPixels(_accessToken: string, _adAccountId: string): Promise<MetaPixelInfo[]> {
    return [
      { id: 'pixel_sandbox_301', name: 'Pixel Site Prefiro Delivery', status: 'ATIVO', last_event_at: new Date().toISOString() }
    ];
  }

  async getCatalogs(_accessToken: string, _businessId: string): Promise<MetaCatalogInfo[]> {
    return [
      { id: 'cat_sandbox_401', name: 'Cardápio Completo - Prefiro Delivery', total_products: 134 }
    ];
  }

  async createCampaign(_accessToken: string, _adAccountId: string, data: CreateCampaignDTO): Promise<{ id: string; name: string; status: string }> {
    const id = `cmp_sandbox_${Date.now()}`;
    const campaign = {
      id,
      name: data.name,
      status: data.status || 'PAUSED',
      daily_budget: data.daily_budget
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async createAdSet(_accessToken: string, _adAccountId: string, data: CreateAdSetDTO): Promise<{ id: string; name: string }> {
    const id = `adset_sandbox_${Date.now()}`;
    return { id, name: data.name };
  }

  async createAd(_accessToken: string, _adAccountId: string, data: CreateAdDTO): Promise<{ id: string; name: string }> {
    const id = `ad_sandbox_${Date.now()}`;
    return { id, name: data.name };
  }

  async updateCampaignBudget(_accessToken: string, campaignId: string, dailyBudget: number): Promise<{ success: boolean; newBudget: number }> {
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      campaign.daily_budget = dailyBudget;
      this.campaigns.set(campaignId, campaign);
    }
    return { success: true, newBudget: dailyBudget };
  }

  async pauseCampaign(_accessToken: string, campaignId: string): Promise<{ success: boolean }> {
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      campaign.status = 'PAUSED';
    }
    return { success: true };
  }

  async activateCampaign(_accessToken: string, campaignId: string): Promise<{ success: boolean }> {
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      campaign.status = 'ACTIVE';
    }
    return { success: true };
  }

  async getCampaignInsights(_accessToken: string, _campaignId: string, _datePreset?: string): Promise<Record<string, any>> {
    return {
      spend: 850.0,
      impressions: 42500,
      reach: 31200,
      clicks: 1240,
      ctr: 2.92,
      cpc: 0.68,
      cpm: 20.0,
      conversions: 92,
      purchase_roas: 7.2,
      cost_per_conversion: 9.24
    };
  }

  async syncCatalogItems(
    _accessToken: string,
    _catalogId: string,
    items: Array<{
      id: string;
      title: string;
      description?: string;
      price: number;
      sale_price?: number;
      availability: string;
      image_url?: string;
      url?: string;
      brand?: string;
    }>
  ): Promise<{ success: boolean; items_synced: number; items_failed: number }> {
    return {
      success: true,
      items_synced: items.length,
      items_failed: 0
    };
  }

  async createCustomAudience(
    _accessToken: string,
    _adAccountId: string,
    data: { name: string; description?: string; customer_file_source?: string }
  ): Promise<{ id: string; name: string }> {
    const id = `aud_sandbox_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return { id, name: data.name };
  }

  async uploadHashedUsersToAudience(
    _accessToken: string,
    _audienceId: string,
    users: Array<{ email_hash?: string; phone_hash?: string; fn_hash?: string }>
  ): Promise<{ num_received: number; num_invalid: number }> {
    return {
      num_received: users.length,
      num_invalid: 0
    };
  }

  async createLookalikeAudience(
    _accessToken: string,
    _adAccountId: string,
    data: { name: string; origin_audience_id: string; country?: string; ratio?: number }
  ): Promise<{ id: string; name: string }> {
    const id = `lookalike_sandbox_${Date.now()}`;
    return { id, name: data.name };
  }
}
