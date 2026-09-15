<?php

namespace Tests\Unit\Services;

use App\Models\Empresa;
use App\Models\User;
use App\Services\OnboardingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingServiceTest extends TestCase
{
    use RefreshDatabase;

    private OnboardingService $service;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new OnboardingService();
        $this->user = User::factory()->create();
    }

    public function test_processes_step_1_including_site_field(): void
    {
        $data = [
            'nome' => 'Pizzaria Bella Napoli',
            'segmento' => 'Pizzaria',
            'cidade' => 'Campinas',
            'estado' => 'SP',
            'site' => 'https://bellanapolipizzas.com.br',
        ];

        $empresa = $this->service->processStep1($this->user, $data);

        $this->assertInstanceOf(Empresa::class, $empresa);
        $this->assertEquals('Pizzaria Bella Napoli', $empresa->nome);
        $this->assertEquals('https://bellanapolipizzas.com.br', $empresa->site);
        $this->assertDatabaseHas('empresa_usuario', [
            'empresa_id' => $empresa->id,
            'user_id' => $this->user->id,
            'role' => 'ADMINISTRADOR',
        ]);
    }

    public function test_processes_step_2_delivery_settings(): void
    {
        $empresa = Empresa::create(['nome' => 'Pizzaria Bella']);

        $data = [
            'raio_atendimento' => 8.0,
            'ticket_medio' => 65.0,
            'publico_alvo' => 'Famílias na zona norte',
            'horario_forte_inicio' => '18:30',
            'horario_forte_fim' => '23:00',
            'dias_fortes' => 'Sexta a Domingo',
            'produto_mais_vendido' => 'Pizza Margherita Especial',
            'descricao' => 'Tradicional forno a lenha',
        ];

        $updated = $this->service->processStep2($empresa, $data);

        $this->assertEquals(8.0, $updated->raio_atendimento);
        $this->assertEquals(65.0, $updated->ticket_medio);
        $this->assertEquals('Pizza Margherita Especial', $updated->produto_mais_vendido);
    }

    public function test_processes_step_3_meta_connection(): void
    {
        $empresa = Empresa::create(['nome' => 'Pizzaria Bella']);

        $data = [
            'access_token' => 'EAAB_MOCK_TEST_TOKEN',
            'meta_business_id' => 'bm_112233',
            'business_name' => 'BM Bella Napoli',
            'meta_account_id' => 'act_445566',
            'account_name' => 'Conta Anúncios Pizzaria',
            'meta_page_id' => 'pg_778899',
            'page_name' => 'Página Bella Napoli',
            'meta_instagram_id' => 'ig_990011',
            'instagram_username' => '@pizzariabellanapoli',
            'meta_pixel_id' => 'px_334455',
            'pixel_name' => 'Pixel Principal',
        ];

        $result = $this->service->processStep3($empresa, $data);

        $this->assertTrue($result);
        $this->assertDatabaseHas('integracao_meta', ['empresa_id' => $empresa->id, 'status' => 'CONECTADO']);
        $this->assertDatabaseHas('meta_business', ['empresa_id' => $empresa->id, 'meta_business_id' => 'bm_112233']);
        $this->assertDatabaseHas('meta_ad_account', ['empresa_id' => $empresa->id, 'meta_account_id' => 'act_445566']);
        $this->assertDatabaseHas('meta_page', ['empresa_id' => $empresa->id, 'meta_page_id' => 'pg_778899']);
        $this->assertDatabaseHas('meta_instagram', ['empresa_id' => $empresa->id, 'meta_instagram_id' => 'ig_990011']);
        $this->assertDatabaseHas('meta_pixel', ['empresa_id' => $empresa->id, 'meta_pixel_id' => 'px_334455']);
    }

    public function test_processes_step_4_strategy_and_finalizes(): void
    {
        $empresa = Empresa::create(['nome' => 'Pizzaria Bella']);

        $data = [
            'modo_operacao' => 'ASSISTIDO',
            'orcamento_max_diario' => 250.0,
        ];

        $finalized = $this->service->processStep4($empresa, $data);

        $this->assertEquals('ASSISTIDO', $finalized->modo_operacao);
        $this->assertEquals(250.0, $finalized->orcamento_max_diario);
    }
}
