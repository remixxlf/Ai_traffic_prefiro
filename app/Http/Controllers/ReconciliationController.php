<?php

namespace App\Http\Controllers;

use App\Models\Campanha;
use App\Models\CampanhaMetrica;
use App\Models\Empresa;
use App\Models\User;
use App\Services\RealSalesReconciliationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReconciliationController extends Controller
{
    public function __construct(
        private RealSalesReconciliationService $reconciliationService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::first();
        $empresa = $user ? $user->empresas()->first() : Empresa::first();

        $campanhas = Campanha::where('empresa_id', $empresa->id)
            ->with(['metricas' => function ($q) {
                $q->orderBy('data', 'desc');
            }])
            ->get();

        $metricas = CampanhaMetrica::whereHas('campanha', function ($q) use ($empresa) {
            $q->where('empresa_id', $empresa->id);
        })
        ->orderBy('data', 'desc')
        ->get();

        return Inertia::render('Reconciliation/Index', [
            'empresa' => $empresa,
            'campanhas' => $campanhas,
            'metricas' => $metricas,
        ]);
    }

    public function reconcile(Request $request, string $metricaId): JsonResponse
    {
        $validated = $request->validate([
            'pedidos_reais' => 'required|integer|min:0',
            'receita_real' => 'required|numeric|min:0',
        ]);

        $metrica = CampanhaMetrica::findOrFail($metricaId);

        $result = $this->reconciliationService->reconcile(
            $metrica,
            (int) $validated['pedidos_reais'],
            (float) $validated['receita_real']
        );

        return response()->json([
            'success' => true,
            'result' => $result,
            'metrica' => $metrica->fresh(),
            'message' => 'Vendas reais reconciliadas com sucesso!',
        ]);
    }
}
