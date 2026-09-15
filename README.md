# 🚀 Plataforma de Gestão de Tráfego com Inteligência Artificial — Prefiro Delivery

[![PHP Version](https://img.shields.io/badge/PHP-8.3%2B-777BB4?style=flat-square&logo=php&logoColor=white)](https://www.php.net/)
[![Laravel Version](https://img.shields.io/badge/Laravel-11%20%2F%2013-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5%2B-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2-9553E9?style=flat-square&logo=inertia&logoColor=white)](https://inertiajs.com/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20SQLite-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tests](https://img.shields.io/badge/Tests-30%20Passing%20(86%20Assertions)-10B981?style=flat-square&logo=phpunit&logoColor=white)]()

Plataforma inteligente de gestão, automação e auditoria de tráfego pago no **Meta Ads** desenvolvida especificamente para o ecossistema de restaurantes e deliverys da **Prefiro Delivery**, conforme o documento de requisitos do produto (PRD) de 59 páginas.

> ℹ️ **Stack Oficial:** Este projeto foi integralmente transcrito e validado para a stack oficial exigida pela **Prefiro Delivery**: **PHP 8.3**, **Laravel**, **MySQL / SQLite**, **Vue.js 3** e **Git**. A versão legada em Next.js encontra-se preservada no histórico git sob a tag [`v1.0-nextjs`](https://github.com/remixxlf/Ai_traffic_prefiro/releases/tag/v1.0-nextjs).

---

## 📑 Sumário

1. [Destaques do Negócio & Regras do PRD](#-destaques-do-negócio--regras-do-prd)
2. [Arquitetura & Stack Tecnológica](#-arquitetura--stack-tecnológica)
3. [Modelagem do Banco de Dados (26 Tabelas)](#-modelagem-do-banco-de-dados-26-tabelas)
4. [Serviços Centrais de Negócio (app/Services)](#-serviços-centrais-de-negócio-appservices)
5. [Frontend Vue 3 (Canny Light Mode)](#-frontend-vue-3-canny-light-mode)
6. [Garantia de Qualidade & Testes Automatizados (Q.A.)](#-garantia-de-qualidade--testes-automatizados-qa)
7. [Instalação & Execução Passo a Passo](#-instalação--execução-passo-a-passo)
8. [Estrutura do Repositório](#-estrutura-do-repositório)

---

## 🎯 Destaques do Negócio & Regras do PRD

A plataforma resolve dores críticas de restaurantes parceiros que investem em anúncios no Meta Ads:

- **Reconciliação de ROAS Real (Seção 49 do PRD):** Cruza eventos de clique e CAPI com vendas e pedidos reais faturados no Prefiro Delivery, revelando o retorno real sobre investimento (ROAS Real) e custo de aquisição (CPA Real) sem a subnotificação usual de cookies do Meta.
- **Policy Engine & Travas de Segurança (Seções 18 e 51):** O motor de regras impede alterações bruscas. Nenhuma automação ou operador pode alterar o orçamento diário em mais de **20% por ação**, respeitando um **cooldown obrigatório de 24 horas** e o teto diário fixado pelo restaurante.
- **Detecção de Fadiga Criativa (Seção 51):** Monitora criativos ativamente. Avisa ou pausa anúncios cuja frequência ultrapassa **3.5** ou cuja taxa de cliques (CTR) sofra **queda superior a 25%**.
- **Onboarding Guiado em 4 Etapas (Seção 8):** Cadastro do estabelecimento incluindo segmento, **URL do restaurante/site**, raio de atendimento (km), ticket médio, horários de pico noturno/almoço, integração com Business Manager/Pixel e modo de operação (Assistido vs Piloto Automático).
- **IA Especialista em Delivery (Groq Llama 3.3 70B):** Gera recomendações de escala e corte de custos com persona treinada para delivery, cálculo de impacto estimado, grau de confiança e modo de aprovação humana assistida.

---

## 🛠️ Arquitetura & Stack Tecnológica

| Componente | Tecnologia | Papel no Sistema |
| :--- | :--- | :--- |
| **Linguagem & Backend** | **PHP 8.3+** & **Laravel 11 / 13** | APIs REST, regras de negócio, Policy Engine e roteamento |
| **SPA Framework** | **Vue.js 3.5+ (Composition API)** | Componentes reativos, validações em tempo real |
| **Camada de Ligação** | **Inertia.js v2** | Integração SPA monolítica fluida, sem overhead de GraphQL ou JWT |
| **Banco de Dados** | **MySQL 8.0+** (Prod) / **SQLite** (Dev/Test) | Persistência relacional estrita com Foreign Keys em cascata |
| **Estilização** | **Tailwind CSS** | Design System Canny Light Mode com Royal Indigo (`#4F46E5`) |
| **Motor de IA** | **Groq API (Llama 3.3 70B Versatile)** | Análise preditiva com schema JSON estrito e fallback offline |
| **Ícones** | **Lucide Icons** | Iconografia moderna e semântica |

---

## 🗄️ Modelagem do Banco de Dados (26 Tabelas)

Mapeamento de 100% da Seção 72 do PRD em `database/migrations/2026_09_15_000003_create_traffic_platform_tables.php`:

1. **`empresa`**: Raiz multi-tenant (nome, site, raio_atendimento, ticket_medio, modo_operacao, orcamento_max_diario).
2. **`empresa_usuario`**: Controle de acesso RBAC (ADMINISTRADOR, GESTOR_TRAFEGO, OPERADOR, LEITURA).
3. **`integracao_meta`**: Tokens OAuth, status e sincronização da Graph API.
4. **`meta_business`**: Gerenciador de Negócios (Business Manager).
5. **`meta_ad_account`**: Conta de anúncios e saúde financeira.
6. **`meta_page`**: Páginas do Facebook conectadas.
7. **`meta_instagram`**: Perfis profissionais do Instagram vinculados.
8. **`meta_pixel`**: Pixel do Meta Ads com flag de CAPI e eventos de compra.
9. **`meta_catalogo`**: Catálogo de produtos do delivery sincronizado via feed XML.
10. **`meta_produto`**: Itens do cardápio (hambúrgueres, combos, pizzas, bebidas).
11. **`campanha`**: Campanhas veiculadas no Meta Ads.
12. **`conjunto_anuncio`**: Conjuntos com segmentações e horários de pico.
13. **`criativo`**: Mídias (vídeos 9:16, banners 1:1), copies, CTA e métricas agregadas.
14. **`anuncio`**: Anúncios pontuais com flag de detecção de fadiga.
15. **`publico`**: Segmentações geográficas no raio de entrega e lookalike.
16. **`campanha_metrica`**: Métricas diárias + reconciliação (pedidos_reais, receita_real, roas_real, cpa_real).
17. **`conjunto_metrica`**: Métricas no nível de conjunto.
18. **`anuncio_metrica`**: Métricas no nível de anúncio.
19. **`produto_metrica`**: Desempenho individual dos itens do cardápio nos anúncios.
20. **`recomendacao_ia`**: Recomendações geradas pela IA (tipo, análise, motivo, ação sugerida, risco).
21. **`automacao`**: Regras automáticas configuradas (ex: proteção anti-fadiga).
22. **`automacao_execucao`**: Histórico e status de execuções automatizadas.
23. **`aprovacao`**: Workflow de aprovação humana no Modo Assistido.
24. **`alerta`**: Notificações críticas de saturação de público e pixel.
25. **`auditoria`**: Trilha de auditoria e compliance (LGPD e alterações orçamentárias).
26. **`users`**: Autenticação nativa do Laravel.

---

## ⚙️ Serviços Centrais de Negócio (`app/Services`)

- **`PolicyEngineService`**: Proteção contra queima indevida de verba. Trava aumentos/reduções que excedam 20% do orçamento anterior, impõe 24h de cooldown entre alterações e bloqueia valores superiores ao teto diário da empresa.
- **`RealSalesReconciliationService`**: Cruza dados de vendas reais faturadas no Prefiro Delivery com os dados reportados pelo Meta Ads, calculando o **ROAS Real** (`receita_real / investimento`), o **CPA Real** (`investimento / pedidos_reais`) e o nível de confiança da atribuição.
- **`CreativeFatigueService`**: Avalia frequência e taxa de cliques dos anúncios. Identifica criativos saturados e sinaliza para pausa preventiva imediata.
- **`OnboardingService`**: Processamento e validação dos 4 passos do wizard inicial, garantindo a gravação do site do restaurante e parâmetros de operação.
- **`GroqAIService`**: Conexão com o modelo `llama-3.3-70b-versatile` via Groq com schema JSON estruturado e fallback analítico inteligente para execução offline.
- **`AudienceService`**: Normalização e hash criptográfico **SHA-256** de dados de clientes (e-mails e telefones) em estrita conformidade com a LGPD.
- **`TrackingService`**: Geração padronizada de URLs com parâmetros UTM (`utm_source=meta`, `utm_medium=cpc`, `utm_campaign`, `utm_term`, `utm_content`).

---

## 🎨 Frontend Vue 3 (Canny Light Mode)

Interface desenvolvida sob as diretrizes de design do ecossistema moderno:

- **Tema 100% Light Mode:** Fundo Slate 50 (`#F8FAFC`), cartões em branco puro (`#FFFFFF`) e bordas suaves (`#E2E8F0`).
- **Cor Primária:** Royal Indigo (`#4F46E5`), transmitindo autoridade e tecnologia.
- **Páginas Criadas:**
  - `Onboarding/Wizard.vue`: Setup em 4 passos com validação em tempo real e campo `site`.
  - `Dashboard/Index.vue`: KPIs principais (Investimento, Pedidos Reais, ROAS Real, CPA Real), tabela histórica dos últimos 7 dias, criativos em destaque e recomendações de IA.
  - `Campaigns/Index.vue`: Gestão de campanhas com modal de ajuste orçamentário protegido pelo Policy Engine.
  - `CreativeFatigue/Index.vue`: Monitor de saturação de criativos e botão de pausa de emergência.
  - `Automation/Index.vue`: Central de decisões humanas para o Modo Assistido e gatilho de análise da IA.
  - `Reconciliation/Index.vue`: Auditoria de divergências e sincronização com o Prefiro Delivery.

---

## 🧪 Garantia de Qualidade & Testes Automatizados (Q.A.)

Todos os serviços e endpoints foram desenvolvidos seguindo **Test-Driven Development (TDD)**:

```bash
php artisan test
```

**Resultado dos Testes:**
```text
   PASS  Tests\Unit\ExampleTest
   PASS  Tests\Unit\Services\AudienceAndTrackingServiceTest
   PASS  Tests\Unit\Services\CreativeFatigueServiceTest
   PASS  Tests\Unit\Services\GroqAIServiceTest
   PASS  Tests\Unit\Services\OnboardingServiceTest
   PASS  Tests\Unit\Services\PolicyEngineServiceTest
   PASS  Tests\Unit\Services\RealSalesReconciliationServiceTest
   PASS  Tests\Feature\ExampleTest
   PASS  Tests\Feature\PlatformEndpointsTest

  Tests:    30 passed (86 assertions)
  Duration: 1.05s
```

### Build dos Assets Frontend:
```bash
npm run build
```
Compilação Vite 6 com Vue 3 e Tailwind CSS executada com 100% de sucesso.

---

## 🚀 Instalação & Execução Passo a Passo

### Pré-requisitos
- PHP 8.3 ou superior (com extensões `curl`, `fileinfo`, `intl`, `mbstring`, `openssl`, `pdo_mysql` ou `pdo_sqlite`)
- Composer 2.7+
- Node.js 20+ e npm

### 1. Clonar o Repositório
```bash
git clone https://github.com/remixxlf/Ai_traffic_prefiro.git
cd Ai_traffic_prefiro
```

### 2. Instalar Dependências do PHP e Node
```bash
composer install
npm install
```

### 3. Configurar o Ambiente (.env)
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Executar Migrações e Seeders (Banco de Dados de Demonstração)
```bash
# Cria as 26 tabelas e alimenta com dados reais de restaurante modelo (Burger Mania)
php artisan migrate --seed
```

### 5. Executar os Testes Automatizados
```bash
php artisan test
```

### 6. Iniciar o Servidor de Desenvolvimento
Em um terminal:
```bash
npm run dev
```

Em outro terminal:
```bash
php artisan serve
```

Acesse no navegador: **`http://localhost:8000`**

---

## 📂 Estrutura do Repositório

```text
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Onboarding, Dashboard, Campaign, Fatigue, Automation, Reconciliation
│   │   └── Middleware/        # HandleInertiaRequests
│   ├── Models/                # 26 Modelos Eloquent mapeados
│   └── Services/              # 17 Serviços de Negócio (Policy Engine, ROAS Real, Fadiga, etc.)
├── database/
│   ├── migrations/            # Migrações das 26 tabelas com foreign keys estritas
│   └── seeders/               # DatabaseSeeder com dados do restaurante modelo Burger Mania
├── resources/
│   ├── css/                   # Tailwind CSS Theme
│   ├── js/
│   │   ├── Layouts/           # AppLayout (Sidebar, Navbar, Status CAPI)
│   │   ├── Pages/             # Páginas Inertia Vue 3 (Dashboard, Onboarding, Campaigns, etc.)
│   │   └── app.js             # Bootstrap do Inertia + Vue
│   └── views/
│       └── app.blade.php      # Layout raiz do Blade
├── routes/
│   ├── api.php                # Endpoints da API REST
│   └── web.php                # Rotas Web do Inertia
├── tests/
│   ├── Feature/               # Testes ponta a ponta dos endpoints e rotas
│   └── Unit/                  # Testes unitários com TDD dos serviços
├── reference-nextjs/          # Backup de referência da versão Next.js (arquivada na tag v1.0-nextjs)
└── README.md                  # Documentação completa do projeto
```

---

## 🔒 Conformidade LGPD & Segurança

- **Hashes Criptográficos:** Dados sensíveis de clientes (e-mails e números de telefone) são irreversivelmente processados com SHA-256 antes de qualquer envio de públicos personalizados ao Meta.
- **Trilha de Auditoria:** Qualquer ação executada pela IA ou pelo operador que modifique orçamentos, status de campanhas ou modos de operação é registrada na tabela `auditoria` com valores anteriores e novos.
- **Modo de Operação Assistido:** Por padrão, ações de alto impacto (alteração de orçamentos e substituição de criativos fadigados) dependem de aprovação prévia do gestor do restaurante.

---

Desenvolvido para o processo de avaliação técnica e operacional da **Prefiro Delivery**.
