<?php

namespace Tests\Unit\Services;

use App\Models\Auditoria;
use App\Models\Campanha;
use App\Models\Empresa;
use App\Services\PolicyEngineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolicyEngineServiceTest extends TestCase
{
    use RefreshDatabase;

    private PolicyEngineService $service;
    private Empresa $empresa;
    private Campanha $campanha;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PolicyEngineService();

        $this->empresa = Empresa::create([
            'nome' => 'Test Burger',
            'orcamento_max_diario' => 300.00,
        ]);

        $this->campanha = Campanha::create([
            'empresa_id' => $this->empresa->id,
            'nome' => 'Campanha Teste',
            'orcamento_diario' => 100.00,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_allows_budget_change_within_20_percent(): void
    {
        $result = $this->service->validateBudgetChange($this->empresa, $this->campanha, 115.00);

        $this->assertTrue($result['allowed']);
        $this->assertNull($result['reason']);
        $this->assertEquals(115.00, $result['suggested']);
    }

    public function test_rejects_budget_increase_exceeding_20_percent(): void
    {
        $result = $this->service->validateBudgetChange($this->empresa, $this->campanha, 130.00);

        $this->assertFalse($result['allowed']);
        $this->assertStringContainsString('20%', $result['reason']);
        $this->assertEquals(120.00, $result['suggested']);
    }

    public function test_rejects_budget_decrease_exceeding_20_percent(): void
    {
        $result = $this->service->validateBudgetChange($this->empresa, $this->campanha, 70.00);

        $this->assertFalse($result['allowed']);
        $this->assertStringContainsString('20%', $result['reason']);
        $this->assertEquals(80.00, $result['suggested']);
    }

    public function test_rejects_budget_exceeding_company_max_daily_ceiling(): void
    {
        $this->campanha->update(['orcamento_diario' => 280.00]);

        $result = $this->service->validateBudgetChange($this->empresa, $this->campanha, 320.00);

        $this->assertFalse($result['allowed']);
        $this->assertStringContainsString('teto', strtolower($result['reason']));
        $this->assertEquals(300.00, $result['suggested']);
    }

    public function test_enforces_24h_cooldown(): void
    {
        Auditoria::create([
            'empresa_id' => $this->empresa->id,
            'origem' => 'SISTEMA',
            'entidade_tipo' => 'CAMPANHA',
            'entidade_id' => $this->campanha->id,
            'campo' => 'orcamento_diario',
            'valor_anterior' => '90.00',
            'valor_novo' => '100.00',
            'created_at' => now()->subHours(6),
        ]);

        $result = $this->service->validateBudgetChange($this->empresa, $this->campanha, 110.00);

        $this->assertFalse($result['allowed']);
        $this->assertStringContainsString('cooldown', strtolower($result['reason']));
    }
}
