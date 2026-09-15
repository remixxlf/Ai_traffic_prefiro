<?php

namespace Tests\Unit\Services;

use App\Models\Campanha;
use App\Models\CampanhaMetrica;
use App\Models\Empresa;
use App\Services\RealSalesReconciliationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RealSalesReconciliationServiceTest extends TestCase
{
    use RefreshDatabase;

    private RealSalesReconciliationService $service;
    private Campanha $campanha;
    private CampanhaMetrica $metrica;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RealSalesReconciliationService();

        $empresa = Empresa::create([
            'nome' => 'Burger Mania',
        ]);

        $this->campanha = Campanha::create([
            'empresa_id' => $empresa->id,
            'nome' => 'Campanha Vendas',
            'orcamento_diario' => 100.0,
        ]);

        $this->metrica = CampanhaMetrica::create([
            'campanha_id' => $this->campanha->id,
            'data' => now()->toDateString(),
            'investimento' => 200.00,
            'conversoes' => 10,
            'receita' => 500.00,
            'cpa' => 20.00,
            'roas' => 2.50,
        ]);
    }

    public function test_reconciles_real_sales_metrics_correctly(): void
    {
        $result = $this->service->reconcile(
            campanhaMetrica: $this->metrica,
            pedidosReais: 15,
            receitaReal: 750.00
        );

        $this->assertEquals(3.75, $result['roas_real']); // 750 / 200 = 3.75
        $this->assertEquals(13.33, $result['cpa_real']); // 200 / 15 = 13.33
        $this->assertEquals(50.0, $result['discrepancia_receita']); // (750 - 500) / 500 = +50%
        $this->assertEquals('ALTA', $result['confianca_atribuicao']);

        // Check database was updated
        $this->metrica->refresh();
        $this->assertEquals(15, $this->metrica->pedidos_reais);
        $this->assertEquals(750.00, $this->metrica->receita_real);
        $this->assertEquals(3.75, $this->metrica->roas_real);
        $this->assertEquals(13.33, $this->metrica->cpa_real);
    }

    public function test_handles_zero_investment_safely(): void
    {
        $zeroMetrica = CampanhaMetrica::create([
            'campanha_id' => $this->campanha->id,
            'data' => now()->subDay()->toDateString(),
            'investimento' => 0.00,
            'conversoes' => 0,
            'receita' => 0.00,
        ]);

        $result = $this->service->reconcile(
            campanhaMetrica: $zeroMetrica,
            pedidosReais: 0,
            receitaReal: 0.00
        );

        $this->assertEquals(0.0, $result['roas_real']);
        $this->assertEquals(0.0, $result['cpa_real']);
    }
}
