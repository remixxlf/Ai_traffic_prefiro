<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\User;
use App\Services\OnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private OnboardingService $onboardingService
    ) {}

    /**
     * Render the 4-step Onboarding Wizard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::first();
        $empresa = $user ? $user->empresas()->first() : null;

        return Inertia::render('Onboarding/Wizard', [
            'empresa' => $empresa,
            'user' => $user,
        ]);
    }

    /**
     * Step 1: Restaurant Identity (Includes site URL).
     */
    public function step1(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'segmento' => 'nullable|string|max:100',
            'cidade' => 'nullable|string|max:100',
            'estado' => 'nullable|string|max:2',
            'site' => 'nullable|url|max:255',
        ]);

        $user = $request->user() ?? User::first();
        $empresa = $this->onboardingService->processStep1($user, $validated);

        return response()->json([
            'success' => true,
            'empresa' => $empresa,
            'message' => 'Identidade do restaurante salva com sucesso.',
        ]);
    }

    /**
     * Step 2: Delivery Operations.
     */
    public function step2(Request $request, string $empresaId): JsonResponse
    {
        $validated = $request->validate([
            'raio_atendimento' => 'nullable|numeric|min:0.5|max:50',
            'ticket_medio' => 'nullable|numeric|min:1',
            'publico_alvo' => 'nullable|string',
            'horario_forte_inicio' => 'nullable|string',
            'horario_forte_fim' => 'nullable|string',
            'dias_fortes' => 'nullable|string',
            'produto_mais_vendido' => 'nullable|string',
            'descricao' => 'nullable|string',
        ]);

        $empresa = Empresa::findOrFail($empresaId);
        $updated = $this->onboardingService->processStep2($empresa, $validated);

        return response()->json([
            'success' => true,
            'empresa' => $updated,
            'message' => 'Configurações operacionais salvas.',
        ]);
    }

    /**
     * Step 3: Meta Integration Connection.
     */
    public function step3(Request $request, string $empresaId): JsonResponse
    {
        $validated = $request->validate([
            'access_token' => 'nullable|string',
            'meta_business_id' => 'nullable|string',
            'business_name' => 'nullable|string',
            'meta_account_id' => 'nullable|string',
            'account_name' => 'nullable|string',
            'meta_page_id' => 'nullable|string',
            'page_name' => 'nullable|string',
            'meta_instagram_id' => 'nullable|string',
            'instagram_username' => 'nullable|string',
            'meta_pixel_id' => 'nullable|string',
            'pixel_name' => 'nullable|string',
        ]);

        $empresa = Empresa::findOrFail($empresaId);
        $this->onboardingService->processStep3($empresa, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Contas do ecossistema Meta vinculadas com sucesso.',
        ]);
    }

    /**
     * Step 4: Strategy & Budget Limits.
     */
    public function step4(Request $request, string $empresaId): JsonResponse
    {
        $validated = $request->validate([
            'modo_operacao' => 'required|string|in:PILOTO_AUTOMATICO,ASSISTIDO,MANUAL',
            'orcamento_max_diario' => 'required|numeric|min:10',
        ]);

        $empresa = Empresa::findOrFail($empresaId);
        $finalized = $this->onboardingService->processStep4($empresa, $validated);

        return response()->json([
            'success' => true,
            'empresa' => $finalized,
            'redirect' => route('dashboard'),
            'message' => 'Onboarding concluído com sucesso!',
        ]);
    }
}
