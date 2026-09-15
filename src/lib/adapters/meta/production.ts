/**
 * Implementação Real para Meta Ads Graph API (v20.0+)
 * Pronta para produção quando credenciais reais de App Review forem configuradas.
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

export class ProductionMetaAdsService implements IMetaAdsService {
  private apiVersion: string;
  private baseUrl: string;

  constructor() {
    this.apiVersion = process.env.META_API_VERSION || 'v20.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  private async makeRequest<T>(endpoint: string, accessToken: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${accessToken}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Meta API Error [${response.status}]: ${JSON.stringify(errorBody)}`);
    }

    return response.json() as Promise<T>;
  }

  async getBusinessPortfolios(accessToken: string): Promise<MetaBusinessPortfolio[]> {
    const res = await this.makeRequest<{ data: Array<{ id: string; name: string }> }>('/me/businesses', accessToken);
    return res.data || [];
  }

  async getAdAccounts(accessToken: string): Promise<MetaAdAccountInfo[]> {
    const res = await this.makeRequest<{ data: Array<{ id: string; name: string; currency: string; timezone_name: string }> }>(
      '/me/adaccounts?fields=id,name,currency,timezone_name,account_status',
      accessToken
    );
    return (res.data || []).map(acc => ({
      id: acc.id,
      name: acc.name,
      currency: acc.currency,
      timezone: acc.timezone_name
    }));
  }

  async getPages(accessToken: string): Promise<MetaPageInfo[]> {
    const res = await this.makeRequest<{ data: Array<{ id: string; name: string }> }>('/me/accounts', accessToken);
    return res.data || [];
  }

  async getInstagramAccounts(accessToken: string): Promise<MetaInstagramInfo[]> {
    const pages = await this.getPages(accessToken);
    const igAccounts: MetaInstagramInfo[] = [];

    for (const page of pages) {
      try {
        const res = await this.makeRequest<{ instagram_business_account?: { id: string; username: string } }>(
          `/${page.id}?fields=instagram_business_account{id,username}`,
          accessToken
        );
        if (res.instagram_business_account) {
          igAccounts.push({
            id: res.instagram_business_account.id,
            username: res.instagram_business_account.username || 'Instagram Conectado'
          });
        }
      } catch (err) {
        // Ignora página sem IG
      }
    }

    return igAccounts;
  }

  async getPixels(accessToken: string, adAccountId: string): Promise<MetaPixelInfo[]> {
    const cleanId = adAccountId.replace('act_', '');
    const res = await this.makeRequest<{ data: Array<{ id: string; name: string; is_unavailable: boolean }> }>(
      `/act_${cleanId}/adspixels?fields=id,name,is_unavailable`,
      accessToken
    );
    return (res.data || []).map(p => ({
      id: p.id,
      name: p.name,
      status: p.is_unavailable ? 'INATIVO' : 'ATIVO'
    }));
  }

  async getCatalogs(accessToken: string, businessId: string): Promise<MetaCatalogInfo[]> {
    const res = await this.makeRequest<{ data: Array<{ id: string; name: string; product_count: number }> }>(
      `/${businessId}/owned_product_catalogs?fields=id,name,product_count`,
      accessToken
    );
    return (res.data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      total_products: cat.product_count
    }));
  }

  async createCampaign(accessToken: string, adAccountId: string, data: CreateCampaignDTO): Promise<{ id: string; name: string; status: string }> {
    const cleanId = adAccountId.replace('act_', '');
    const body: Record<string, any> = {
      name: data.name,
      objective: data.objective,
      status: data.status || 'PAUSED',
      special_ad_categories: []
    };
    if (data.daily_budget) {
      body.daily_budget = Math.round(data.daily_budget * 100); // Em centavos
    }

    const res = await this.makeRequest<{ id: string }>(`/act_${cleanId}/campaigns`, accessToken, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    return { id: res.id, name: data.name, status: data.status || 'PAUSED' };
  }

  async createAdSet(accessToken: string, adAccountId: string, data: CreateAdSetDTO): Promise<{ id: string; name: string }> {
    const cleanId = adAccountId.replace('act_', '');
    const res = await this.makeRequest<{ id: string }>(`/act_${cleanId}/adsets`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        campaign_id: data.campaign_id,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'OFFSITE_CONVERSIONS',
        targeting: data.targeting
      })
    });
    return { id: res.id, name: data.name };
  }

  async createAd(accessToken: string, adAccountId: string, data: CreateAdDTO): Promise<{ id: string; name: string }> {
    const cleanId = adAccountId.replace('act_', '');
    const res = await this.makeRequest<{ id: string }>(`/act_${cleanId}/ads`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        adset_id: data.adset_id,
        creative: { creative_id: data.creative_id }
      })
    });
    return { id: res.id, name: data.name };
  }

  async updateCampaignBudget(accessToken: string, campaignId: string, dailyBudget: number): Promise<{ success: boolean; newBudget: number }> {
    await this.makeRequest<{ success: boolean }>(`/${campaignId}`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        daily_budget: Math.round(dailyBudget * 100)
      })
    });
    return { success: true, newBudget: dailyBudget };
  }

  async pauseCampaign(accessToken: string, campaignId: string): Promise<{ success: boolean }> {
    await this.makeRequest<{ success: boolean }>(`/${campaignId}`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ status: 'PAUSED' })
    });
    return { success: true };
  }

  async activateCampaign(accessToken: string, campaignId: string): Promise<{ success: boolean }> {
    await this.makeRequest<{ success: boolean }>(`/${campaignId}`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ status: 'ACTIVE' })
    });
    return { success: true };
  }

  async getCampaignInsights(accessToken: string, campaignId: string, _datePreset = 'last_7d'): Promise<Record<string, any>> {
    const res = await this.makeRequest<{ data: Array<Record<string, any>> }>(
      `/${campaignId}/insights?fields=spend,impressions,reach,clicks,ctr,cpc,cpm,actions,purchase_roas,cost_per_action_type&date_preset=${_datePreset}`,
      accessToken
    );
    return res.data?.[0] || {};
  }

  async syncCatalogItems(
    accessToken: string,
    catalogId: string,
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
    const requests = items.map(item => ({
      method: 'UPDATE',
      data: {
        id: item.id,
        title: item.title,
        description: item.description || item.title,
        availability: item.availability === 'true' || item.availability === 'in stock' ? 'in stock' : 'out of stock',
        condition: 'new',
        price: `${Math.round(item.price * 100)} BRL`,
        sale_price: item.sale_price ? `${Math.round(item.sale_price * 100)} BRL` : undefined,
        link: item.url || 'https://prefirodelivery.com',
        image_link: item.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        brand: item.brand || 'Delivery'
      }
    }));

    const res = await this.makeRequest<{ handles?: string[] }>(`/${catalogId}/items_batch`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        item_type: 'PRODUCT_ITEM',
        requests
      })
    });

    return {
      success: !!res.handles,
      items_synced: items.length,
      items_failed: 0
    };
  }

  async createCustomAudience(
    accessToken: string,
    adAccountId: string,
    data: { name: string; description?: string; customer_file_source?: string }
  ): Promise<{ id: string; name: string }> {
    const cleanId = adAccountId.replace('act_', '');
    const res = await this.makeRequest<{ id: string }>(`/act_${cleanId}/customaudiences`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        subtype: 'CUSTOM',
        description: data.description || 'Público gerado via Prefiro Delivery',
        customer_file_source: data.customer_file_source || 'USER_PROVIDED_ONLY'
      })
    });
    return { id: res.id, name: data.name };
  }

  async uploadHashedUsersToAudience(
    accessToken: string,
    audienceId: string,
    users: Array<{ email_hash?: string; phone_hash?: string; fn_hash?: string }>
  ): Promise<{ num_received: number; num_invalid: number }> {
    const schema = ['EMAIL_SHA256', 'PHONE_SHA256'];
    const data = users.map(u => [u.email_hash || '', u.phone_hash || '']);

    const res = await this.makeRequest<{ num_received?: number; num_invalid_entries?: number }>(
      `/${audienceId}/users`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          payload: {
            schema,
            data
          }
        })
      }
    );

    return {
      num_received: res.num_received ?? users.length,
      num_invalid: res.num_invalid_entries ?? 0
    };
  }

  async createLookalikeAudience(
    accessToken: string,
    adAccountId: string,
    data: { name: string; origin_audience_id: string; country?: string; ratio?: number }
  ): Promise<{ id: string; name: string }> {
    const cleanId = adAccountId.replace('act_', '');
    const res = await this.makeRequest<{ id: string }>(`/act_${cleanId}/customaudiences`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        subtype: 'LOOKALIKE',
        origin_audience_id: data.origin_audience_id,
        lookalike_spec: {
          type: 'similarity',
          country: data.country || 'BR',
          ratio: data.ratio || 0.01
        }
      })
    });
    return { id: res.id, name: data.name };
  }
}
