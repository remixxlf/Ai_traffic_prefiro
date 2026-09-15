<?php

namespace Tests\Unit\Services;

use App\Models\Empresa;
use App\Models\IntegracaoMeta;
use App\Models\MetaPage;
use App\Models\MetaPixel;
use App\Services\HealthScoreService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthScoreServiceTest extends TestCase
{
    use RefreshDatabase;

    private HealthScoreService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new HealthScoreService();
    }

    public function test_calculates_health_score_correctly(): void
    {
        $empresa = Empresa::create(['nome' => 'Pizzaria']);

        IntegracaoMeta::create([
            'empresa_id' => $empresa->id,
            'access_token' => 'MOCK_TOKEN',
            'status' => 'CONECTADO',
        ]);

        MetaPage::create([
            'empresa_id' => $empresa->id,
            'meta_page_id' => '123',
            'name' => 'Pizzaria Fanpage',
            'is_connected' => true,
        ]);

        MetaPixel::create([
            'empresa_id' => $empresa->id,
            'meta_pixel_id' => '456',
            'name' => 'Pixel Test',
            'status' => 'ATIVO',
            'has_purchase' => true,
            'capi_enabled' => true,
        ]);

        $scoreData = $this->service->calculateHealthScore($empresa);

        $this->assertIsInt($scoreData['score']);
        $this->assertGreaterThanOrEqual(50, $scoreData['score']);
        $this->assertNotEmpty($scoreData['items']);
    }
}
