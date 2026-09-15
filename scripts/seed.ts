import { db } from '../src/lib/db';

async function seed() {
  console.log('?? Iniciando seed de dados demonstrativos...');

  // 1. Criar Usuário Administrador
  const usuario = await db.usuario.upsert({
    where: { email: 'admin@gestaoia.com.br' },
    update: {},
    create: {
      email: 'admin@gestaoia.com.br',
      nome: 'Administrador Demo',
      senha_hash: 'demo_hash_123'
    }
  });
  console.log('? Usuário demo criado/atualizado:', usuario.email);

  // 2. Criar Empresa
  const empresa = await db.empresa.upsert({
    where: { slug_prefiro: 'bella-napoli-demo' },
    update: {},
    create: {
      nome: 'Pizzaria Bella Napoli',
      slug_prefiro: 'bella-napoli-demo',
      segmento: 'Pizzaria',
      cidade: 'Feira de Santana',
      estado: 'BA',
      site: 'https://bellanapoli.com.br',
      raio_atendimento: 8.5,
      ticket_medio: 78.5,
      publico_alvo: 'Famílias e jovens adultos de 18 a 45 anos apreciadores de pizza artesanal',
      descricao: 'Pizzaria artesanal tradicional com forno a lenha e delivery rápido',
      horario_forte_inicio: '18:30',
      horario_forte_fim: '23:30',
      dias_fortes: 'quinta, sexta, sabado, domingo',
      produto_mais_vendido: 'Pizza Calabresa Especial',
      modo_operacao: 'ASSISTIDO',
      orcamento_max_diario: 350.0
    }
  });
  console.log('? Empresa demo criada/atualizada:', empresa.nome);

  // 3. Vincular EmpresaUsuario como ADMINISTRADOR
  await db.empresaUsuario.upsert({
    where: {
      empresa_id_usuario_id: {
        empresa_id: empresa.id,
        usuario_id: usuario.id
      }
    },
    update: { role: 'ADMINISTRADOR' },
    create: {
      empresa_id: empresa.id,
      usuario_id: usuario.id,
      role: 'ADMINISTRADOR'
    }
  });
  console.log('? Vinculo multi-tenant RBAC estabelecido');

  // 4. Integração Meta & Ativos
  await db.integracaoMeta.upsert({
    where: { id: 'demo-integracao-meta' },
    update: {},
    create: {
      id: 'demo-integracao-meta',
      empresa_id: empresa.id,
      access_token: 'EAAB_MOCK_TOKEN_DEMO',
      status: 'CONECTADO',
      meta_user_id: 'usr_meta_12345'
    }
  });

  await db.metaBusiness.upsert({
    where: { id: 'demo-business' },
    update: {},
    create: {
      id: 'demo-business',
      empresa_id: empresa.id,
      meta_business_id: 'biz_88990011',
      name: 'Portfolio Bella Napoli Oficial',
      status: 'CONECTADO'
    }
  });

  await db.metaAdAccount.upsert({
    where: { id: 'demo-ad-account' },
    update: {},
    create: {
      id: 'demo-ad-account',
      empresa_id: empresa.id,
      meta_account_id: 'act_123456789',
      name: 'Conta Anúncios Bella Napoli',
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      status: 'ACTIVE',
      account_health: 92,
      payment_method_ok: true
    }
  });

  await db.metaPage.upsert({
    where: { id: 'demo-meta-page' },
    update: {},
    create: {
      id: 'demo-meta-page',
      empresa_id: empresa.id,
      meta_page_id: 'page_987654321',
      name: 'Pizzaria Bella Napoli Oficial',
      is_connected: true
    }
  });

  await db.metaInstagram.upsert({
    where: { id: 'demo-meta-insta' },
    update: {},
    create: {
      id: 'demo-meta-insta',
      empresa_id: empresa.id,
      meta_instagram_id: 'ig_554433221',
      username: '@pizzariabellanapoli',
      is_connected: true
    }
  });

  await db.metaPixel.upsert({
    where: { id: 'demo-pixel' },
    update: {},
    create: {
      id: 'demo-pixel',
      empresa_id: empresa.id,
      meta_pixel_id: 'pix_99887766',
      name: 'Pixel Prefiro Delivery',
      status: 'ATIVO',
      has_purchase: true,
      has_add_to_cart: true,
      capi_enabled: true
    }
  });

  // 5. Catálogo e Produtos
  const catalogo = await db.metaCatalogo.upsert({
    where: { id: 'demo-catalogo' },
    update: {},
    create: {
      id: 'demo-catalogo',
      empresa_id: empresa.id,
      meta_catalog_id: 'cat_44332211',
      name: 'Cardápio Digital Bella Napoli',
      total_products: 4,
      active_products: 4,
      status: 'SINCRONIZADO'
    }
  });

  const produtosData = [
    { external_id: 'prod-001', nome: 'Pizza Calabresa Artesanal', preco: 69.90, preco_promocional: 59.90, categoria: 'Pizzas Salgadas' },
    { external_id: 'prod-002', nome: 'Pizza Margherita Especial', preco: 74.90, preco_promocional: null, categoria: 'Pizzas Salgadas' },
    { external_id: 'prod-003', nome: 'Combo Família Feliz (Pizza + Refri 2L)', preco: 98.00, preco_promocional: 84.90, categoria: 'Combos' },
    { external_id: 'prod-004', nome: 'Pizza Doce Nutella com Morango', preco: 55.00, preco_promocional: null, categoria: 'Sobremesas' }
  ];

  for (const p of produtosData) {
    await db.metaProduto.upsert({
      where: {
        empresa_id_external_id: {
          empresa_id: empresa.id,
          external_id: p.external_id
        }
      },
      update: {},
      create: {
        empresa_id: empresa.id,
        catalogo_id: catalogo.id,
        external_id: p.external_id,
        nome: p.nome,
        preco: p.preco,
        preco_promocional: p.preco_promocional,
        categoria: p.categoria,
        disponibilidade: true,
        status: 'ATIVO'
      }
    });
  }

  // 6. Campanhas e Métricas de Exemplo
  const campanha = await db.campanha.upsert({
    where: { meta_campaign_id: 'cmp_demo_vendas_fds' },
    update: {},
    create: {
      empresa_id: empresa.id,
      meta_campaign_id: 'cmp_demo_vendas_fds',
      nome: 'Campanha Fim de Semana - Conversão Site',
      objetivo: 'OUTCOME_SALES',
      status: 'ACTIVE',
      orcamento_diario: 80.0,
      tipo_anuncio: 'PADRAO'
    }
  });

  const conjunto = await db.conjuntoAnuncio.upsert({
    where: { meta_adset_id: 'adset_demo_fds' },
    update: {},
    create: {
      empresa_id: empresa.id,
      campanha_id: campanha.id,
      meta_adset_id: 'adset_demo_fds',
      nome: 'Público Aberto 8km Feira de Santana',
      status: 'ACTIVE',
      orcamento_diario: 80.0,
      publico_alvo_desc: 'Raio de 8.5km de Feira de Santana, 18-50 anos'
    }
  });

  await db.anuncio.upsert({
    where: { meta_ad_id: 'ad_demo_calabresa' },
    update: {},
    create: {
      empresa_id: empresa.id,
      conjunto_anuncio_id: conjunto.id,
      meta_ad_id: 'ad_demo_calabresa',
      nome: 'Anúncio Calabresa - Forno a Lenha',
      status: 'ACTIVE'
    }
  });

  // Métricas dos últimos 7 dias
  const hoje = new Date();
  for (let i = 6; i >= 0; i--) {
    const dataDia = new Date(hoje);
    dataDia.setDate(hoje.getDate() - i);
    dataDia.setHours(0, 0, 0, 0);

    await db.campanhaMetrica.upsert({
      where: {
        campanha_id_data: {
          campanha_id: campanha.id,
          data: dataDia
        }
      },
      update: {},
      create: {
        campanha_id: campanha.id,
        data: dataDia,
        investimento: 75.0 + Math.random() * 10,
        impressoes: 3400 + Math.floor(Math.random() * 800),
        alcance: 2800 + Math.floor(Math.random() * 600),
        cliques: 140 + Math.floor(Math.random() * 40),
        ctr: 3.8 + Math.random() * 0.8,
        cpc: 0.55 + Math.random() * 0.1,
        cpm: 22.0,
        frequencia: 1.22,
        conversoes: 12 + Math.floor(Math.random() * 6),
        vendas: 12 + Math.floor(Math.random() * 6),
        receita: 980.0 + Math.random() * 300,
        cpa: 6.2,
        roas: 5.8,
        pedidos_reais: 14 + Math.floor(Math.random() * 5),
        receita_real: 1120.0 + Math.random() * 250,
        roas_real: 6.6,
        cpa_real: 5.5
      }
    });
  }

  // 7. Alertas e Recomendações de IA
  await db.alerta.create({
    data: {
      empresa_id: empresa.id,
      tipo: 'OTIMIZACAO_ORCAMENTO',
      titulo: 'Excelente desempenho no final de semana',
      mensagem: 'O ROAS Real de ontem atingiu 6,8x. O orçamento diário suporta aumento de 15%.',
      nivel: 'INFORMATIVO'
    }
  });

  const rec = await db.recomendacaoIa.create({
    data: {
      empresa_id: empresa.id,
      tipo: 'OPORTUNIDADE',
      entidade_tipo: 'CAMPANHA',
      entidade_id: campanha.id,
      titulo: 'Aumentar orçamento da campanha de Fim de Semana',
      analise: 'Campanha performando com CPA de R$ 6,20 bem abaixo da meta de R$ 15,00.',
      motivo: 'Margem saudável e estoque operacional disponível.',
      acao_sugerida: 'Aumentar orçamento diário de R$ 80 para R$ 95 (+18,7%).',
      impacto_prev: 'ALTO',
      nivel_confianca: 0.94,
      risco: 'BAIXO'
    }
  });

  await db.aprovacao.create({
    data: {
      empresa_id: empresa.id,
      recomendacao_id: rec.id,
      titulo: 'Aprovar aumento de orçamento para R$ 95/dia',
      descricao: 'A IA identificou espaço para captar mais pedidos mantendo o ROAS acima de 5x.',
      acao_tipo: 'ALTERAR_ORCAMENTO',
      payload: JSON.stringify({ campanhaId: campanha.id, novoOrcamento: 95.0 })
    }
  });

  console.log('?? Seed demonstrativo finalizado com 100% de sucesso!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro no seed:', err);
    process.exit(1);
  });
