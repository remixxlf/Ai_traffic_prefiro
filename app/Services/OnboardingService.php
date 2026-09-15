<?php

namespace App\Services;

use App\Models\Empresa;
use App\Models\EmpresaUsuario;
use App\Models\IntegracaoMeta;
use App\Models\MetaAdAccount;
use App\Models\MetaBusiness;
use App\Models\MetaInstagram;
use App\Models\MetaPage;
use App\Models\MetaPixel;
use App\Models\User;
use Illuminate\Support\Str;

class OnboardingService
{
    /**
     * Process Step 1: Restaurant Identity (Includes 'site' URL).
     *
     * @param User $user
     * @param array<string, mixed> $data
     * @return Empresa
     */
    public function processStep1(User $user, array $data): Empresa
    {
        $slug = Str::slug($data['nome']) . '-' . Str::random(5);

        $empresa = Empresa::create([
            'nome' => $data['nome'],
            'slug_prefiro' => $slug,
            'segmento' => $data['segmento'] ?? null,
            'cidade' => $data['cidade'] ?? null,
            'estado' => $data['estado'] ?? null,
            'site' => $data['site'] ?? null,
        ]);

        EmpresaUsuario::create([
            'empresa_id' => $empresa->id,
            'user_id' => $user->id,
            'role' => 'ADMINISTRADOR',
        ]);

        return $empresa;
    }

    /**
     * Process Step 2: Delivery Operations.
     *
     * @param Empresa $empresa
     * @param array<string, mixed> $data
     * @return Empresa
     */
    public function processStep2(Empresa $empresa, array $data): Empresa
    {
        $empresa->update([
            'raio_atendimento' => isset($data['raio_atendimento']) ? (float) $data['raio_atendimento'] : $empresa->raio_atendimento,
            'ticket_medio' => isset($data['ticket_medio']) ? (float) $data['ticket_medio'] : $empresa->ticket_medio,
            'publico_alvo' => $data['publico_alvo'] ?? $empresa->publico_alvo,
            'horario_forte_inicio' => $data['horario_forte_inicio'] ?? $empresa->horario_forte_inicio,
            'horario_forte_fim' => $data['horario_forte_fim'] ?? $empresa->horario_forte_fim,
            'dias_fortes' => $data['dias_fortes'] ?? $empresa->dias_fortes,
            'produto_mais_vendido' => $data['produto_mais_vendido'] ?? $empresa->produto_mais_vendido,
            'descricao' => $data['descricao'] ?? $empresa->descricao,
        ]);

        return $empresa->fresh();
    }

    /**
     * Process Step 3: Meta Integration Connection.
     *
     * @param Empresa $empresa
     * @param array<string, mixed> $data
     * @return bool
     */
    public function processStep3(Empresa $empresa, array $data): bool
    {
        IntegracaoMeta::updateOrCreate(
            ['empresa_id' => $empresa->id],
            [
                'access_token' => $data['access_token'] ?? 'EAAB_MOCK_TOKEN',
                'status' => 'CONECTADO',
                'last_sync_at' => now(),
            ]
        );

        if (!empty($data['meta_business_id'])) {
            MetaBusiness::updateOrCreate(
                ['empresa_id' => $empresa->id],
                [
                    'meta_business_id' => $data['meta_business_id'],
                    'name' => $data['business_name'] ?? 'Meta Business Principal',
                    'status' => 'CONECTADO',
                ]
            );
        }

        if (!empty($data['meta_account_id'])) {
            MetaAdAccount::updateOrCreate(
                ['empresa_id' => $empresa->id],
                [
                    'meta_account_id' => $data['meta_account_id'],
                    'name' => $data['account_name'] ?? 'Conta Anúncios',
                    'status' => 'ACTIVE',
                    'account_health' => 100,
                    'payment_method_ok' => true,
                ]
            );
        }

        if (!empty($data['meta_page_id'])) {
            MetaPage::updateOrCreate(
                ['empresa_id' => $empresa->id, 'meta_page_id' => $data['meta_page_id']],
                [
                    'name' => $data['page_name'] ?? 'Página do Restaurante',
                    'is_connected' => true,
                ]
            );
        }

        if (!empty($data['meta_instagram_id'])) {
            MetaInstagram::updateOrCreate(
                ['empresa_id' => $empresa->id, 'meta_instagram_id' => $data['meta_instagram_id']],
                [
                    'username' => $data['instagram_username'] ?? '@restaurante',
                    'is_connected' => true,
                ]
            );
        }

        if (!empty($data['meta_pixel_id'])) {
            MetaPixel::updateOrCreate(
                ['empresa_id' => $empresa->id],
                [
                    'meta_pixel_id' => $data['meta_pixel_id'],
                    'name' => $data['pixel_name'] ?? 'Pixel Principal',
                    'status' => 'ATIVO',
                    'has_purchase' => true,
                    'has_add_to_cart' => true,
                    'capi_enabled' => true,
                ]
            );
        }

        return true;
    }

    /**
     * Process Step 4: Strategy and finalize onboarding.
     *
     * @param Empresa $empresa
     * @param array<string, mixed> $data
     * @return Empresa
     */
    public function processStep4(Empresa $empresa, array $data): Empresa
    {
        $empresa->update([
            'modo_operacao' => $data['modo_operacao'] ?? 'ASSISTIDO',
            'orcamento_max_diario' => isset($data['orcamento_max_diario']) ? (float) $data['orcamento_max_diario'] : 500.0,
        ]);

        return $empresa->fresh();
    }
}
