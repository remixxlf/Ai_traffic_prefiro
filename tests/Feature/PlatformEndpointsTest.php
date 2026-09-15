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

    public function test_dashboard_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/');
        $response->assertStatus(200);
    }

    public function test_campaigns_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/campaigns');
        $response->assertStatus(200);
    }

    public function test_creative_fatigue_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/creative-fatigue');
        $response->assertStatus(200);
    }

    public function test_automation_route_returns_ok(): void
    {
        $response = $this->actingAs($this->user)->get('/automation');
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
}
