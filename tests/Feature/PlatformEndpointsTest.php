<?php

namespace Tests\Feature;

use App\Models\Aprovacao;
use App\Models\Campanha;
use App\Models\CampanhaMetrica;
use App\Models\Empresa;
use App\Models\EmpresaUsuario;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformEndpointsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Empresa $empresa;
    private Campanha $campanha;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->empresa = Empresa::create([
            'nome' => 'Burger Mania Test',
            'slug_prefiro' => 'burger-mania-test',
            'site' => 'https://burgermania.com.br',
            'orcamento_max_diario' => 400.0,
            'ticket_medio' => 50.0,
        ]);

        EmpresaUsuario::create([
            'empresa_id' => $this->empresa->id,
            'user_id' => $this->user->id,
            'role' => 'ADMINISTRADOR',
        ]);

        $this->campanha = Campanha::create([
            'empresa_id' => $this->empresa->id,
            'nome' => 'Campanha Feature Test',
            'orcamento_diario' => 100.0,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_home_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/');
        $response->assertStatus(200);
    }

    public function test_dashboard_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_integrations_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/integracoes');
        $response->assertStatus(200);
    }

    public function test_catalog_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/catalogo');
        $response->assertStatus(200);
    }

    public function test_campaigns_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/campanhas');
        $response->assertStatus(200);
    }

    public function test_campaigns_create_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/campanhas/nova');
        $response->assertStatus(200);
    }

    public function test_copywriting_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/copywriting');
        $response->assertStatus(200);
    }

    public function test_creatives_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/criativos');
        $response->assertStatus(200);
    }

    public function test_audiences_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/publicos');
        $response->assertStatus(200);
    }

    public function test_tracking_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/rastreamento');
        $response->assertStatus(200);
    }

    public function test_automations_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/automacoes');
        $response->assertStatus(200);
    }

    public function test_minha_ia_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/minha-ia');
        $response->assertStatus(200);
    }

    public function test_approvals_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/aprovacoes');
        $response->assertStatus(200);
    }

    public function test_chat_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/chat');
        $response->assertStatus(200);
    }

    public function test_reports_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/relatorios');
        $response->assertStatus(200);
    }

    public function test_alerts_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/alertas');
        $response->assertStatus(200);
    }

    public function test_reconciliation_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/reconciliation');
        $response->assertStatus(200);
    }

    public function test_onboarding_step1_api_creates_empresa_with_site(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/onboarding/step1', [
            'nome' => 'Nova Hamburgueria',
            'segmento' => 'Burgers',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'site' => 'https://novahamburgueria.com.br',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertDatabaseHas('empresa', [
            'nome' => 'Nova Hamburgueria',
            'site' => 'https://novahamburgueria.com.br',
        ]);
    }

    public function test_campaign_budget_update_enforces_policy_engine(): void
    {
        // Attempting +30% increase should be blocked
        $response = $this->actingAs($this->user)->patchJson("/api/campaigns/{$this->campanha->id}/budget", [
            'orcamento_diario' => 130.0,
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('suggested', 120);

        // Safe +15% increase should succeed
        $responseSuccess = $this->actingAs($this->user)->patchJson("/api/campaigns/{$this->campanha->id}/budget", [
            'orcamento_diario' => 115.0,
        ]);

        $responseSuccess->assertStatus(200);
        $responseSuccess->assertJsonPath('success', true);
    }

    public function test_approval_decision_workflow(): void
    {
        $aprovacao = Aprovacao::create([
            'empresa_id' => $this->empresa->id,
            'titulo' => 'Pausar anúncio teste',
            'descricao' => 'Fadiga detectada',
            'acao_tipo' => 'PAUSAR_ANUNCIO',
            'payload' => ['ad_id' => '123'],
            'status' => 'PENDENTE',
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/automation/approvals/{$aprovacao->id}/decide", [
            'status' => 'APROVADO',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $aprovacao->refresh();
        $this->assertEquals('APROVADO', $aprovacao->status);
    }

    public function test_reconciliation_api_computes_roas_real(): void
    {
        $metrica = CampanhaMetrica::create([
            'campanha_id' => $this->campanha->id,
            'data' => now()->toDateString(),
            'investimento' => 100.0,
            'vendas' => 5,
            'receita' => 250.0,
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/reconciliation/{$metrica->id}", [
            'pedidos_reais' => 8,
            'receita_real' => 450.0,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('result.roas_real', 4.5);
    }

    public function test_copywriting_api_generates_three_variations(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/copywriting/gerar', [
            'empresaId' => $this->empresa->id,
            'produtoNome' => 'Burger Artesanal Especial',
            'preco' => '35,00',
            'precoPromocional' => '28,90',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'resultado' => [
                'empresa',
                'produto',
                'variacoes' => [
                    'focoProduto',
                    'focoBeneficio',
                    'focoUrgencia',
                ]
            ]
        ]);
    }

    public function test_chat_api_handles_natural_language_intent(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/chat', [
            'empresaId' => $this->empresa->id,
            'mensagem' => 'Quero investir R$ 3.000 este mês para vender hambúrguer',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('resposta.comandoEstruturado.tipo', 'CRIAR_CAMPANHA');
    }

    public function test_audiences_lookalike_and_sync_api(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/publicos/lookalike', [
            'empresaId' => $this->empresa->id,
            'ratio' => 0.01,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
    }

    public function test_minha_ia_modo_update(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/minha-ia/modo', [
            'empresaId' => $this->empresa->id,
            'modo_operacao' => 'AUTOMATICO',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('modo_operacao', 'AUTOMATICO');
    }
}
