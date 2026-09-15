# Especificação Técnica e Design — Plataforma de Gestão de Tráfego com IA

- **Data**: 2026-09-14
- **Status**: Em Revisão / Aguardando Aprovação
- **Documento de Origem**: `C:\Users\Filipe\Downloads\Plataforma de Gestão de Tráfego com Inteligência Artificial.pdf`

---

## 1. Visão Arquitetural

A plataforma é um SaaS B2B Multi-tenant que funciona como um "Gestor de Tráfego com Inteligência Artificial", integrando nativamente dados de negócio e delivery (Prefiro Delivery) com a infraestrutura de anúncios da Meta (Meta Marketing API).

### Decisões Tecnológicas Acordadas:
- **Linguagem & Framework**: Next.js 14+ (App Router, Server Actions / API Routes, TypeScript, Tailwind CSS).
- **Provedor de IA**: **Groq API** (`groq-sdk`, modelo padrão `llama-3.3-70b-versatile` para análises profundas e `llama-3.1-8b-instant` para tarefas auxiliares).
- **Banco de Dados**: Prisma ORM com SQLite para o ambiente local/sandbox de desenvolvimento sem atrito e PostgreSQL configurável para produção.
- **Ambiente de Desenvolvimento**: Sandbox completo com adaptadores e geradores de dados realistas (Meta Ads Sandbox & Prefiro Delivery Sandbox), com troca em uma única variável de ambiente (`ACTIVE_ADAPTER_ENV=sandbox|production`).
- **Validação com PDF**: Cada task será rigorosamente checada contra as 98 seções do documento antes do desenvolvimento.

---

## 2. Mapa das 20 Etapas Lógicas (Tasks)

| Task | Título | Seções Chave do PDF |
|---|---|---|
| **Task 1** | Fundação Multi-tenant, Schema Prisma & RBAC | 6, 7, 72 |
| **Task 2** | Setup do Motor de IA com Groq SDK & Schemas Zod | 1, 45, 74 |
| **Task 3** | Camada de Adaptadores Sandbox / Produção (Meta & Prefiro) | 9, 24, 71, 91 |
| **Task 4** | Onboarding Guiado e Memória do Negócio | 5, 8, 46, 88, 89 |
| **Task 5** | Conexão Meta OAuth, Ativos & Central de Integrações | 9, 10, 91 |
| **Task 6** | Parser e Ingestão de Catálogo Prefiro XML | 28, 29, 30, 31 |
| **Task 7** | Worker de Sincronização Periódica de Catálogo com Meta Commerce | 29, 30, 32, 70 |
| **Task 8** | Governança LGPD, Hashing & Custom Audiences | 21, 24, 25, 92 |
| **Task 9** | Automação de Lookalikes e Públicos Geográficos | 21, 22, 23, 26 |
| **Task 10** | Worker de Métricas da Meta & Snapshots Analíticos (Cache) | 70, 71, 73 |
| **Task 11** | Ingestão de Vendas Prefiro & Motor de ROAS Real | 52, 53, 73 |
| **Task 12** | Diagnóstico de Saúde da Conta, Pixel e CAPI | 11, 55, 56, 57, 63 |
| **Task 13** | Dashboard Executivo de Negócio & Funil de Conversão | 12, 54, 58, 59, 60, 88, 89 |
| **Task 14** | Biblioteca de Criativos & Módulo de Detecção de Fadiga | 35, 37, 39, 40 |
| **Task 15** | Motor de Copywriting IA (Groq) & 3 Variações Estratégicas | 36, 37, 88 |
| **Task 16** | Wizard Guiado de Criação de Campanhas de Vendas | 2, 5, 14, 15, 16, 18, 19, 20 |
| **Task 17** | Campanhas de Catálogo Dinâmico do Prefiro Delivery | 33, 34, 83, 84, 85 |
| **Task 18** | Policy Engine, Guardrails de Segurança & Níveis de Automação | 41, 42, 43, 44, 76, 77 |
| **Task 19** | "Minha IA", Centro de Aprovações & Histórico Auditável | 13, 62, 64, 65, 66, 75 |
| **Task 20** | Chat IA, Alertas, Relatórios Automatizados & Homologação E2E | 47, 48, 49, 50, 51, 61, 67, 90, 95 |

---

## 3. Estratégia de Execução e Preservação de Contexto

1. **Isolamento de Tasks**: Cada task possui escopo fechado, critérios de aceite e testes automatizados.
2. **Transparência**: Ao iniciar cada task, o agente citará as seções exatas do PDF que balizam aquela entrega.
3. **Produção**: O código será entregue limpo, com tipagem forte, comentários arquiteturais e documentação de transição para o cliente final do freela.
