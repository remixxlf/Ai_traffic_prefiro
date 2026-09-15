/**
 * Interface do Serviço Prefiro Delivery (PDF Seções 24, 25, 28, 52)
 */

export interface PrefiroCompanyInfo {
  slug: string;
  nome: string;
  segmento: string;
  cidade: string;
  estado: string;
  ticket_medio: number;
  produtos_chave: string[];
}

export interface PrefiroCustomer {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  total_pedidos: number;
  ltv: number;
  primeira_compra: string;
  ultima_compra: string;
}

export interface PrefiroOrderItem {
  produto_id: string;
  quantidade: number;
  preco: number;
}

export interface PrefiroOrder {
  id: string;
  cliente_id: string;
  total: number;
  data: string;
  itens: PrefiroOrderItem[];
}

export interface IPrefiroDeliveryService {
  getCompanyInfo(slug: string): Promise<PrefiroCompanyInfo>;
  getProductsXml(slug: string): Promise<string>;
  getOrders(slug: string): Promise<PrefiroOrder[]>;
  getCustomers(slug: string): Promise<PrefiroCustomer[]>;
}
