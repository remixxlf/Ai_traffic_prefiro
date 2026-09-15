<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Empresa (Tenant Root)
        Schema::create('empresa', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->string('slug_prefiro')->nullable()->unique();
            $table->string('segmento')->nullable();
            $table->string('cidade')->nullable();
            $table->string('estado')->nullable();
            $table->string('site')->nullable();
            $table->double('raio_atendimento')->nullable();
            $table->double('ticket_medio')->nullable();
            $table->text('produtos_chave')->nullable();
            $table->text('descricao')->nullable();
            $table->text('publico_alvo')->nullable();
            $table->string('horario_forte_inicio')->nullable();
            $table->string('horario_forte_fim')->nullable();
            $table->string('dias_fortes')->nullable();
            $table->string('produto_mais_vendido')->nullable();
            $table->string('modo_operacao')->default('ASSISTIDO');
            $table->double('orcamento_max_diario')->default(500.0);
            $table->timestamps();
        });

        // 2. EmpresaUsuario (Pivot RBAC)
        Schema::create('empresa_usuario', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->unsignedBigInteger('user_id');
            $table->string('role')->default('ADMINISTRADOR');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['empresa_id', 'user_id']);
        });

        // 3. IntegracaoMeta
        Schema::create('integracao_meta', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->text('access_token');
            $table->timestamp('token_expires_at')->nullable();
            $table->string('status')->default('CONECTADO');
            $table->string('meta_user_id')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 4. MetaBusiness
        Schema::create('meta_business', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_business_id');
            $table->string('name');
            $table->string('status')->default('CONECTADO');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 5. MetaAdAccount
        Schema::create('meta_ad_account', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_account_id');
            $table->string('name');
            $table->string('currency')->default('BRL');
            $table->string('timezone')->default('America/Sao_Paulo');
            $table->string('status')->default('ACTIVE');
            $table->integer('account_health')->default(100);
            $table->boolean('payment_method_ok')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 6. MetaPage
        Schema::create('meta_page', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_page_id');
            $table->string('name');
            $table->boolean('is_connected')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 7. MetaInstagram
        Schema::create('meta_instagram', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_instagram_id');
            $table->string('username');
            $table->boolean('is_connected')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 8. MetaPixel
        Schema::create('meta_pixel', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_pixel_id');
            $table->string('name');
            $table->string('status')->default('ATIVO');
            $table->timestamp('last_event_at')->nullable();
            $table->boolean('has_purchase')->default(false);
            $table->boolean('has_add_to_cart')->default(false);
            $table->boolean('capi_enabled')->default(false);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 9. MetaCatalogo
        Schema::create('meta_catalogo', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_catalog_id');
            $table->string('name');
            $table->text('feed_url')->nullable();
            $table->integer('total_products')->default(0);
            $table->integer('active_products')->default(0);
            $table->integer('error_products')->default(0);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamp('next_sync_at')->nullable();
            $table->string('status')->default('SINCRONIZADO');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 10. MetaProduto
        Schema::create('meta_produto', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('catalogo_id')->nullable();
            $table->string('external_id');
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->double('preco');
            $table->double('preco_promocional')->nullable();
            $table->boolean('disponibilidade')->default(true);
            $table->string('categoria')->nullable();
            $table->text('url_produto')->nullable();
            $table->text('url_imagem')->nullable();
            $table->string('marca')->nullable();
            $table->string('status')->default('ATIVO');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
            $table->foreign('catalogo_id')->references('id')->on('meta_catalogo')->nullOnDelete();
            $table->unique(['empresa_id', 'external_id']);
        });

        // 11. Campanha
        Schema::create('campanha', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_campaign_id')->nullable()->unique();
            $table->string('nome');
            $table->string('objetivo')->default('OUTCOME_SALES');
            $table->string('status')->default('PAUSED');
            $table->double('orcamento_diario')->nullable();
            $table->double('orcamento_total')->nullable();
            $table->string('tipo_anuncio')->default('PADRAO');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 12. ConjuntoAnuncio
        Schema::create('conjunto_anuncio', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('campanha_id');
            $table->string('meta_adset_id')->nullable()->unique();
            $table->string('nome');
            $table->string('status')->default('PAUSED');
            $table->double('orcamento_diario')->nullable();
            $table->text('publico_alvo_desc')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
            $table->foreign('campanha_id')->references('id')->on('campanha')->cascadeOnDelete();
        });

        // 13. Criativo
        Schema::create('criativo', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_creative_id')->nullable();
            $table->string('nome');
            $table->string('tipo')->default('IMAGEM');
            $table->string('formato')->default('1:1');
            $table->uuid('produto_id')->nullable();
            $table->string('categoria')->nullable();
            $table->text('tags')->nullable();
            $table->text('texto_principal')->nullable();
            $table->string('titulo')->nullable();
            $table->text('descricao')->nullable();
            $table->string('cta')->default('ORDER_NOW');
            $table->text('url_midia')->nullable();
            $table->string('foco_estrategia')->nullable();
            $table->string('status_fadiga')->default('SAUDAVEL');
            $table->integer('impressoes')->default(0);
            $table->integer('cliques')->default(0);
            $table->double('ctr')->default(0.0);
            $table->double('frequencia')->default(1.0);
            $table->integer('conversoes')->default(0);
            $table->double('cpa')->default(0.0);
            $table->double('roas')->default(0.0);
            $table->double('investimento')->default(0.0);
            $table->double('receita')->default(0.0);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
            $table->foreign('produto_id')->references('id')->on('meta_produto')->nullOnDelete();
        });

        // 14. Anuncio
        Schema::create('anuncio', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('conjunto_anuncio_id');
            $table->uuid('criativo_id')->nullable();
            $table->string('meta_ad_id')->nullable()->unique();
            $table->string('nome');
            $table->string('status')->default('PAUSED');
            $table->boolean('fadiga_detectada')->default(false);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
            $table->foreign('conjunto_anuncio_id')->references('id')->on('conjunto_anuncio')->cascadeOnDelete();
            $table->foreign('criativo_id')->references('id')->on('criativo')->nullOnDelete();
        });

        // 15. Publico
        Schema::create('publico', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('meta_audience_id')->nullable();
            $table->string('nome');
            $table->string('tipo');
            $table->string('origem')->nullable();
            $table->text('descricao')->nullable();
            $table->integer('tamanho_estimado')->nullable();
            $table->string('cidade')->nullable();
            $table->double('raio_km')->nullable();
            $table->integer('idade_min')->default(18);
            $table->integer('idade_max')->default(65);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 16. CampanhaMetrica
        Schema::create('campanha_metrica', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campanha_id');
            $table->date('data');
            $table->double('investimento')->default(0.0);
            $table->integer('impressoes')->default(0);
            $table->integer('alcance')->default(0);
            $table->integer('cliques')->default(0);
            $table->double('ctr')->default(0.0);
            $table->double('cpc')->default(0.0);
            $table->double('cpm')->default(0.0);
            $table->double('frequencia')->default(0.0);
            $table->integer('conversoes')->default(0);
            $table->integer('vendas')->default(0);
            $table->double('receita')->default(0.0);
            $table->double('cpa')->default(0.0);
            $table->double('roas')->default(0.0);
            $table->integer('pedidos_reais')->default(0);
            $table->double('receita_real')->default(0.0);
            $table->double('roas_real')->default(0.0);
            $table->double('cpa_real')->default(0.0);
            $table->timestamps();

            $table->foreign('campanha_id')->references('id')->on('campanha')->cascadeOnDelete();
            $table->unique(['campanha_id', 'data']);
        });

        // 17. ConjuntoMetrica
        Schema::create('conjunto_metrica', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conjunto_anuncio_id');
            $table->date('data');
            $table->double('investimento')->default(0.0);
            $table->integer('cliques')->default(0);
            $table->integer('conversoes')->default(0);
            $table->double('cpa')->default(0.0);
            $table->double('roas')->default(0.0);
            $table->timestamps();

            $table->foreign('conjunto_anuncio_id')->references('id')->on('conjunto_anuncio')->cascadeOnDelete();
            $table->unique(['conjunto_anuncio_id', 'data']);
        });

        // 18. AnuncioMetrica
        Schema::create('anuncio_metrica', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('anuncio_id');
            $table->date('data');
            $table->double('investimento')->default(0.0);
            $table->integer('impressoes')->default(0);
            $table->integer('cliques')->default(0);
            $table->double('ctr')->default(0.0);
            $table->double('frequencia')->default(0.0);
            $table->double('cpa')->default(0.0);
            $table->double('roas')->default(0.0);
            $table->timestamps();

            $table->foreign('anuncio_id')->references('id')->on('anuncio')->cascadeOnDelete();
            $table->unique(['anuncio_id', 'data']);
        });

        // 19. ProdutoMetrica
        Schema::create('produto_metrica', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('produto_id');
            $table->date('data');
            $table->integer('vendas')->default(0);
            $table->double('receita')->default(0.0);
            $table->timestamps();

            $table->foreign('produto_id')->references('id')->on('meta_produto')->cascadeOnDelete();
            $table->unique(['produto_id', 'data']);
        });

        // 20. RecomendacaoIa
        Schema::create('recomendacao_ia', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('tipo'); // OPORTUNIDADE, ATENCAO, BEM_SUCEDIDO
            $table->string('entidade_tipo'); // CAMPANHA, CONJUNTO, ANUNCIO, PUBLICO
            $table->string('entidade_id')->nullable();
            $table->string('titulo');
            $table->text('analise');
            $table->text('motivo');
            $table->text('acao_sugerida');
            $table->string('impacto_prev')->nullable();
            $table->double('nivel_confianca')->default(0.9);
            $table->string('risco')->default('BAIXO');
            $table->string('status')->default('NOVA');
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 21. Automacao
        Schema::create('automacao', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('nome');
            $table->boolean('ativa')->default(true);
            $table->text('condicao');
            $table->text('acao');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 22. AutomacaoExecucao
        Schema::create('automacao_execucao', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('automacao_id');
            $table->string('alvo_id');
            $table->string('status')->default('SUCESSO');
            $table->text('detalhes')->nullable();
            $table->timestamp('executed_at')->useCurrent();
            $table->timestamps();

            $table->foreign('automacao_id')->references('id')->on('automacao')->cascadeOnDelete();
        });

        // 23. Aprovacao
        Schema::create('aprovacao', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('recomendacao_id')->nullable()->unique();
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->string('titulo');
            $table->text('descricao');
            $table->string('acao_tipo');
            $table->text('payload');
            $table->string('status')->default('PENDENTE');
            $table->text('motivo_recusa')->nullable();
            $table->timestamp('decidido_em')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
            $table->foreign('recomendacao_id')->references('id')->on('recomendacao_ia')->nullOnDelete();
            $table->foreign('usuario_id')->references('id')->on('users')->nullOnDelete();
        });

        // 24. Alerta
        Schema::create('alerta', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('tipo');
            $table->string('titulo');
            $table->text('mensagem');
            $table->string('nivel')->default('ATENCAO');
            $table->boolean('lido')->default(false);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
        });

        // 25. Auditoria
        Schema::create('auditoria', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->string('origem');
            $table->string('entidade_tipo');
            $table->string('entidade_id');
            $table->string('campo')->nullable();
            $table->text('valor_anterior')->nullable();
            $table->text('valor_novo')->nullable();
            $table->text('motivo')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresa')->cascadeOnDelete();
            $table->foreign('usuario_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria');
        Schema::dropIfExists('alerta');
        Schema::dropIfExists('aprovacao');
        Schema::dropIfExists('automacao_execucao');
        Schema::dropIfExists('automacao');
        Schema::dropIfExists('recomendacao_ia');
        Schema::dropIfExists('produto_metrica');
        Schema::dropIfExists('anuncio_metrica');
        Schema::dropIfExists('conjunto_metrica');
        Schema::dropIfExists('campanha_metrica');
        Schema::dropIfExists('publico');
        Schema::dropIfExists('anuncio');
        Schema::dropIfExists('criativo');
        Schema::dropIfExists('conjunto_anuncio');
        Schema::dropIfExists('campanha');
        Schema::dropIfExists('meta_produto');
        Schema::dropIfExists('meta_catalogo');
        Schema::dropIfExists('meta_pixel');
        Schema::dropIfExists('meta_instagram');
        Schema::dropIfExists('meta_page');
        Schema::dropIfExists('meta_ad_account');
        Schema::dropIfExists('meta_business');
        Schema::dropIfExists('integracao_meta');
        Schema::dropIfExists('empresa_usuario');
        Schema::dropIfExists('empresa');
    }
};
