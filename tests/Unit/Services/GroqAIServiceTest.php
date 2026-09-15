<?php

namespace Tests\Unit\Services;

use App\Models\Empresa;
use App\Services\GroqAIService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroqAIServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_generates_recommendations_with_fallback(): void
    {
        $empresa = Empresa::create([
            'nome' => 'Pizzaria Express',
            'segmento' => 'Pizzas',
            'ticket_medio' => 45.0,
            'raio_atendimento' => 5.0,
            'horario_forte_inicio' => '18:00',
            'horario_forte_fim' => '23:00',
            'produto_mais_vendido' => 'Pizza Calabresa',
        ]);

        $service = new GroqAIService();
        $recommendations = $service->generateRecommendations($empresa);

        $this->assertNotEmpty($recommendations);
        $this->assertGreaterThanOrEqual(1, count($recommendations));
        $this->assertDatabaseHas('recomendacao_ia', [
            'empresa_id' => $empresa->id,
            'tipo' => 'OPORTUNIDADE',
        ]);
    }
}
