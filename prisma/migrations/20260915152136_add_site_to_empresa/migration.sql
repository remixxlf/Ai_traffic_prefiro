-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "slug_prefiro" TEXT,
    "segmento" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "site" TEXT,
    "raio_atendimento" REAL,
    "ticket_medio" REAL,
    "produtos_chave" TEXT,
    "descricao" TEXT,
    "publico_alvo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "horario_forte_inicio" TEXT,
    "horario_forte_fim" TEXT,
    "dias_fortes" TEXT,
    "produto_mais_vendido" TEXT,
    "modo_operacao" TEXT NOT NULL DEFAULT 'ASSISTIDO',
    "orcamento_max_diario" REAL DEFAULT 500.0
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "empresa_usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMINISTRADOR',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "empresa_usuario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "empresa_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integracao_meta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "token_expires_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CONECTADO',
    "meta_user_id" TEXT,
    "last_sync_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "integracao_meta_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meta_business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONECTADO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meta_business_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meta_ad_account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "account_health" INTEGER NOT NULL DEFAULT 100,
    "payment_method_ok" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meta_ad_account_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meta_page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_page_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_connected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meta_page_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meta_instagram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_instagram_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "is_connected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meta_instagram_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meta_pixel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_pixel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "last_event_at" DATETIME,
    "has_purchase" BOOLEAN NOT NULL DEFAULT false,
    "has_add_to_cart" BOOLEAN NOT NULL DEFAULT false,
    "capi_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meta_pixel_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meta_catalogo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_catalog_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "feed_url" TEXT,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "active_products" INTEGER NOT NULL DEFAULT 0,
    "error_products" INTEGER NOT NULL DEFAULT 0,
    "last_sync_at" DATETIME,
    "next_sync_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SINCRONIZADO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meta_catalogo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meta_produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "catalogo_id" TEXT,
    "external_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "preco_promocional" REAL,
    "disponibilidade" BOOLEAN NOT NULL DEFAULT true,
    "categoria" TEXT,
    "url_produto" TEXT,
    "url_imagem" TEXT,
    "marca" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "meta_produto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meta_produto_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "meta_catalogo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "campanha" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_campaign_id" TEXT,
    "nome" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL DEFAULT 'OUTCOME_SALES',
    "status" TEXT NOT NULL DEFAULT 'PAUSED',
    "orcamento_diario" REAL,
    "orcamento_total" REAL,
    "tipo_anuncio" TEXT NOT NULL DEFAULT 'PADRAO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "campanha_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conjunto_anuncio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "campanha_id" TEXT NOT NULL,
    "meta_adset_id" TEXT,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAUSED',
    "orcamento_diario" REAL,
    "publico_alvo_desc" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "conjunto_anuncio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conjunto_anuncio_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanha" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "anuncio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "conjunto_anuncio_id" TEXT NOT NULL,
    "criativo_id" TEXT,
    "meta_ad_id" TEXT,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAUSED',
    "fadiga_detectada" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "anuncio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "anuncio_conjunto_anuncio_id_fkey" FOREIGN KEY ("conjunto_anuncio_id") REFERENCES "conjunto_anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "anuncio_criativo_id_fkey" FOREIGN KEY ("criativo_id") REFERENCES "criativo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "criativo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_creative_id" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'IMAGEM',
    "formato" TEXT DEFAULT '1:1',
    "produto_id" TEXT,
    "categoria" TEXT,
    "tags" TEXT,
    "texto_principal" TEXT,
    "titulo" TEXT,
    "descricao" TEXT,
    "cta" TEXT DEFAULT 'ORDER_NOW',
    "url_midia" TEXT,
    "foco_estrategia" TEXT,
    "status_fadiga" TEXT NOT NULL DEFAULT 'SAUDAVEL',
    "impressoes" INTEGER NOT NULL DEFAULT 0,
    "cliques" INTEGER NOT NULL DEFAULT 0,
    "ctr" REAL NOT NULL DEFAULT 0.0,
    "frequencia" REAL NOT NULL DEFAULT 1.0,
    "conversoes" INTEGER NOT NULL DEFAULT 0,
    "cpa" REAL NOT NULL DEFAULT 0.0,
    "roas" REAL NOT NULL DEFAULT 0.0,
    "investimento" REAL NOT NULL DEFAULT 0.0,
    "receita" REAL NOT NULL DEFAULT 0.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "criativo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "criativo_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "meta_produto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "publico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "meta_audience_id" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "origem" TEXT,
    "descricao" TEXT,
    "tamanho_estimado" INTEGER,
    "cidade" TEXT,
    "raio_km" REAL,
    "idade_min" INTEGER DEFAULT 18,
    "idade_max" INTEGER DEFAULT 65,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "publico_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "campanha_metrica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campanha_id" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "investimento" REAL NOT NULL DEFAULT 0.0,
    "impressoes" INTEGER NOT NULL DEFAULT 0,
    "alcance" INTEGER NOT NULL DEFAULT 0,
    "cliques" INTEGER NOT NULL DEFAULT 0,
    "ctr" REAL NOT NULL DEFAULT 0.0,
    "cpc" REAL NOT NULL DEFAULT 0.0,
    "cpm" REAL NOT NULL DEFAULT 0.0,
    "frequencia" REAL NOT NULL DEFAULT 0.0,
    "conversoes" INTEGER NOT NULL DEFAULT 0,
    "vendas" INTEGER NOT NULL DEFAULT 0,
    "receita" REAL NOT NULL DEFAULT 0.0,
    "cpa" REAL NOT NULL DEFAULT 0.0,
    "roas" REAL NOT NULL DEFAULT 0.0,
    "pedidos_reais" INTEGER NOT NULL DEFAULT 0,
    "receita_real" REAL NOT NULL DEFAULT 0.0,
    "roas_real" REAL NOT NULL DEFAULT 0.0,
    "cpa_real" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "campanha_metrica_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanha" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conjunto_metrica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conjunto_anuncio_id" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "investimento" REAL NOT NULL DEFAULT 0.0,
    "cliques" INTEGER NOT NULL DEFAULT 0,
    "conversoes" INTEGER NOT NULL DEFAULT 0,
    "cpa" REAL NOT NULL DEFAULT 0.0,
    "roas" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "conjunto_metrica_conjunto_anuncio_id_fkey" FOREIGN KEY ("conjunto_anuncio_id") REFERENCES "conjunto_anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "anuncio_metrica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anuncio_id" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "investimento" REAL NOT NULL DEFAULT 0.0,
    "impressoes" INTEGER NOT NULL DEFAULT 0,
    "cliques" INTEGER NOT NULL DEFAULT 0,
    "ctr" REAL NOT NULL DEFAULT 0.0,
    "frequencia" REAL NOT NULL DEFAULT 0.0,
    "cpa" REAL NOT NULL DEFAULT 0.0,
    "roas" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "anuncio_metrica_anuncio_id_fkey" FOREIGN KEY ("anuncio_id") REFERENCES "anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "produto_metrica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produto_id" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "vendas" INTEGER NOT NULL DEFAULT 0,
    "receita" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "produto_metrica_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "meta_produto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recomendacao_ia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "entidade_tipo" TEXT NOT NULL,
    "entidade_id" TEXT,
    "titulo" TEXT NOT NULL,
    "analise" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "acao_sugerida" TEXT NOT NULL,
    "impacto_prev" TEXT,
    "nivel_confianca" REAL NOT NULL DEFAULT 0.9,
    "risco" TEXT NOT NULL DEFAULT 'BAIXO',
    "status" TEXT NOT NULL DEFAULT 'NOVA',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed_at" DATETIME,
    CONSTRAINT "recomendacao_ia_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "automacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "condicao" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automacao_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "automacao_execucao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "automacao_id" TEXT NOT NULL,
    "alvo_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCESSO',
    "detalhes" TEXT,
    "executed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automacao_execucao_automacao_id_fkey" FOREIGN KEY ("automacao_id") REFERENCES "automacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "aprovacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "recomendacao_id" TEXT,
    "usuario_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "acao_tipo" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "motivo_recusa" TEXT,
    "decidido_em" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "aprovacao_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "aprovacao_recomendacao_id_fkey" FOREIGN KEY ("recomendacao_id") REFERENCES "recomendacao_ia" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "aprovacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alerta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'ATENCAO',
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alerta_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "origem" TEXT NOT NULL,
    "entidade_tipo" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "campo" TEXT,
    "valor_anterior" TEXT,
    "valor_novo" TEXT,
    "motivo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditoria_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_slug_prefiro_key" ON "empresa"("slug_prefiro");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_usuario_empresa_id_usuario_id_key" ON "empresa_usuario"("empresa_id", "usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "meta_produto_empresa_id_external_id_key" ON "meta_produto"("empresa_id", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "campanha_meta_campaign_id_key" ON "campanha"("meta_campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "conjunto_anuncio_meta_adset_id_key" ON "conjunto_anuncio"("meta_adset_id");

-- CreateIndex
CREATE UNIQUE INDEX "anuncio_meta_ad_id_key" ON "anuncio"("meta_ad_id");

-- CreateIndex
CREATE UNIQUE INDEX "campanha_metrica_campanha_id_data_key" ON "campanha_metrica"("campanha_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "conjunto_metrica_conjunto_anuncio_id_data_key" ON "conjunto_metrica"("conjunto_anuncio_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "anuncio_metrica_anuncio_id_data_key" ON "anuncio_metrica"("anuncio_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "produto_metrica_produto_id_data_key" ON "produto_metrica"("produto_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "aprovacao_recomendacao_id_key" ON "aprovacao"("recomendacao_id");
