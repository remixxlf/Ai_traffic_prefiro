/**
 * Interface do Serviço Meta Ads (PDF Seções 9, 20, 71, 91)
 */

export interface MetaBusinessPortfolio {
  id: string;
  name: string;
}

export interface MetaAdAccountInfo {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  account_status?: string;
}

export interface MetaPageInfo {
  id: string;
  name: string;
}

export interface MetaInstagramInfo {
  id: string;
  username: string;
}

export interface MetaPixelInfo {
  id: string;
  name: string;
  status: string;
  last_event_at?: string;
}

export interface MetaCatalogInfo {
  id: string;
  name: string;
  total_products?: number;
}

export interface CreateCampaignDTO {
  name: string;
  objective: string; // OUTCOME_SALES, etc.
  daily_budget?: number;
  lifetime_budget?: number;
  status?: string;
}

export interface CreateAdSetDTO {
  campaign_id: string;
  name: string;
  daily_budget?: number;
  targeting: {
    geo_locations?: { cities?: string[]; custom_locations?: Array<{ latitude: number; longitude: number; radius: number }> };
    age_min?: number;
    age_max?: number;
    custom_audiences?: Array<{ id: string }>;
  };
}

export interface CreateAdDTO {
  adset_id: string;
  name: string;
  creative_id?: string;
  creative_data?: {
    title: string;
    body: string;
    image_url?: string;
    call_to_action: string;
  };
}

export interface IMetaAdsService {
  getBusinessPortfolios(accessToken: string): Promise<MetaBusinessPortfolio[]>;
  getAdAccounts(accessToken: string): Promise<MetaAdAccountInfo[]>;
  getPages(accessToken: string): Promise<MetaPageInfo[]>;
  getInstagramAccounts(accessToken: string): Promise<MetaInstagramInfo[]>;
  getPixels(accessToken: string, adAccountId: string): Promise<MetaPixelInfo[]>;
  getCatalogs(accessToken: string, businessId: string): Promise<MetaCatalogInfo[]>;
  
  createCampaign(accessToken: string, adAccountId: string, data: CreateCampaignDTO): Promise<{ id: string; name: string; status: string }>;
  createAdSet(accessToken: string, adAccountId: string, data: CreateAdSetDTO): Promise<{ id: string; name: string }>;
  createAd(accessToken: string, adAccountId: string, data: CreateAdDTO): Promise<{ id: string; name: string }>;
  
  updateCampaignBudget(accessToken: string, campaignId: string, dailyBudget: number): Promise<{ success: boolean; newBudget: number }>;
  pauseCampaign(accessToken: string, campaignId: string): Promise<{ success: boolean }>;
  activateCampaign(accessToken: string, campaignId: string): Promise<{ success: boolean }>;

  getCampaignInsights(accessToken: string, campaignId: string, datePreset?: string): Promise<Record<string, any>>;
  syncCatalogItems(
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
  ): Promise<{ success: boolean; items_synced: number; items_failed: number }>;

  createCustomAudience(
    accessToken: string,
    adAccountId: string,
    data: { name: string; description?: string; customer_file_source?: string }
  ): Promise<{ id: string; name: string }>;

  uploadHashedUsersToAudience(
    accessToken: string,
    audienceId: string,
    users: Array<{ email_hash?: string; phone_hash?: string; fn_hash?: string }>
  ): Promise<{ num_received: number; num_invalid: number }>;

  createLookalikeAudience(
    accessToken: string,
    adAccountId: string,
    data: { name: string; origin_audience_id: string; country?: string; ratio?: number }
  ): Promise<{ id: string; name: string }>;
}
