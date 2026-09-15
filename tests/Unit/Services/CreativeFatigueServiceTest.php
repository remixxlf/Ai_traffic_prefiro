<?php

namespace Tests\Unit\Services;

use App\Models\Anuncio;
use App\Models\ConjuntoAnuncio;
use App\Models\Criativo;
use App\Models\Empresa;
use App\Services\CreativeFatigueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreativeFatigueServiceTest extends TestCase
{
    use RefreshDatabase;

    private CreativeFatigueService $service;
    private Empresa $empresa;
    private Criativo $criativo;
    private Anuncio $anuncio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CreativeFatigueService();

        $this->empresa = Empresa::create([
            'nome' => 'Burger Mania',
        ]);

        $this->criativo = Criativo::create([
            'empresa_id' => $this->empresa->id,
            'nome' => 'Banner Burger Smash',
            'frequencia' => 1.5,
            'ctr' => 3.2,
            'status_fadiga' => 'SAUDAVEL',
        ]);

        $campanha = \App\Models\Campanha::create([
            'empresa_id' => $this->empresa->id,
            'nome' => 'Campanha Principal',
        ]);

        $conjunto = ConjuntoAnuncio::create([
            'empresa_id' => $this->empresa->id,
            'campanha_id' => $campanha->id,
            'nome' => 'Conjunto Teste',
        ]);

        $this->anuncio = Anuncio::create([
            'empresa_id' => $this->empresa->id,
            'conjunto_anuncio_id' => $conjunto->id,
            'criativo_id' => $this->criativo->id,
            'nome' => 'Anuncio Banner Smash',
            'fadiga_detectada' => false,
        ]);
    }

    public function test_detects_healthy_creative(): void
    {
        $result = $this->service->evaluateFatigue($this->criativo, frequency: 1.8, currentCtr: 3.1, baselineCtr: 3.2);

        $this->assertEquals('SAUDAVEL', $result['status']);
        $this->assertFalse($result['action_needed']);

        $this->criativo->refresh();
        $this->assertEquals('SAUDAVEL', $this->criativo->status_fadiga);
        $this->anuncio->refresh();
        $this->assertFalse($this->anuncio->fadiga_detectada);
    }

    public function test_detects_fatigue_when_frequency_exceeds_threshold(): void
    {
        $result = $this->service->evaluateFatigue($this->criativo, frequency: 3.9, currentCtr: 2.8, baselineCtr: 3.0);

        $this->assertEquals('FADIGADO', $result['status']);
        $this->assertTrue($result['action_needed']);
        $this->assertStringContainsString('3.5', $result['reason']);

        $this->criativo->refresh();
        $this->assertEquals('FADIGADO', $this->criativo->status_fadiga);
        $this->anuncio->refresh();
        $this->assertTrue($this->anuncio->fadiga_detectada);
    }

    public function test_detects_fatigue_when_ctr_drops_over_25_percent(): void
    {
        // baseline 4.0, current 2.8 -> drop is (4.0 - 2.8)/4.0 = 30% drop (> 25%)
        $result = $this->service->evaluateFatigue($this->criativo, frequency: 2.2, currentCtr: 2.8, baselineCtr: 4.0);

        $this->assertEquals('FADIGADO', $result['status']);
        $this->assertTrue($result['action_needed']);
        $this->assertStringContainsString('CTR', $result['reason']);
    }

    public function test_flags_warning_when_frequency_approaching_limit(): void
    {
        $result = $this->service->evaluateFatigue($this->criativo, frequency: 3.0, currentCtr: 3.0, baselineCtr: 3.2);

        $this->assertEquals('ALERTA_FADIGA', $result['status']);
        $this->assertFalse($result['action_needed']);
    }
}
