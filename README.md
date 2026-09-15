# Plataforma de Gestão de Tráfego com Inteligência Artificial

> **Plataforma SaaS B2B focada em Restaurantes e Negócios de Delivery**, integrando de ponta a ponta a **Meta Ads Graph API (v20.0)**, a plataforma **Prefiro Delivery** e o motor de Inteligência Artificial **Groq (Llama 3.3 70B & Llama 3.1 8B)** sob uma interface limpa, minimalista e executiva em **100% Light Mode** inspirada no design system da **Canny** (Royal Indigo #4F46E5).

---

## Sumário Executivo

1. [Visão Geral & Proposta de Valor](#1-visão-geral--proposta-de-valor)
2. [Arquitetura do Ecossistema](#2-arquitetura-do-ecossistema)
3. [Design System & Experiência do Usuário (100% Light Mode)](#3-design-system--experiência-do-usuário-100-light-mode)
4. [Estrutura de Pastas e Arquivos](#4-estrutura-de-pastas-e-arquivos)
5. [Guia Completo de Variáveis de Ambiente (.env)](#5-guia-completo-de-variáveis-de-ambiente-env)
6. [Modelagem de Dados (Prisma ORM - 26 Tabelas)](#6-modelagem-de-dados-prisma-orm---26-tabelas)
7. [Catálogo de Endpoints da API REST (38 Rotas)](#7-catálogo-de-endpoints-da-api-rest-38-rotas)
8. [Documentação Técnica dos Serviços de Domínio (17 Serviços)](#8-documentação-técnica-dos-serviços-de-domínio-17-serviços)
9. [Workers e Processamento em Segundo Plano](#9-workers-e-processamento-em-segundo-plano)
10. [Controle de Acesso Baseado em Papéis (RBAC Multi-tenant)](#10-controle-de-acesso-baseado-em-papéis-rbac-multi-tenant)
11. [Guia Passo a Passo de Implementação e Execução](#11-guia-passo-a-passo-de-implementação-e-execução)
12. [Garantia de Qualidade (QA), Testes e Integridade](#12-garantia-de-qualidade-qa-testes-e-integridade)
13. [Matriz de Rastreabilidade com o Documento PDF Guia](#13-matriz-de-rastreabilidade-com-o-documento-pdf-guia)

---

## 1. Visão Geral & Proposta de Valor

A maioria das plataformas de gestão de anúncios falha ao expor aos empresários de delivery interfaces excessivamente técnicas, repletas de siglas complexas (CPM, CPC, CAPI, Custom Audience, Pixel Events). 

Conforme estabelecido no documento guia funcional (**PDF Seções 88 e 89**), esta plataforma atua como uma **camada intermediária inteligente** entre o dono do restaurante e a complexidade técnica do Meta Ads Manager. O empresário não precisa entender de mídia paga: ele informa o que deseja vender (ou a IA detecta automaticamente pelo cardápio da Prefiro Delivery), e o sistema cuida de toda a esteira de criação, segmentação de público, copywriting persuasivo, monitoramento de fadiga, auditoria de rastreamento e otimização de orçamento com guardrails determinísticos de proteção financeira.

### Pilares Fundamentais do Produto:
- **Meta Ads**: Fornece a infraestrutura de publicação e mensuração de anúncios.
- **Prefiro Delivery**: Fornece dados operacionais em tempo real (produtos, clientes, pedidos e faturamento).
- **Inteligência Artificial (Groq/Llama 3.3)**: Interpreta as necessidades do empresário, formula estratégias de copy e público, e recomenda ações com justificativas baseadas em margem e ROAS Real.
- **Plataforma Web (Next.js 14)**: Orquestra a automação, reconcilia as vendas reais com os cliques e oferece um painel focado em dinheiro investido, vendas geradas e oportunidades de lucro.

---

## 2. Arquitetura do Ecossistema

```
                    ┌──────────────────────────────────────┐
                    │       Restaurante / Delivery         │
                    │   (Proprietário, Gestor, Analista)   │
                    └──────────────────┬───────────────────┘
                                       │
                                       ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                 Frontend Next.js 14 (App Router)             │
        │          100% Light Mode • Canny Design • Royal Indigo       │
        │    15 Módulos Operacionais • Wizard Onboarding • Chat IA     │
        └──────────────────────────────┬───────────────────────────────┘
                                       │ REST JSON / Server Actions
                                       ▼
        ┌──────────────────────────────────────────────────────────────┐
        │             Camada de Serviços de Domínio (Backend)          │
        │  Policy Engine (Guardrails) • Reconciliação ROAS Real • LGPD │
        │  Detector de Fadiga • Gerador de Copy • Diagnosticador CAPI  │
        └───────┬──────────────────────┬──────────────────────┬────────┘
                │                      │                      │
                ▼                      ▼                      ▼
    ┌──────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
    │     Prisma ORM       │ │  Adaptador Meta   │ │ Adaptador Prefiro │
    │  SQLite (Dev Local)  │ │ (Sandbox / Prod)  │ │ (Sandbox / Prod)  │
    │  PostgreSQL (Prod)   │ │ Graph API v20.0   │ │  REST / Catálogo  │
    └──────────────────────┘ └───────────────────┘ └───────────────────┘
                                       │                      │
                                       ▼                      ▼
                            ┌───────────────────┐  ┌───────────────────┐
                            │   Meta Marketing  │  │ Prefiro Delivery  │
                            │ Ads / CAPI / Pixel│  │ Pedidos & Clientes│
                            └───────────────────┘  └───────────────────┘
```

### Padrão Adapter (Dual-Mode):
O sistema foi concebido com arquitetura desacoplada através do **Adapter Pattern** (`src/lib/adapters`):
- **Sandbox (`sandbox.ts`)**: Implementação completa que emula o comportamento da Meta e da Prefiro Delivery, gerando métricas dinâmicas, catálogos e respostas realistas sem custos de API ou necessidade de contas de produção ativas.
- **Production (`production.ts`)**: Implementação pronta para integração oficial com a **Meta Graph API v20.0** e endpoints HTTP da **Prefiro Delivery**.
A alternância ocorre de forma transparente via variável de ambiente `ACTIVE_META_ADAPTER` e `ACTIVE_PREFIRO_ADAPTER`.

---

## 3. Design System & Experiência do Usuário (100% Light Mode)

Inspirado no fluxo de onboarding e na sofisticação da plataforma **Canny**:
- **Canvas Base**: Slate-50 (`#F8FAFC`) com tipografia de alta legibilidade em Slate-900 (`#0F172A`).
- **Acento Primário**: **Royal Indigo** (`#4F46E5`), com hover em Indigo-700 (`#4338CA`) e anéis de foco suaves em `ring-indigo-500/10`.
- **Superfícies e Cartões**: Cartões brancos nítidos (`bg-white`), bordas sutis em `border-slate-200/80` e sombras elegantes (`shadow-sm` e `shadow-card`).
- **Pílulas de Status Semânticas**:
  - *Sucesso/Ativo*: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - *Atenção/Pendente*: `bg-amber-50 text-amber-800 border-amber-200`
  - *Crítico/Fadiga*: `bg-rose-50 text-rose-700 border-rose-200`
  - *Informativo/Destaque*: `bg-indigo-50 text-indigo-700 border-indigo-200`
- **Substituição de Jargões (PDF Seção 89)**:
  - *Custom Audience* → **Meus Clientes**
  - *Lookalike Audience* → **Pessoas Semelhantes aos Meus Clientes**
  - *Creative Fatigue* → **Anúncio Perdendo Força**
  - *Ads Insights* → **Resultados de Negócio**

---

## 4. Estrutura de Pastas e Arquivos

```
epic-noether/
├── .agents/                 # Definições de skills de engenharia e regras de fluxo
├── docs/                    # Documentação complementar do sistema
├── prisma/
│   ├── migrations/          # Histórico de migrações relacionais do Prisma
│   ├── dev.db               # Banco de dados local SQLite
│   └── schema.prisma        # Modelagem canônica do banco multi-tenant (26 modelos)
├── public/                  # Arquivos estáticos e ícones
├── scripts/
│   ├── seed.ts              # Script de população de dados demonstrativos completos
│   └── verify-integrity.ts  # Script de validação de integridade de banco e adaptadores
├── src/
│   ├── app/                 # Next.js 14 App Router (páginas e rotas de API)
│   │   ├── api/             # 38 endpoints REST da aplicação
│   │   ├── alertas/         # Tela da Central de Alertas e Anomalias
│   │   ├── aprovacoes/      # Tela do Centro de Aprovações de 1 Clique
│   │   ├── automacoes/      # Tela do Policy Engine e Modos de Operação
│   │   ├── campanhas/       # Listagem e Wizard de 5 passos para criação de campanhas
│   │   ├── catalogo/        # Monitor e disparador de anúncios do cardápio digital
│   │   ├── chat/            # Interface conversacional com a IA assistente
│   │   ├── copywriting/     # Gerador de copies estratégicas (Produto, Comodidade, Urgência)
│   │   ├── criativos/       # Galeria de criativos e monitor de fadiga de anúncio
│   │   ├── dashboard/       # Dashboard executivo de métricas de negócio e funil
│   │   ├── integracoes/     # Painel de conexão Meta Marketing API e Prefiro Delivery
│   │   ├── minha-ia/        # Visão da IA em 3 grupos (Bem, Atenção, Oportunidades)
│   │   ├── onboarding/      # Wizard guiado de 4 etapas para cadastro do restaurante
│   │   ├── publicos/        # Gestão de públicos locais, clientes e lookalike LGPD
│   │   ├── rastreamento/    # Diagnóstico da saúde do Pixel e Conversion API (CAPI)
│   │   ├── relatorios/      # Relatórios executivos (Resumo de Ontem e Semanal)
│   │   ├── globals.css      # Design tokens Tailwind e variáveis CSS do Light Mode
│   │   ├── layout.tsx       # Shell global e provedores
│   │   └── page.tsx         # Hub central com seletor de empresa e navegação
│   ├── components/          # Componentes React (Client & Server Components) organizados por módulo
│   └── lib/                 # Núcleo lógico da aplicação
│       ├── adapters/        # Fábrica e implementações Meta e Prefiro (Sandbox & Prod)
│       ├── ai/              # Cliente Groq SDK e orquestrador de prompts Llama
│       ├── multitenant/     # Gestor de contexto e isolamento de tenant
│       ├── rbac/            # Matriz e funções de autorização por papéis
│       ├── services/        # 17 serviços de domínio de inteligência de tráfego
│       ├── workers/         # Workers assíncronos de sincronização de catálogo e métricas
│       ├── db.ts            # Cliente singleton do Prisma ORM
│       └── utils.ts         # Utilitários de formatação de moeda, números e classes CSS
├── tests/                   # 21 suítes de testes unitários, de integração e regressão (96 testes)
├── .env                     # Variáveis de ambiente ativas
├── .env.example             # Modelo documentado de configuração de ambiente
├── package.json             # Dependências e scripts de execução
├── tailwind.config.ts       # Paleta Royal Indigo e tema estendido
└── tsconfig.json            # Configuração estrita de compilação TypeScript
```

---

## 5. Guia Completo de Variáveis de Ambiente (.env)

O arquivo `.env` controla o comportamento da persistência, dos adaptadores e da IA:

| Variável | Propósito & Descrição | Exemplo Sandbox | Exemplo Produção | Onde Obter Credencial |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão com o banco de dados multi-tenant. No desenvolvimento local utiliza SQLite; em produção, PostgreSQL. | `file:./dev.db` | `postgresql://user:pass@host:5432/db` | Provedor PostgreSQL (Supabase, Neon, RDS) |
| `GROQ_API_KEY` | Chave de autenticação da API Groq para inferência dos modelos Llama 3.3 70B e Llama 3.1 8B. | `gsk_demo_ou_real` | `gsk_prod_xxxxxxxxxxxx` | [Groq Console](https://console.groq.com/keys) |
| `ENVIRONMENT` | Perfil de ambiente geral do SaaS (`sandbox` ou `production`). | `sandbox` | `production` | Definido pela infraestrutura de hospedagem |
| `ACTIVE_META_ADAPTER` | Alterna entre o simulador mock de tráfego da Meta (`sandbox`) e as chamadas reais à Marketing API (`production`). | `sandbox` | `production` | Configuração interna do sistema |
| `ACTIVE_PREFIRO_ADAPTER` | Alterna entre o mock de pedidos da Prefiro (`sandbox`) e a API HTTP oficial da Prefiro (`production`). | `sandbox` | `production` | Configuração interna do sistema |
| `META_APP_ID` | Identificador do aplicativo no portal Meta for Developers. | `123456789` | `88990011223344` | [Meta for Developers > Meus Apps](https://developers.facebook.com/apps) |
| `META_APP_SECRET` | Chave secreta do aplicativo Meta utilizada na troca do código OAuth pelo token de acesso de longa duração. | `sec_demo` | `ab12cd34ef56...` | [Meta for Developers > Painel do App](https://developers.facebook.com/apps) |
| `META_REDIRECT_URI` | URL de callback autorizada no produto Facebook Login para conclusão do fluxo OAuth 2.0. | `http://localhost:3000/api/auth/meta/callback` | `https://app.seudominio.com/api/auth/meta/callback` | Cadastrado no painel Meta > Facebook Login > Settings |
| `META_API_VERSION` | Versão canônica da Graph API a ser consumida nas requisições. | `v20.0` | `v20.0` | [Documentação Oficial Meta Graph API](https://developers.facebook.com/docs/graph-api) |
| `PREFIRO_DELIVERY_BASE_URL`| URL base para requisições de consulta de estabelecimentos e catálogo na Prefiro Delivery. | `https://prefirodelivery.com` | `https://api.prefirodelivery.com` | Equipe de Engenharia Prefiro Delivery |

---

## 6. Modelagem de Dados (Prisma ORM - 26 Tabelas)

O banco de dados foi modelado respeitando integralmente as seções de requisitos do PDF funcional, assegurando isolamento multi-tenant por `empresa_id` em todas as tabelas:

| # | Modelo Prisma | Tabela Mapeada | Seção do PDF | Descrição e Atributos Principais |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `Empresa` | `empresa` | Seções 6, 8, 41, 46 | Raiz do tenant. Contém dados cadastrais (`nome`, `site`, `segmento`, `cidade`, `estado`), operacionais (`raio_atendimento`, `ticket_medio`, `publico_alvo`), Memória do Negócio (`horario_forte`, `dias_fortes`, `produto_mais_vendido`) e modo de operação (`modo_operacao`, `orcamento_max_diario`). |
| **2** | `Usuario` | `usuario` | Seção 7 | Usuários com acesso à plataforma (`email`, `nome`, `senha_hash`). |
| **3** | `EmpresaUsuario` | `empresa_usuario` | Seções 6, 7 | Tabela pivot com controle de permissão RBAC (`role`: ADMINISTRADOR, GESTOR, ANALISTA, CLIENTE, SOMENTE_LEITURA). |
| **4** | `IntegracaoMeta` | `integracao_meta` | Seções 9, 10 | Tokens OAuth Meta de longa duração, validade e status da conexão (`CONECTADO`, `DESCONECTADO`). |
| **5** | `MetaBusiness` | `meta_business` | Seção 9 | Portfólio Empresarial Meta vinculado (`meta_business_id`, `name`). |
| **6** | `MetaAdAccount` | `meta_ad_account` | Seções 9, 10, 11 | Conta de anúncios gerenciada (`meta_account_id`, `currency`, `timezone`, `account_health`, `payment_method_ok`). |
| **7** | `MetaPage` | `meta_page` | Seções 9, 10 | Página do Facebook associada para vinculação de anúncios (`meta_page_id`, `name`). |
| **8** | `MetaInstagram` | `meta_instagram` | Seções 9, 10 | Conta profissional do Instagram associada aos anúncios (`username`, `meta_instagram_id`). |
| **9** | `MetaPixel` | `meta_pixel` | Seções 55, 56, 57 | Rastreamento do pixel no cardápio, status do evento `Purchase`, `AddToCart` e habilitação de Conversion API (CAPI). |
| **10** | `MetaCatalogo` | `meta_catalogo` | Seções 28, 29 | Catálogo de produtos no Commerce Manager (`meta_catalog_id`, `feed_url`, contagem de ativos/erros e timestamps de sincronização). |
| **11** | `MetaProduto` | `meta_produto` | Seções 30, 31 | Itens do cardápio integrados (`external_id`, `nome`, `preco`, `preco_promocional`, `categoria`, `disponibilidade`, `url_imagem`). |
| **12** | `Campanha` | `campanha` | Seções 20, 58 | Campanhas Meta (`meta_campaign_id`, `nome`, `objetivo`: OUTCOME_SALES, `status`: ACTIVE/PAUSED, `orcamento_diario`, `tipo_anuncio`). |
| **13** | `ConjuntoAnuncio`| `conjunto_anuncio` | Seção 20 | AdSets (`meta_adset_id`, `nome`, `orcamento_diario`, `publico_alvo_desc`). |
| **14** | `Anuncio` | `anuncio` | Seções 20, 40 | Criativos veiculados (`meta_ad_id`, `nome`, flag `fadiga_detectada`). |
| **15** | `Criativo` | `criativo` | Seções 35, 37, 39, 40 | Biblioteca de criativos com formato (`1:1`, `4:5`, `9:16`), estratégia (`PRODUTO`, `BENEFICIO`, `URGENCIA`), `status_fadiga`, métricas de performance (CTR, frequência, CPA, ROAS). |
| **16** | `Publico` | `publico` | Seções 21, 23, 25, 26 | Biblioteca de públicos salvos (`GEOGRAFICO`, `CUSTOM_CLIENTES`, `LOOKALIKE`), raio em km, faixas etárias e tamanho estimado. |
| **17** | `CampanhaMetrica` | `campanha_metrica` | Seções 52, 53, 73 | Snapshots diários de métricas da Meta (investimento, impressões, cliques, CTR, CPC, CPM, ROAS) combinados com métricas reconciliadas da Prefiro (`pedidos_reais`, `receita_real`, `roas_real`, `cpa_real`). |
| **18** | `ConjuntoMetrica` | `conjunto_metrica` | Seção 73 | Snapshots diários de métricas por conjunto de anúncios. |
| **19** | `AnuncioMetrica` | `anuncio_metrica` | Seção 73 | Snapshots diários de performance individual por anúncio. |
| **20** | `ProdutoMetrica` | `produto_metrica` | Seção 32 | Vendas e faturamento por item individual do cardápio gerados por anúncios. |
| **21** | `RecomendacaoIa` | `recomendacao_ia` | Seções 13, 75 | Recomendações proativas geradas pela IA (`OPORTUNIDADE`, `ATENCAO`, `BEM_SUCEDIDO`), nível de confiança, risco e análise causal. |
| **22** | `Automacao` | `automacao` | Seções 44, 67 | Regras determinísticas configuradas (`condicao` e `acao` em formato JSON). |
| **23** | `AutomacaoExecucao`| `automacao_execucao`| Seção 68 | Log histórico de execução e disparo de regras de automação. |
| **24** | `Aprovacao` | `aprovacao` | Seção 66 | Centro de Aprovações de 1 clique (`status`: PENDENTE, APROVADO, RECUSADO, `acao_tipo`: ALTERAR_ORCAMENTO, PAUSAR_ANUNCIO). |
| **25** | `Alerta` | `alerta` | Seções 61, 74, 76 | Central de alertas (`tipo`: REJEICAO, QUEDA_ROAS, AUMENTO_CPA, PIXEL_OFFLINE, nível: INFORMATIVO, ATENCAO, CRITICO). |
| **26** | `Auditoria` | `auditoria` | Seções 64, 65 | Trilha de auditoria 100% imutável (`origem`: IA, USUARIO, AUTOMACAO), valores anteriores, novos valores e justificativa. |

---

## 7. Catálogo de Endpoints da API REST (38 Rotas)

Todas as rotas seguem o padrão Next.js 14 App Router, retornando JSON com `{ success: true, ... }` ou `{ success: false, error: string }`:

### 7.1 Autenticação & Onboarding
- **`POST /api/onboarding`** (PDF Seção 8)
  - *Payload*: `{ step: 1|2|3|4, empresaId?: string|null, usuarioId: string, data: Record<string, any> }`
  - *Descrição*: Processa o cadastro progressivo da empresa (Passo 1: Dados básicos e site; Passo 2: Operação e raio; Passo 3: Horários de pico e dias fortes; Passo 4: Conexão Prefiro).
- **`GET /api/auth/meta`** (PDF Seção 9)
  - *Query*: `?empresaId=string`
  - *Descrição*: Redireciona o navegador para o endpoint OAuth oficial do Facebook Login com os escopos `ads_management`, `ads_read`, `business_management`.
- **`GET /api/auth/meta/callback`** (PDF Seção 9)
  - *Query*: `?code=string&state=empresaId`
  - *Descrição*: Processa a troca do código temporário por Access Token de longa duração (60 dias) e salva os ativos da empresa.
- **`GET /api/empresas`**
  - *Descrição*: Retorna todas as empresas cadastradas no tenant com contadores de campanhas e produtos.

### 7.2 Dashboard & Métricas Executivas
- **`GET /api/dashboard/executivo`** (PDF Seções 12, 54, 58, 59, 60)
  - *Query*: `?empresaId=string&period=last_7d|last_30d`
  - *Retorno*: KPIs executivos (Investimento, Faturamento, ROAS Real, CPA Real, Pedidos) e dados do Funil de Conversão (Alcance → Cliques → Visualizações do Cardápio → Início de Pedido → Compras).
- **`GET /api/metricas`** (PDF Seções 60, 71, 73)
  - *Query*: `?empresaId=string&period=last_7d`
  - *Retorno*: Resumo de performance e análise comparativa com o período anterior (`7d_vs_previous_7d`).
- **`GET /api/reconciliation`** (PDF Seções 52 e 53)
  - *Query*: `?empresaId=string`
  - *Retorno*: Relatório comparativo entre Vendas declaradas pela Meta vs Vendas reais faturadas na Prefiro Delivery.
- **`POST /api/reconciliation`** (PDF Seção 53)
  - *Query*: `?empresaId=string`
  - *Descrição*: Executa o motor de reconciliação cruzando os pedidos recebidos com o tráfego de campanhas ativas.

### 7.3 Campanhas com IA
- **`GET /api/campanhas`** (PDF Seção 14)
  - *Query*: `?empresaId=string`
  - *Retorno*: Lista de todas as campanhas da empresa com métricas resumidas e status.
- **`POST /api/campanhas`** (PDF Seções 16, 20)
  - *Payload*: `{ empresaId, nome, orcamentoDiario, publicoDescricao, textoAnuncio, tituloAnuncio, urlDestino, imagemUrl }`
  - *Descrição*: Cria a estrutura completa de 3 níveis na Meta (Campanha → AdSet → Ad).
- **`POST /api/campanhas/interpretar`** (PDF Seção 15)
  - *Payload*: `{ empresaId: string, promptTexto: string }`
  - *Descrição*: Interpreta linguagem natural do empresário (ex: *"Quero vender mais pizza no domingo à noite"*) e extrai estratégia, produto e público ideal.
- **`GET /api/campanhas/orcamento`** (PDF Seção 19)
  - *Query*: `?empresaId=string`
  - *Retorno*: Recomendação inteligente de investimento diário considerando ticket médio, segmento e área atendida.

### 7.4 Catálogo Digital & Campanhas de Cardápio
- **`GET /api/catalogo`** (PDF Seções 28, 29)
  - *Query*: `?empresaId=string`
  - *Retorno*: Estado do catálogo sincronizado, contagem de itens ativos/inativos e lista de produtos.
- **`POST /api/catalogo`** (PDF Seção 29)
  - *Query*: `?empresaId=string`
  - *Descrição*: Força a ingestão imediata do cardápio digital da Prefiro Delivery.
- **`POST /api/catalogo/anunciar/produto`** (PDF Seção 33)
  - *Payload*: `{ empresaId, produtoId, orcamentoDiario }`
  - *Descrição*: Lança campanha focada em promover um item específico do cardápio.
- **`POST /api/catalogo/anunciar/categoria`** (PDF Seção 34)
  - *Payload*: `{ empresaId, categoria, orcamentoDiario }`
  - *Descrição*: Lança campanha focada em uma categoria do cardápio (ex: "Pizzas Doces", "Combos").
- **`POST /api/catalogo/anunciar/cardapio`** (PDF Seção 49, 50)
  - *Payload*: `{ empresaId, orcamentoDiario }`
  - *Descrição*: Cria campanha de Catálogo Dinâmico (DPA) promovendo o cardápio completo com produtos rotativos.

### 7.5 Biblioteca de Criativos & Detecção de Fadiga
- **`GET /api/criativos`** (PDF Seções 35, 39)
  - *Query*: `?empresaId=string`
  - *Retorno*: Galeria de criativos da empresa com métricas de performance e status de fadiga.
- **`POST /api/criativos`** (PDF Seções 35, 37)
  - *Payload*: `{ empresaId, nome, tipo, formato, produtoId, focoEstrategia, textoPrincipal, titulo, urlMidia }`
  - *Descrição*: Cadastra novo ativo de mídia na biblioteca associado a produto ou tema.
- **`GET /api/criativos/fadiga`** (PDF Seção 40)
  - *Query*: `?empresaId=string`
  - *Retorno*: Diagnóstico de saturação e perda de tração de criativos (frequência > 3.5, queda de CTR > 30%, elevação de CPA).

### 7.6 Segmentação de Públicos & LGPD
- **`GET /api/publicos`** (PDF Seção 23)
  - *Query*: `?empresaId=string`
  - *Retorno*: Biblioteca de públicos disponíveis para a empresa.
- **`POST /api/publicos/geografico`** (PDF Seções 21, 22)
  - *Query*: `?empresaId=string`
  - *Descrição*: Cria público geográfico de alta precisão baseado no raio de entrega e na cidade cadastrados no onboarding.
- **`GET /api/publicos/lookalike`** (PDF Seção 26)
  - *Query*: `?empresaId=string`
  - *Retorno*: Verifica elegibilidade da base de compradores para gerar público semelhante (mínimo de 100 clientes únicos).
- **`POST /api/publicos/lookalike`** (PDF Seção 26)
  - *Query*: `?empresaId=string`
  - *Payload*: `{ ratio: number, country: string }`
  - *Descrição*: Cria público Lookalike de 1% a 5% a partir dos clientes da Prefiro Delivery.
- **`POST /api/publicos/sync-clientes`** (PDF Seções 25, 92)
  - *Query*: `?empresaId=string`
  - *Descrição*: Importa clientes da Prefiro Delivery aplicando normalização estrita e criptografia unidirecional **SHA-256** em conformidade com a LGPD antes da sincronização como Custom Audience.

### 7.7 Inteligência Artificial, Copywriting & Assistente
- **`GET /api/minha-ia`** (PDF Seção 13)
  - *Query*: `?empresaId=string`
  - *Retorno*: Visão analítica sintetizada nos 3 grupos: *"Está indo bem"*, *"Precisa de atenção"* e *"Oportunidades"*.
- **`POST /api/copywriting/gerar`** (PDF Seções 36, 37)
  - *Payload*: `{ empresaId, produtoNome, preco, precoPromocional, ganchoEspecial }`
  - *Retorno*: 3 variações estratégicas completas de copy: **Foco no Produto**, **Comodidade/Praticidade** e **Urgência/Promoção**.
- **`POST /api/chat`** (PDF Seções 78 a 82)
  - *Payload*: `{ empresaId: string, mensagem: string, historico?: Array<{ papel: 'usuario'|'ia', texto: string }> }`
  - *Descrição*: Chat conversacional com o gestor de tráfego IA com acesso direto à Memória do Negócio e aos dados de performance da empresa.
- **`GET /api/business-memory`** (PDF Seção 46)
  - *Query*: `?empresaId=string`
  - *Retorno*: Contexto consolidado do negócio formatado para injeção como System Prompt nos modelos de linguagem.

### 7.8 Automações, Guardrails & Aprovações
- **`GET /api/automacoes/config`** (PDF Seção 41)
  - *Query*: `?empresaId=string`
  - *Retorno*: Modo de operação atual (`MANUAL`, `ASSISTIDO`, `AUTOMATICO`) e teto orçamentário diário.
- **`POST /api/automacoes/config`** (PDF Seção 41)
  - *Payload*: `{ empresaId, modo: 'MANUAL'|'ASSISTIDO'|'AUTOMATICO', orcamentoMaxDiario?: number }`
  - *Descrição*: Altera a governança e limites do Policy Engine.
- **`POST /api/automacoes/avaliar`** (PDF Seções 44, 68)
  - *Payload*: `{ empresaId: string }`
  - *Descrição*: Avalia as regras determinísticas ativas contra as métricas mais recentes e agenda ações.
- **`POST /api/automacoes/propor`** (PDF Seção 42)
  - *Payload*: `{ empresaId, tipoAcao, entidadeTipo, entidadeId, valorProposto, motivo }`
  - *Descrição*: Submete uma ação aos guardrails do Policy Engine (ex: trava de 20% de orçamento e janela de 24h).
- **`GET /api/aprovacoes`** (PDF Seção 66)
  - *Query*: `?empresaId=string`
  - *Retorno*: Lista de alterações e aumentos de orçamento pendentes de autorização do gestor.
- **`POST /api/aprovacoes/decidir`** (PDF Seção 66)
  - *Payload*: `{ aprovacaoId: string, decisao: 'APROVAR'|'RECUSAR', motivoRecusa?: string, usuarioId?: string }`
  - *Descrição*: Executa imediatamente a recomendação na Meta em caso de aprovação ou registra recusa na trilha de auditoria.

### 7.9 Auditoria, Alertas & Rastreamento
- **`GET /api/auditoria`** (PDF Seções 64, 65)
  - *Query*: `?empresaId=string&limit=50`
  - *Retorno*: Histórico completo e ordenado de todas as decisões tomadas pela IA, usuário ou automação.
- **`GET /api/alertas`** (PDF Seção 61)
  - *Query*: `?empresaId=string`
  - *Retorno*: Lista de alertas da conta de tráfego ordenados por severidade.
- **`PATCH /api/alertas`** (PDF Seção 61)
  - *Payload*: `{ alertaId: string }`
  - *Descrição*: Marca um alerta específico como lido.
- **`GET /api/score`** (PDF Seções 11, 63)
  - *Query*: `?empresaId=string`
  - *Retorno*: Diagnóstico com Score Geral de 0 a 100, 6 subscores categóricos e auditoria dos 11 itens da conta Meta.
- **`GET /api/tracking`** (PDF Seções 55, 57)
  - *Query*: `?empresaId=string`
  - *Retorno*: Status de funcionamento do Pixel e da Conversion API (CAPI).
- **`POST /api/tracking`** (PDF Seção 56)
  - *Payload*: `{ empresaId, eventName: 'Purchase'|'AddToCart'|'PageView', eventData?: Record<string, any>, userData?: Record<string, any> }`
  - *Descrição*: Despacha evento de servidor via Conversion API (CAPI) para a Meta.
- **`GET /api/relatorios/diario`** (PDF Seção 61)
  - *Query*: `?empresaId=string`
  - *Retorno*: Relatório de fechamento executivo de ontem ("Resumo de Ontem").
- **`GET /api/relatorios/semanal`** (PDF Seção 62)
  - *Query*: `?empresaId=string`
  - *Retorno*: Relatório de consolidação dos últimos 7 dias com plano de ação para a semana seguinte.
- **`GET /api/integracoes`** (PDF Seção 10)
  - *Query*: `?empresaId=string`
  - *Retorno*: Status detalhado de cada componente da integração Meta e Prefiro Delivery.
- **`DELETE /api/integracoes`** (PDF Seção 10)
  - *Query*: `?empresaId=string`
  - *Descrição*: Desconecta e revoga a integração Meta da empresa.

### 7.10 Workers em Background
- **`POST /api/jobs/catalog-sync`** (PDF Seção 70)
  - *Query*: `?empresaId=string` (opcional; sem parâmetro executa varredura global)
  - *Descrição*: Dispara worker de sincronização periódica de catálogo do cardápio.
- **`POST /api/jobs/metrics-sync`** (PDF Seção 70)
  - *Query*: `?empresaId=string` (opcional)
  - *Descrição*: Dispara worker de coleta e cache de métricas de anúncios e conjuntos na Meta.

---

## 8. Documentação Técnica dos Serviços de Domínio (17 Serviços)

Localizados em `src/lib/services`:

### 8.1 `OnboardingService` (`onboarding-service.ts`)
Orquestra o wizard conversacional de 4 passos:
- `processStep(stepData: OnboardingStepData, usuarioId: string): Promise<Empresa>`: Direciona dinamicamente a execução para o passo 1, 2, 3 ou 4.
  - **Passo 1**: Valida nome, cria o registro em `Empresa` persistindo `nome`, `segmento`, `cidade`, `estado`, `site` e vincula o usuário autenticado como `ADMINISTRADOR`.
  - **Passo 2**: Atualiza dados operacionais (`raio_atendimento`, `ticket_medio`, `publico_alvo`, `descricao`).
  - **Passo 3**: Atualiza a Memória do Negócio (`horario_forte_inicio`, `horario_forte_fim`, `dias_fortes`, `produto_mais_vendido`).
  - **Passo 4**: Vincula o `slug_prefiro` e tenta auto-preenchimento silencioso de dados complementares via Prefiro Delivery.

### 8.2 `MetaConnectionService` (`meta-connection-service.ts`)
Controla o ciclo de vida da autenticação com a Meta Marketing API:
- `getOAuthUrl(empresaId: string): string`: Monta a URL oficial do Facebook OAuth com `client_id`, `redirect_uri`, escopos e `state`.
- `handleCallback(code: string, empresaId: string): Promise<any>`: Efetua a troca de código por Access Token e sincroniza Businesses, Ad Accounts, Pages, Instagram e Pixels.
- `getIntegrationStatus(empresaId: string)`: Avalia o estado de cada ativo da integração.
- `disconnect(empresaId: string)`: Remove credenciais com segurança sem apagar histórico analítico.

### 8.3 `TrackingHealthService` (`tracking-health-service.ts`)
Realiza auditoria profunda de saúde do rastreamento (PDF Seções 11, 55, 56, 57, 63):
- `calculateTrafficScore(empresaId: string)`: Calcula o Score de Tráfego Geral (0 a 100) ponderando 6 subscores: Estrutura, Rastreamento, Catálogo, Criativos, Públicos e Histórico.
- `auditAccountStructure(empresaId: string)`: Realiza a checagem dos 11 itens canônicos exigidos na Seção 11 do PDF.
- `dispatchCapiEvent(empresaId: string, event: CapiEventPayload)`: Normaliza dados de compra e despacha evento server-side direto à Conversion API da Meta.

### 8.4 `ExecutiveDashboardService` (`executive-dashboard-service.ts`)
Calcula e entrega os indicadores estratégicos de negócios (PDF Seções 12, 54, 58, 59, 60):
- `getExecutiveOverview(empresaId: string, period: string)`: Retorna faturamento bruto, investimento em mídia, ROAS Real consolidado, ticket médio, custo por aquisição de pedido (CPA Real) e total de vendas.
- `getConversionFunnel(empresaId: string, period: string)`: Monta o funil de 5 etapas com contagem absoluta e taxas de conversão entre etapas.

### 8.5 `CampaignWizardService` (`campaign-wizard-service.ts`)
Facilita a criação assistida de campanhas de tráfego pago:
- `interpretarIntencao(empresaId: string, promptTexto: string)`: Converte texto livre do usuário em estrutura técnica de campanha usando Groq AI.
- `recomendarOrcamento(empresaId: string)`: Calcula valor diário ideal com base no ticket médio do restaurante e raio de alcance.
- `criarCampanhaCompleta(empresaId: string, payload: CreateCampaignDTO)`: Cria a hierarquia completa na Meta e registra no banco local.

### 8.6 `CatalogCampaignService` (`catalog-campaign-service.ts`)
Gerencia o lançamento de anúncios vinculados aos produtos do cardápio:
- `anunciarProduto(params)`: Cria anúncio voltado para promoção de um item individual do cardápio.
- `anunciarCategoria(params)`: Agrupa e anuncia os itens de uma categoria com orçamento compartilhado.
- `anunciarTodoCardapio(params)`: Configura campanha de Catálogo Dinâmico para apresentar produtos automaticamente.

### 8.7 `CatalogIngestionService` (`catalog-ingestion-service.ts`)
Garante que o catálogo do Facebook Commerce Manager esteja sempre idêntico ao cardápio da Prefiro:
- `syncFromPrefiro(empresaId: string)`: Lê produtos via adaptador, atualiza a tabela `MetaProduto` e gera o feed XML formatado de acordo com o padrão exigido pela Meta.

### 8.8 `CustomerAudienceService` (`customer-audience-service.ts`)
Manipula dados de clientes em conformidade com a LGPD (PDF Seções 25, 92):
- `syncCustomersToMetaAudience(empresaId: string)`: Lê compradores da Prefiro Delivery, aplica hash SHA-256 nos telefones e e-mails, e envia para a Meta como Custom Audience identificada como "Meus Clientes".

### 8.9 `LookalikeAndGeoAudienceService` (`lookalike-geo-service.ts`)
Gera públicos semelhantes e geográficos locais:
- `createGeographicAudience(empresaId: string)`: Cria público local cobrindo o raio atendido da pizzaria/restaurante.
- `checkLookalikeEligibility(empresaId: string)`: Verifica se a empresa atingiu a massa crítica de dados para Lookalike.
- `createLookalikeAudience(empresaId: string, options)`: Gera público semelhante de 1% a 5% da base de clientes.

### 8.10 `CreativeFatigueService` (`creative-fatigue-service.ts`)
Protege a conta contra saturação de público e desperdício de verba (PDF Seção 40):
- `analyzeFatigue(empresaId: string)`: Diagnostica anúncios cuja frequência ultrapassou 3.5 com queda acentuada de CTR nos últimos 7 dias, recomendando rotação ou substituição de criativo.
- `createCreative(empresaId: string, dados)`: Cadastra e valida formatos e dimensões de criativos.

### 8.11 `CopywritingService` (`copywriting-service.ts`)
Gera títulos e textos persuasivos com Inteligência Artificial (PDF Seções 36, 37):
- `generateStrategicCopies(params)`: Gera simultaneamente as 3 abordagens recomendadas no documento:
  1. *Foco no Produto*: Detalhes sensoriais e sabor.
  2. *Comodidade e Praticidade*: Agilidade na entrega, comer no conforto de casa.
  3. *Urgência e Escassez*: Promoção por tempo limitado, cupons e ganchos de fim de semana.

### 8.12 `PolicyEngineService` (`policy-engine-service.ts`)
O guardião determinístico de segurança financeira da plataforma (PDF Seções 41 a 45, 64 a 68):
- **Modos de Operação**:
  - `MANUAL`: O sistema apenas reporta dados; nenhuma ação é tomada automaticamente.
  - `ASSISTIDO` (Padrão): A IA detecta oportunidades e formula propostas, mas exige aprovação de 1 clique do gestor.
  - `AUTOMATICO`: A IA pode executar diretamente ações de baixo risco que respeitem estritamente as travas.
- **Guardrails de Proteção**:
  - Limite máximo de alteração de orçamento de até **20%** por ciclo.
  - Janela mínima de espera de **24 horas** entre alterações consecutivas na mesma campanha.
  - Teto diário absoluto de investimento configurado no cadastro da empresa.

### 8.13 `ApprovalsInsightsService` (`approvals-insights-service.ts`)
Centro de controle de decisões e inteligência proativa:
- `obterVisaoMinhaIa(empresaId: string)`: Estrutura os 3 blocos analíticos (Está indo bem, Precisa de atenção, Oportunidades).
- `listarAprovacoesPendentes(empresaId: string)`: Retorna fila de ações aguardando clique de autorização.
- `decidirAprovacao(params)`: Executa a ação na Meta (quando aprovado) e grava o registro na tabela imutável de `Auditoria`.

### 8.14 `AiAssistantService` (`ai-assistant-service.ts`)
Assistente conversacional contextualizado e gerador de relatórios:
- `processarChat(params)`: Responde perguntas do empresário utilizando RAG in-memory com os dados operacionais da empresa.
- `gerarRelatorioDiario(empresaId: string)`: Monta resumo analítico do dia anterior.
- `gerarRelatorioSemanal(empresaId: string)`: Sintetiza os resultados da semana e projeta metas da próxima.

### 8.15 `RealSalesReconciliationService` (`real-sales-service.ts`)
O algoritmo de reconciliação de ROAS Real (PDF Seções 52 e 53):
- Cruza os pedidos faturados pela Prefiro Delivery com os cliques de anúncios da Meta, eliminando discrepâncias de atribuição inflada de 7 dias e calculando o **ROAS Verdadeiro** da operação.

### 8.16 `MetricsQueryService` (`metrics-query-service.ts`)
Serviço de consulta e agregação analítica:
- Agrega métricas diárias, calcula variações percentuais (MoM, WoW) e formata resumos para o dashboard executivo.

### 8.17 `BusinessMemoryService` (`business-memory-service.ts`)
Gerencia o contexto permanente do estabelecimento (PDF Seção 46):
- `getBusinessContext(empresaId: string)`: Retorna horários de pico, dias fortes de venda, raio de entrega e itens líderes de venda.
- `getBusinessContextAsPrompt(empresaId: string)`: Formata esses dados estruturados como System Prompt padronizado para as chamadas à Groq API.

---

## 9. Workers e Processamento em Segundo Plano

Localizados em `src/lib/workers`:
1. **`CatalogSyncWorker` (`catalog-sync-worker.ts`)**:
   - Desenvolvido para ser disparado a cada 1 hora via cron job ou serviço de agendamento HTTP (`POST /api/jobs/catalog-sync`).
   - Itera por todas as empresas com integração Meta ativa, lê o catálogo atualizado da Prefiro Delivery e envia os dados normalizados para a Meta Commerce API.
2. **`MetaMetricsSyncWorker` (`meta-metrics-worker.ts`)**:
   - Desenvolvido para execução a cada 30 minutos (`POST /api/jobs/metrics-sync`).
   - Coleta métricas de campanhas ativas na Meta (alcance, impressões, cliques, investimento) e atualiza a tabela `CampanhaMetrica`, servindo como cache operacional para evitar throttling na Graph API.

---

## 10. Controle de Acesso Baseado em Papéis (RBAC Multi-tenant)

Em conformidade com as **Seções 6 e 7 do PDF**, a matriz de permissões (`src/lib/rbac/permissions.ts`) define rigorosamente o que cada perfil pode realizar:

| Ação / Permissão | ADMINISTRADOR | GESTOR | ANALISTA | CLIENTE | SOMENTE_LEITURA |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Conectar / Desconectar Meta** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Gerenciar Usuários e Acessos** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Configurar Automações e Modos** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Alterar Orçamento de Campanhas** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Aprovar Recomendações da IA** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Criar e Publicar Campanhas** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Gerar Análises e Copies** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Visualizar Relatórios e Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |

O contexto multi-tenant (`src/lib/multitenant/context.ts`) assegura que nenhuma consulta, criação ou edição acesse registros pertencentes a outro `empresa_id`.

---

## 11. Guia Passo a Passo de Implementação e Execução

### 11.1 Pré-requisitos
- **Node.js**: Versão 18.18.0 ou superior (recomendado Node.js 20 LTS).
- **npm** ou **yarn**.

### 11.2 Instalação e Execução Local (Modo Sandbox)
O modo Sandbox permite rodar a plataforma imediatamente sem depender de contas reais da Meta ou chaves de produção:

1. **Clonar o Repositório e Instalar Dependências**:
   ```bash
   git clone <url-do-repositorio>
   cd epic-noether
   npm install
   ```

2. **Configurar o Arquivo de Ambiente**:
   ```bash
   cp .env.example .env
   ```
   *No modo Sandbox inicial, o `.env` já vem pré-configurado com adaptadores locais e banco SQLite (`file:./dev.db`).*

3. **Executar as Migrações do Banco de Dados**:
   ```bash
   npx prisma migrate dev
   ```

4. **Popular Dados Demonstrativos (Seed)**:
   ```bash
   npm run seed
   ```
   *Cria automaticamente a empresa "Pizzaria Bella Napoli", catálogo de pizzas, métricas de 7 dias e recomendações de IA.*

5. **Verificar a Integridade Operacional**:
   ```bash
   npm run check:integrity
   ```

6. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse **[http://localhost:3000](http://localhost:3000)** no navegador.

---

### 11.3 Transição para Ambiente de Produção

Para conectar a plataforma a contas reais da Meta e ao ambiente corporativo:

1. **Configurar o Banco de Dados Relacional (PostgreSQL)**:
   - Em `prisma/schema.prisma`, altere o provider:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - No `.env`, configure a string de conexão PostgreSQL com SSL.
   - Execute:
     ```bash
     npx prisma migrate deploy
     ```

2. **Configurar Chave da Groq AI**:
   - Crie uma conta no [Groq Console](https://console.groq.com/keys).
   - Gere uma API Key e preencha no `.env`:
     ```env
     GROQ_API_KEY="gsk_sua_chave_real_aqui"
     ```

3. **Configurar Aplicativo no Meta for Developers**:
   - Acesse [developers.facebook.com](https://developers.facebook.com) e crie um App do tipo **Negócios (Business)**.
   - Adicione o produto **Marketing API** e **Facebook Login**.
   - Em *Facebook Login > Configurações*, cadastre a URI de redirecionamento:
     `https://seu-dominio.com/api/auth/meta/callback`
   - Preencha as variáveis no `.env`:
     ```env
     ENVIRONMENT="production"
     ACTIVE_META_ADAPTER="production"
     ACTIVE_PREFIRO_ADAPTER="production"
     META_APP_ID="seu_app_id"
     META_APP_SECRET="seu_app_secret"
     META_REDIRECT_URI="https://seu-dominio.com/api/auth/meta/callback"
     META_API_VERSION="v20.0"
     ```

4. **Agendar os Jobs Periódicos**:
   Configure chamadas HTTP automatizadas (via Vercel Cron, AWS EventBridge ou Linux crontab):
   - `POST https://seu-dominio.com/api/jobs/catalog-sync` a cada 60 minutos.
   - `POST https://seu-dominio.com/api/jobs/metrics-sync` a cada 30 minutos.

---

## 12. Garantia de Qualidade (QA), Testes e Integridade

A plataforma conta com uma das mais abrangentes suítes de testes automatizados, cobrindo regras de negócio, adapters, guardrails de segurança, isolamento multi-tenant e tratamento de exceções:

### Comandos de Validação:
- **Executar todos os 96 testes**:
  ```bash
  npm test
  ```
- **Verificar compilação e tipagem estrita TypeScript**:
  ```bash
  npm run typecheck
  ```
- **Auditoria de integridade dos adaptadores**:
  ```bash
  npm run check:integrity
  ```

### Resumo das 21 Suítes de Teste:
1. `tests/task1-multitenant-rbac.test.ts`: Matriz de permissões por perfil e isolamento de tenant.
2. `tests/task2-groq-ai-service.test.ts`: Integração com o SDK Groq e tratamento de rate limits.
3. `tests/task3-adapters.test.ts`: Fábrica de adaptadores (Sandbox e Produção).
4. `tests/task4-onboarding.test.ts`: Fluxo completo de 4 etapas e gravação da Memória do Negócio.
5. `tests/task5-meta-connection.test.ts`: Ciclo OAuth e vinculação de ativos da Meta.
6. `tests/task6-catalog-ingestion.test.ts`: Ingestão de produtos e geração de feed XML.
7. `tests/task7-catalog-sync-worker.test.ts`: Worker de sincronização periódica de produtos.
8. `tests/task8-customer-audiences-lgpd.test.ts`: Anonimização SHA-256 de dados de clientes.
9. `tests/task9-lookalike-geo-audiences.test.ts`: Públicos por raio geográfico e semelhantes.
10. `tests/task10-meta-metrics-cache.test.ts`: Cache de métricas da Graph API.
11. `tests/task11-real-roas-reconciliation.test.ts`: Algoritmo de reconciliação de ROAS Real.
12. `tests/task12-tracking-health-score.test.ts`: Diagnóstico de 11 itens e despacho CAPI.
13. `tests/task13-executive-dashboard.test.ts`: Agregação de KPIs e funil de conversão.
14. `tests/task14-creative-fatigue.test.ts`: Detecção de saturação e alertas de fadiga.
15. `tests/task15-ai-copywriting.test.ts`: Geração das 3 abordagens de copy persuasiva.
16. `tests/task16-campaign-wizard.test.ts`: Criação em 3 níveis (Campanha/AdSet/Ad).
17. `tests/task17-catalog-campaigns.test.ts`: Campanhas de item, categoria e cardápio completo.
18. `tests/task18-policy-guardrails.test.ts`: Trava de 20%, limite de 24h e teto orçamentário.
19. `tests/task19-approvals-insights.test.ts`: Centro de aprovações de 1 clique e visão Minha IA.
20. `tests/task20-assistant-reports-e2e.test.ts`: Assistente conversacional e relatórios executivos.
21. `tests/regression-onboarding-bugs.test.ts`: Testes de regressão garantindo que `empresaId: null` é aceito no passo 1 e persistência do campo `site`.

---

## 13. Matriz de Rastreabilidade com o Documento PDF Guia

| Seção do PDF | Requisito do Documento | Implementação no Código-Fonte | Status |
| :--- | :--- | :--- | :---: |
| **Seções 1 a 7** | Multi-tenant e RBAC com 5 perfis de acesso | `src/lib/rbac/permissions.ts`, `src/lib/multitenant` | Conforme ✅ |
| **Seção 8** | Onboarding guiado em 4 etapas | `src/lib/services/onboarding-service.ts`, `/api/onboarding` | Conforme ✅ |
| **Seções 9 e 10** | Conexão com Meta e Central de Integrações | `src/lib/services/meta-connection-service.ts`, `/api/integracoes` | Conforme ✅ |
| **Seções 11 e 63** | Score de Saúde da Conta e Diagnóstico | `src/lib/services/tracking-health-service.ts`, `/api/score` | Conforme ✅ |
| **Seções 12, 54, 58-60** | Dashboard Executivo e Funil de Vendas | `src/lib/services/executive-dashboard-service.ts`, `/api/dashboard/executivo` | Conforme ✅ |
| **Seção 13** | Visão Minha IA (3 grupos de análise) | `src/lib/services/approvals-insights-service.ts`, `/api/minha-ia` | Conforme ✅ |
| **Seções 14 a 20** | Criação de Campanhas com IA e Orçamento | `src/lib/services/campaign-wizard-service.ts`, `/api/campanhas` | Conforme ✅ |
| **Seções 21 a 27, 92** | Públicos (Geográfico, Clientes SHA-256, Lookalike) | `customer-audience-service.ts`, `lookalike-geo-service.ts` | Conforme ✅ |
| **Seções 28 a 34, 47-50** | Catálogo, Feed XML e Campanhas de Cardápio | `catalog-ingestion-service.ts`, `catalog-campaign-service.ts` | Conforme ✅ |
| **Seções 35 a 40** | Criativos, Formatos e Detecção de Fadiga | `creative-fatigue-service.ts`, `/api/criativos/fadiga` | Conforme ✅ |
| **Seções 41 a 45, 64-68** | Modos de Operação e Policy Engine (Guardrails) | `src/lib/services/policy-engine-service.ts`, `/api/automacoes` | Conforme ✅ |
| **Seção 46** | Memória do Negócio para Contexto de IA | `src/lib/services/business-memory-service.ts`, `/api/business-memory` | Conforme ✅ |
| **Seções 51 a 53** | Reconciliação de Vendas e ROAS Real Prefiro vs Meta | `src/lib/services/real-sales-service.ts`, `/api/reconciliation` | Conforme ✅ |
| **Seções 55 a 57** | Rastreamento (Pixel e Conversion API / CAPI) | `src/lib/services/tracking-health-service.ts`, `/api/tracking` | Conforme ✅ |
| **Seções 61 e 62** | Relatórios Executivos (Diário e Semanal) | `src/lib/services/ai-assistant-service.ts`, `/api/relatorios/*` | Conforme ✅ |
| **Seção 66** | Centro de Aprovações de 1 Clique | `src/lib/services/approvals-insights-service.ts`, `/api/aprovacoes` | Conforme ✅ |
| **Seções 70 e 71** | Sincronização Periódica e Cache de Métricas | `src/lib/workers/*`, `/api/jobs/*` | Conforme ✅ |
| **Seções 74 a 77** | Central de Alertas e Anomalias | `src/lib/services/ai-assistant-service.ts`, `/api/alertas` | Conforme ✅ |
| **Seções 78 a 82** | Chat com IA / Assistente Conversacional | `src/lib/services/ai-assistant-service.ts`, `/api/chat` | Conforme ✅ |
| **Seções 88 e 89** | Princípios de Interface e Nomenclatura Descomplicada | Design Canny 100% Light Mode, pílulas e termos em português claro | Conforme ✅ |

---

## Licença e Autoria
Desenvolvido sob estrita conformidade com os requisitos da **Plataforma de Gestão de Tráfego com Inteligência Artificial para Delivery**. Código limpo, modular, testado e pronto para homologação e deploy em produção.



