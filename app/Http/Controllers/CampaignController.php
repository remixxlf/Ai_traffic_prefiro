<?php

namespace App\Http\Controllers;

use App\Models\Auditoria;
use App\Models\Campanha;
use App\Models\Empresa;
use App\Models\User;
use App\Services\PolicyEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function __construct(
        private PolicyEngineService $policyEngine
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::first();
        $empresa = $user ? $user->empresas()->first() : Empresa::first();

        $campanhas = Campanha::where('empresa_id', $empresa->id)
            ->with(['conjuntos.anuncios.criativo', 'metricas' => function ($q) {
                $q->latest()->take(7);
            }])
            ->get();

        return Inertia::render('Campaigns/Index', [
            'empresa' => $empresa,
            'campanhas' => $campanhas,
        ]);
    }

    /**
     * Update campaign budget with Policy Engine guard.
     */
    public function updateBudget(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'orcamento_diario' => 'required|numeric|min:1',
        ]);

        $campanha = Campanha::findOrFail($id);
        $empresa = $campanha->empresa;

        $check = $this->policyEngine->validateBudgetChange(
            $empresa,
            $campanha,
            (float) $validated['orcamento_diario']
        );

        if (!$check['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $check['reason'],
                'suggested' => $check['suggested'],
            ], 422);
        }

        $oldBudget = $campanha->orcamento_diario;
        $campanha->update([
            'orcamento_diario' => $check['suggested'],
        ]);

        // Audit Trail
        Auditoria::create([
            'empresa_id' => $empresa->id,
            'usuario_id' => $request->user()?->id,
            'origem' => 'OPERADOR',
            'entidade_tipo' => 'CAMPANHA',
            'entidade_id' => $campanha->id,
            'campo' => 'orcamento_diario',
            'valor_anterior' => (string) $oldBudget,
            'valor_novo' => (string) $check['suggested'],
            'motivo' => 'Ajuste de orçamento via painel validado pelo Policy Engine.',
        ]);

        return response()->json([
            'success' => true,
            'orcamento_diario' => $campanha->orcamento_diario,
            'message' => 'Orçamento atualizado com sucesso dentro das políticas de segurança!',
        ]);
    }

    /**
     * Toggle campaign active/paused status.
     */
    public function toggleStatus(Request $request, string $id): JsonResponse
    {
        $campanha = Campanha::findOrFail($id);
        $newStatus = ($campanha->status === 'ACTIVE') ? 'PAUSED' : 'ACTIVE';

        $campanha->update(['status' => $newStatus]);

        Auditoria::create([
            'empresa_id' => $campanha->empresa_id,
            'usuario_id' => $request->user()?->id,
            'origem' => 'OPERADOR',
            'entidade_tipo' => 'CAMPANHA',
            'entidade_id' => $campanha->id,
            'campo' => 'status',
            'valor_anterior' => $campanha->status,
            'valor_novo' => $newStatus,
            'motivo' => "Status alterado para {$newStatus}.",
        ]);

        return response()->json([
            'success' => true,
            'status' => $newStatus,
            'message' => "Campanha {$newStatus} com sucesso!",
        ]);
    }
}
