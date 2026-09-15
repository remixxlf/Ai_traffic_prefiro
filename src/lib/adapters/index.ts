/**
 * Plataforma de Gestão de Tráfego com IA
 * Fábrica Central de Adaptadores (Sandbox e Produção)
 */

import { IMetaAdsService } from './meta/interface';
import { SandboxMetaAdsService } from './meta/sandbox';
import { ProductionMetaAdsService } from './meta/production';

import { IPrefiroDeliveryService } from './prefiro/interface';
import { SandboxPrefiroDeliveryService } from './prefiro/sandbox';
import { ProductionPrefiroDeliveryService } from './prefiro/production';

export * from './meta/interface';
export * from './meta/sandbox';
export * from './meta/production';

export * from './prefiro/interface';
export * from './prefiro/sandbox';
export * from './prefiro/production';

export function getMetaAdsService(envOverride?: string): IMetaAdsService {
  if (process.env.NODE_ENV === 'test' && !envOverride) {
    return new SandboxMetaAdsService();
  }
  const env = envOverride || process.env.ACTIVE_META_ADAPTER || process.env.ENVIRONMENT || 'sandbox';
  if (env === 'production') {
    return new ProductionMetaAdsService();
  }
  return new SandboxMetaAdsService();
}

export function getPrefiroDeliveryService(envOverride?: string): IPrefiroDeliveryService {
  if (process.env.NODE_ENV === 'test' && !envOverride) {
    return new SandboxPrefiroDeliveryService();
  }
  const env = envOverride || process.env.ACTIVE_PREFIRO_ADAPTER || process.env.ENVIRONMENT || 'sandbox';
  if (env === 'production') {
    return new ProductionPrefiroDeliveryService();
  }
  return new SandboxPrefiroDeliveryService();
}
