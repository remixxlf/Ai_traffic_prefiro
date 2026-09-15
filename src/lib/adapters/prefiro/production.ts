/**
 * Implementação Real para Prefiro Delivery (PDF Seção 28)
 * Consome os endpoints HTTP reais como http://prefirodelivery.com/{{slug}}/get-products
 */

import {
  IPrefiroDeliveryService,
  PrefiroCompanyInfo,
  PrefiroCustomer,
  PrefiroOrder
} from './interface';

export class ProductionPrefiroDeliveryService implements IPrefiroDeliveryService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PREFIRO_DELIVERY_BASE_URL || 'http://prefirodelivery.com';
  }

  async getCompanyInfo(slug: string): Promise<PrefiroCompanyInfo> {
    const res = await fetch(`${this.baseUrl}/api/v1/companies/${slug}`);
    if (!res.ok) {
      throw new Error(`Prefiro API Error ao buscar empresa ${slug}: [${res.status}]`);
    }
    return res.json();
  }

  async getProductsXml(slug: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/${slug}/get-products`);
    if (!res.ok) {
      throw new Error(`Erro ao baixar catálogo XML da Prefiro (${slug}): [${res.status}]`);
    }
    return res.text();
  }

  async getOrders(slug: string): Promise<PrefiroOrder[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/companies/${slug}/orders`);
    if (!res.ok) {
      throw new Error(`Erro ao buscar pedidos da Prefiro (${slug}): [${res.status}]`);
    }
    return res.json();
  }

  async getCustomers(slug: string): Promise<PrefiroCustomer[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/companies/${slug}/customers`);
    if (!res.ok) {
      throw new Error(`Erro ao buscar clientes da Prefiro (${slug}): [${res.status}]`);
    }
    return res.json();
  }
}
