<?php

namespace Database\Seeders;

use App\Models\Alerta;
use App\Models\Anuncio;
use App\Models\AnuncioMetrica;
use App\Models\Aprovacao;
use App\Models\Auditoria;
use App\Models\Automacao;
use App\Models\Campanha;
use App\Models\CampanhaMetrica;
use App\Models\ConjuntoAnuncio;
use App\Models\ConjuntoMetrica;
use App\Models\Criativo;
use App\Models\Empresa;
use App\Models\EmpresaUsuario;
use App\Models\IntegracaoMeta;
use App\Models\MetaAdAccount;
use App\Models\MetaBusiness;
use App\Models\MetaCatalogo;
use App\Models\MetaInstagram;
use App\Models\MetaPage;
use App\Models\MetaPixel;
use App\Models\MetaProduto;
use App\Models\ProdutoMetrica;
use App\Models\Publico;
use App\Models\RecomendacaoIa;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. User
        $user = User::firstOrCreate(
            ['email' => 'admin@prefirorapido.com.br'],
            [
                'name' => 'Filipe Gestor de Tráfego',
                'password' => Hash::make('password123'),
            ]
        );

        // 2. Empresa (Restaurante modelo)
        $empresa = Empresa::firstOrCreate(
            ['slug_prefiro' => 'burger-mania-delivery'],
            [
                'nome' => 'Burger Mania Delivery & Bar',
                'segmento' => 'Hamburgueria Artesanal',
                'cidade' => 'São Paulo',
                'estado' => 'SP',
                'site' => 'https://burgermaniadelivery.com.br',
                'raio_atendimento' => 7.5,
                'ticket_medio' => 52.00,
                'produtos_chave' => 'Smash Burger, Batata Rústica, Milkshake de Nutella',
                'descricao' => 'Hamburgueria artesanal especializada em smash burguers ultracrocantes com entrega ultra-rápida via Prefiro Delivery.',
                'publico_alvo' => 'Jovens e famílias que pedem delivery no almoço executivo e fins de semana.',
                'horario_forte_inicio' => '18:00',
                'horario_forte_fim' => '23:30',
                'dias_fortes' => 'Quarta a Domingo',
                'produto_mais_vendido' => 'Smash Cheddar Bacon Duplo',
                'modo_operacao' => 'ASSISTIDO',
                'orcamento_max_diario' => 350.00,
            ]
        );

        // 3. EmpresaUsuario (Pivot)
        EmpresaUsuario::firstOrCreate(
            ['empresa_id' => $empresa->id, 'user_id' => $user->id],
            ['role' => 'ADMINISTRADOR']
        );

        // 4. IntegracaoMeta
        IntegracaoMeta::firstOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'access_token' => 'EAAX_MOCK_TOKEN_PREFIRO_TRAFFIC_PLATFORM_V1',
                'status' => 'CONECTADO',
                'meta_user_id' => 'usr_meta_987654321',
                'last_sync_at' => now(),
            ]
        );

        // 5. MetaBusiness & AdAccount
        MetaBusiness::firstOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'meta_business_id' => 'bm_882910293847',
                'name' => 'BM Burger Mania Delivery',
                'status' => 'CONECTADO',
            ]
        );

        MetaAdAccount::firstOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'meta_account_id' => 'act_1029384756',
                'name' => 'Conta Anúncios - Burger Mania Oficial',
                'currency' => 'BRL',
                'timezone' => 'America/Sao_Paulo',
                'status' => 'ACTIVE',
                'account_health' => 98,
                'payment_method_ok' => true,
            ]
        );

        MetaPage::firstOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'meta_page_id' => 'pg_991827364',
                'name' => 'Burger Mania Oficial',
                'is_connected' => true,
            ]
        );

        MetaInstagram::firstOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'meta_instagram_id' => 'ig_1784140092837',
                'username' => '@burgermaniadelivery',
                'is_connected' => true,
            ]
        );

        MetaPixel::firstOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'meta_pixel_id' => 'px_4483920192',
                'name' => 'Pixel Prefiro - Burger Mania',
                'status' => 'ATIVO',
                'last_event_at' => now()->subMinutes(12),
                'has_purchase' => true,
                'has_add_to_cart' => true,
                'capi_enabled' => true,
            ]
        );

        // 6. Catalogo & Produtos
        $catalogo = MetaCatalogo::firstOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'meta_catalog_id' => 'cat_550293847',
                'name' => 'Cardápio Digital Prefiro Delivery',
                'feed_url' => 'https://api.prefirorapido.com.br/cardapio/burger-mania/feed.xml',
                'total_products' => 12,
                'active_products' => 12,
                'error_products' => 0,
                'last_sync_at' => now()->subHours(2),
                'status' => 'SINCRONIZADO',
            ]
        );

        $prod1 = MetaProduto::firstOrCreate(
            ['empresa_id' => $empresa->id, 'external_id' => 'prod-smash-duplo'],
            [
                'catalogo_id' => $catalogo->id,
                'nome' => 'Smash Cheddar Bacon Duplo',
                'descricao' => 'Dois suculentos hambúrgueres smash de 90g com crostinha perfeita, cheddar cremoso e bacon crocante no pão brioche amanteigado.',
                'preco' => 38.90,
                'preco_promocional' => 34.90,
                'disponibilidade' => true,
                'categoria' => 'Burgers',
                'url_produto' => 'https://burgermaniadelivery.com.br/item/smash-duplo',
                'url_imagem' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
                'marca' => 'Burger Mania',
                'status' => 'ATIVO',
            ]
        );

        $prod2 = MetaProduto::firstOrCreate(
            ['empresa_id' => $empresa->id, 'external_id' => 'prod-combo-familia'],
            [
                'catalogo_id' => $catalogo->id,
                'nome' => 'Combo Família Smash + Fritas + Refri 2L',
                'descricao' => '4 smash burgers individuais + 2 porções grandes de batatas rústicas especiais + refrigerante 2L.',
                'preco' => 129.90,
                'preco_promocional' => 109.90,
                'disponibilidade' => true,
                'categoria' => 'Combos',
                'url_produto' => 'https://burgermaniadelivery.com.br/item/combo-familia',
                'url_imagem' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600',
                'marca' => 'Burger Mania',
                'status' => 'ATIVO',
            ]
        );

        // 7. Publico
        $publico = Publico::firstOrCreate(
            ['empresa_id' => $empresa->id, 'nome' => 'Raio 5km - Fãs de Delivery & Fast Food'],
            [
                'meta_audience_id' => 'aud_667283948',
                'tipo' => 'GEOGRAFICO_INTERESSES',
                'origem' => 'META_ADS',
                'descricao' => 'Pessoas de 18 a 55 anos residentes a até 5km da hamburgueria com interesse em lanches e delivery.',
                'tamanho_estimado' => 145000,
                'cidade' => 'São Paulo',
                'raio_km' => 5.0,
                'idade_min' => 18,
                'idade_max' => 55,
            ]
        );

        // 8. Campanhas, Conjuntos, Criativos, Anúncios
        $campanha = Campanha::firstOrCreate(
            ['empresa_id' => $empresa->id, 'meta_campaign_id' => 'camp_992837465'],
            [
                'nome' => 'Vendas Diretas - Noite & Jantar Delivery',
                'objetivo' => 'OUTCOME_SALES',
                'status' => 'ACTIVE',
                'orcamento_diario' => 120.00,
                'orcamento_total' => 3600.00,
                'tipo_anuncio' => 'PADRAO',
            ]
        );

        $conjunto = ConjuntoAnuncio::firstOrCreate(
            ['empresa_id' => $empresa->id, 'campanha_id' => $campanha->id],
            [
                'meta_adset_id' => 'adset_883746251',
                'nome' => 'Conjunto 1 - Raio 5km Delivery Noturno',
                'status' => 'ACTIVE',
                'orcamento_diario' => 120.00,
                'publico_alvo_desc' => 'Raio 5km São Paulo, 18-50 anos',
            ]
        );

        $criativoSaudavel = Criativo::firstOrCreate(
            ['empresa_id' => $empresa->id, 'nome' => 'Vídeo Smash Queijo Derretendo'],
            [
                'meta_creative_id' => 'crt_11223344',
                'tipo' => 'VIDEO',
                'formato' => '9:16',
                'produto_id' => $prod1->id,
                'categoria' => 'Burgers',
                'tags' => 'smash, cheddar, artesanal, promoção',
                'texto_principal' => 'Peça pelo Prefiro Delivery com entrega em até 35 minutos e pão quentinho!',
                'titulo' => 'Fome de Smash? Ganhe 10% OFF no 1º Pedido',
                'descricao' => 'Entrega rápida na sua porta.',
                'cta' => 'ORDER_NOW',
                'url_midia' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
                'foco_estrategia' => 'Conversão Noturna',
                'status_fadiga' => 'SAUDAVEL',
                'impressoes' => 24500,
                'cliques' => 840,
                'ctr' => 3.42,
                'frequencia' => 1.85,
                'conversoes' => 74,
                'cpa' => 12.50,
                'roas' => 4.80,
                'investimento' => 925.00,
                'receita' => 4440.00,
            ]
        );

        $criativoFadigado = Criativo::firstOrCreate(
            ['empresa_id' => $empresa->id, 'nome' => 'Banner Estático Combo Família Promoção Antiga'],
            [
                'meta_creative_id' => 'crt_99887766',
                'tipo' => 'IMAGEM',
                'formato' => '1:1',
                'produto_id' => $prod2->id,
                'categoria' => 'Combos',
                'tags' => 'combo, estatico, antigo',
                'texto_principal' => 'Combo família para seu fim de semana!',
                'titulo' => 'Peça agora seu combo',
                'descricao' => 'Entrega rápida',
                'cta' => 'ORDER_NOW',
                'url_midia' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600',
                'foco_estrategia' => 'Promoção Fim de Semana',
                'status_fadiga' => 'FADIGADO',
                'impressoes' => 52000,
                'cliques' => 510,
                'ctr' => 0.98,
                'frequencia' => 4.12,
                'conversoes' => 18,
                'cpa' => 38.00,
                'roas' => 1.95,
                'investimento' => 684.00,
                'receita' => 1333.80,
            ]
        );

        $anuncioAtivo = Anuncio::firstOrCreate(
            ['empresa_id' => $empresa->id, 'meta_ad_id' => 'ad_10293847'],
            [
                'conjunto_anuncio_id' => $conjunto->id,
                'criativo_id' => $criativoSaudavel->id,
                'nome' => 'Anúncio 01 - Smash Queijo Derretendo [Vídeo]',
                'status' => 'ACTIVE',
                'fadiga_detectada' => false,
            ]
        );

        $anuncioFadigado = Anuncio::firstOrCreate(
            ['empresa_id' => $empresa->id, 'meta_ad_id' => 'ad_55667788'],
            [
                'conjunto_anuncio_id' => $conjunto->id,
                'criativo_id' => $criativoFadigado->id,
                'nome' => 'Anúncio 02 - Banner Estático Combo [Fadiga]',
                'status' => 'ACTIVE',
                'fadiga_detectada' => true,
            ]
        );

        // 9. Métricas e Reconciliação de Vendas Reais (Seção 49 do PRD)
        for ($i = 6; $i >= 0; $i--) {
            $data = now()->subDays($i)->toDateString();
            $investimento = 110.0 + ($i * 4.5);
            $impressoes = 3200 + ($i * 120);
            $cliques = 120 + ($i * 8);
            $vendasMeta = 12 + ($i * 2);
            $receitaMeta = $vendasMeta * 52.0;

            // Reconciliação Prefiro Delivery Real
            $pedidosReais = (int) round($vendasMeta * 1.25);
            $receitaReal = $pedidosReais * 54.5;
            $roasReal = $investimento > 0 ? round($receitaReal / $investimento, 2) : 0;
            $cpaReal = $pedidosReais > 0 ? round($investimento / $pedidosReais, 2) : 0;

            CampanhaMetrica::updateOrCreate(
                ['campanha_id' => $campanha->id, 'data' => $data],
                [
                    'investimento' => $investimento,
                    'impressoes' => $impressoes,
                    'alcance' => (int) ($impressoes * 0.75),
                    'cliques' => $cliques,
                    'ctr' => round(($cliques / $impressoes) * 100, 2),
                    'cpc' => round($investimento / $cliques, 2),
                    'cpm' => round(($investimento / $impressoes) * 1000, 2),
                    'frequencia' => 1.35,
                    'conversoes' => $vendasMeta,
                    'vendas' => $vendasMeta,
                    'receita' => $receitaMeta,
                    'cpa' => round($investimento / $vendasMeta, 2),
                    'roas' => round($receitaMeta / $investimento, 2),
                    'pedidos_reais' => $pedidosReais,
                    'receita_real' => $receitaReal,
                    'roas_real' => $roasReal,
                    'cpa_real' => $cpaReal,
                ]
            );
        }

        // 10. Recomendações de IA (Groq Llama 3.3)
        $rec1 = RecomendacaoIa::firstOrCreate(
            ['empresa_id' => $empresa->id, 'titulo' => 'Aumentar orçamento do Anúncio Smash Queijo (+15%)'],
            [
                'tipo' => 'OPORTUNIDADE',
                'entidade_tipo' => 'CONJUNTO',
                'entidade_id' => $conjunto->id,
                'analise' => 'O anúncio "Vídeo Smash Queijo Derretendo" atingiu ROAS Real de 4.80x e CPA 30% abaixo da meta. O Policy Engine permite escala segura de até 20%.',
                'motivo' => 'Excelente performance e alta taxa de conversão no Prefiro Delivery nas últimas 72 horas.',
                'acao_sugerida' => 'Aumentar orçamento diário de R$ 120,00 para R$ 138,00 (+15%).',
                'impacto_prev' => '+18 pedidos estimados nos próximos 3 dias.',
                'nivel_confianca' => 0.94,
                'risco' => 'BAIXO',
                'status' => 'NOVA',
            ]
        );

        $rec2 = RecomendacaoIa::firstOrCreate(
            ['empresa_id' => $empresa->id, 'titulo' => 'Pausar Criativo Fadigado (Frequência 4.12)'],
            [
                'tipo' => 'ATENCAO',
                'entidade_tipo' => 'ANUNCIO',
                'entidade_id' => $anuncioFadigado->id,
                'analise' => 'O criativo "Banner Estático Combo Família" atingiu frequência de 4.12 e queda de 38% no CTR nos últimos 5 dias, caracterizando fadiga criativa severa.',
                'motivo' => 'Audiência saturada visualizando o mesmo criativo mais de 4 vezes com elevação de CPA para R$ 38,00.',
                'acao_sugerida' => 'Pausar anúncio fadigado e substituir por novo criativo carrossel dos smash burguers.',
                'impacto_prev' => 'Economia de R$ 250,00 em tráfego ineficiente.',
                'nivel_confianca' => 0.98,
                'risco' => 'MEDIO',
                'status' => 'PENDENTE_APROVACAO',
            ]
        );

        // 11. Aprovação para Rec 2
        Aprovacao::firstOrCreate(
            ['empresa_id' => $empresa->id, 'recomendacao_id' => $rec2->id],
            [
                'usuario_id' => $user->id,
                'titulo' => 'Pausar Anúncio Fadigado: Banner Estático Combo Família',
                'descricao' => 'A IA detectou frequência 4.12 e CTR em declínio. Deseja aplicar a pausa imediata no Meta Ads?',
                'acao_tipo' => 'PAUSAR_ANUNCIO',
                'payload' => [
                    'ad_id' => $anuncioFadigado->meta_ad_id,
                    'action' => 'PAUSE',
                    'reason' => 'CREATIVE_FATIGUE',
                ],
                'status' => 'PENDENTE',
            ]
        );

        // 12. Automação e Alertas
        $auto = Automacao::firstOrCreate(
            ['empresa_id' => $empresa->id, 'nome' => 'Proteção Anti-Fadiga Automática (Regra Seção 51)'],
            [
                'ativa' => true,
                'condicao' => 'frequencia > 3.5 E ctr_drop > 25%',
                'acao' => 'solicitar_aprovacao_pausa',
            ]
        );

        Alerta::firstOrCreate(
            ['empresa_id' => $empresa->id, 'titulo' => 'Pixel Ativo com Eventos Purchase'],
            [
                'tipo' => 'PIXEL_STATUS',
                'mensagem' => 'O Pixel do Meta Ads registrou 24 eventos de compra verificados via CAPI nas últimas 24 horas.',
                'nivel' => 'INFO',
                'lido' => true,
            ]
        );

        Alerta::firstOrCreate(
            ['empresa_id' => $empresa->id, 'titulo' => 'Fadiga Criativa Detectada'],
            [
                'tipo' => 'FADIGA',
                'mensagem' => 'O anúncio "Banner Estático Combo Família" ultrapassou a frequência limite (4.12). Recomenda-se rotação.',
                'nivel' => 'ATENCAO',
                'lido' => false,
            ]
        );

        // 13. Auditoria (LGPD e Histórico de Ações)
        Auditoria::firstOrCreate(
            ['empresa_id' => $empresa->id, 'entidade_id' => $empresa->id],
            [
                'usuario_id' => $user->id,
                'origem' => 'SISTEMA',
                'entidade_tipo' => 'EMPRESA',
                'campo' => 'modo_operacao',
                'valor_anterior' => 'PILOTO_AUTOMATICO',
                'valor_novo' => 'ASSISTIDO',
                'motivo' => 'Configuração inicial recomendada para aprovação assistida pelo operador.',
            ]
        );
    }
}
