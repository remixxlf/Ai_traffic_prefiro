/**
 * Implementação Sandbox com dados sintéticos de alta fidelidade para Prefiro Delivery
 */

import {
  IPrefiroDeliveryService,
  PrefiroCompanyInfo,
  PrefiroCustomer,
  PrefiroOrder
} from './interface';

export class SandboxPrefiroDeliveryService implements IPrefiroDeliveryService {
  async getCompanyInfo(slug: string): Promise<PrefiroCompanyInfo> {
    return {
      slug,
      nome: 'Pizzaria Bella Napoli',
      segmento: 'Pizzaria',
      cidade: 'Feira de Santana',
      estado: 'BA',
      ticket_medio: 78.5,
      produtos_chave: ['Pizza Família', 'Combo Fim de Semana', 'Pizza Doce Especial']
    };
  }

  async getProductsXml(_slug: string): Promise<string> {
    return `<?xml version="1.0" encoding="UTF-8"?>
<produtos>
  <produto>
    <id>prod_001</id>
    <nome>Pizza Família Especial</nome>
    <descricao>Pizza 8 fatias com até 2 sabores tradicionais e borda recheada.</descricao>
    <preco>79.90</preco>
    <preco_promocional>69.90</preco_promocional>
    <disponibilidade>true</disponibilidade>
    <categoria>Pizzas</categoria>
    <url>https://prefirodelivery.com/bella-napoli/pizza-familia</url>
    <imagem>https://images.unsplash.com/photo-1513104890138-7c749659a591</imagem>
    <marca>Bella Napoli</marca>
    <status>ATIVO</status>
  </produto>
  <produto>
    <id>prod_002</id>
    <nome>Combo Weekend (Pizza G + Refri 2L)</nome>
    <descricao>Pizza Grande Especial + Refrigerante Guaraná ou Coca-Cola 2L.</descricao>
    <preco>94.90</preco>
    <preco_promocional>84.90</preco_promocional>
    <disponibilidade>true</disponibilidade>
    <categoria>Combos</categoria>
    <url>https://prefirodelivery.com/bella-napoli/combo-weekend</url>
    <imagem>https://images.unsplash.com/photo-1565299624946-b28f40a0ae38</imagem>
    <marca>Bella Napoli</marca>
    <status>ATIVO</status>
  </produto>
  <produto>
    <id>prod_003</id>
    <nome>Hambúrguer Artesanal Bacon Cheese</nome>
    <descricao>Blend bovino 180g, queijo cheddar inglês, bacon crocante no pão brioche.</descricao>
    <preco>38.00</preco>
    <preco_promocional>34.00</preco_promocional>
    <disponibilidade>true</disponibilidade>
    <categoria>Hambúrgueres</categoria>
    <url>https://prefirodelivery.com/bella-napoli/burger-bacon</url>
    <imagem>https://images.unsplash.com/photo-1568901346375-23c9450c58cd</imagem>
    <marca>Bella Napoli</marca>
    <status>ATIVO</status>
  </produto>
</produtos>`;
  }

  async getOrders(_slug: string): Promise<PrefiroOrder[]> {
    return [
      {
        id: 'ord_1001',
        cliente_id: 'cust_01',
        total: 84.90,
        data: new Date(Date.now() - 3600000).toISOString(),
        itens: [{ produto_id: 'prod_002', quantidade: 1, preco: 84.90 }]
      },
      {
        id: 'ord_1002',
        cliente_id: 'cust_02',
        total: 69.90,
        data: new Date(Date.now() - 7200000).toISOString(),
        itens: [{ produto_id: 'prod_001', quantidade: 1, preco: 69.90 }]
      }
    ];
  }

  async getCustomers(_slug: string): Promise<PrefiroCustomer[]> {
    return [
      {
        id: 'cust_01',
        nome: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        telefone: '+5575999991111',
        total_pedidos: 14,
        ltv: 1180.0,
        primeira_compra: '2026-01-10T19:30:00Z',
        ultima_compra: '2026-09-12T20:45:00Z'
      },
      {
        id: 'cust_02',
        nome: 'Mariana Santos',
        email: 'mariana.santos@email.com',
        telefone: '+5575988882222',
        total_pedidos: 9,
        ltv: 720.0,
        primeira_compra: '2026-03-15T20:10:00Z',
        ultima_compra: '2026-09-13T21:00:00Z'
      },
      {
        id: 'cust_03',
        nome: 'Fernando Alencar',
        email: 'fernando.alencar@email.com',
        telefone: '+5575977773333',
        total_pedidos: 2,
        ltv: 159.8,
        primeira_compra: '2026-09-01T19:00:00Z',
        ultima_compra: '2026-09-08T20:15:00Z'
      }
    ];
  }
}
