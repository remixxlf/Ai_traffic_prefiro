<?php

namespace App\Http\Controllers;

use App\Models\Aprovacao;
use App\Models\Auditoria;
use App\Models\Automacao;
use App\Models\Empresa;
use App\Models\RecomendacaoIa;
use App\Models\User;
use App\Services\GroqAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AutomationController extends Controller
{
    public function __construct(
        private GroqAIService $groqService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::first();
        $empresa = $user ? $user->empresas()->first() : Empresa::first();

        $aprovacoes = Aprovacao::where('empresa_id', $empresa->id)
            ->with(['recomendacao'])
            ->latest()
            ->get();

        $automacoes = Automacao::where('empresa_id', $empresa->id)
            ->with(['execucoes' => function ($q) {
                $q->latest()->take(5);
            }])
            ->get();

        $recomendacoes = RecomendacaoIa::where('empresa_id', $empresa->id)
            ->latest()
            ->get();

        return Inertia::render('Automation/Index', [
            'empresa' => $empresa,
            'aprovacoes' => $aprovacoes,
            'automacoes' => $automacoes,
            'recomendacoes' => $recomendacoes,
        ]);
    }

    /**
     * Decide approval (APROVADO / RECUSADO).
     */
    public function decideApproval(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:APROVADO,RECUSADO',
            'motivo_recusa' => 'nullable|string',
        ]);

        $aprovacao = Aprovacao::findOrFail($id);
        $aprovacao->update([
            'status' => $validated['status'],
            'motivo_recusa' => $validated['motivo_recusa'] ?? null,
            'decidido_em' => now(),
            'usuario_id' => $request->user()?->id ?? User::first()->id,
        ]);

        if ($aprovacao->recomendacao) {
            $aprovacao->recomendacao->update([
                'status' => ($validated['status'] === 'APROVADO') ? 'EXECUTADA' : 'RECUSADA',
                'executed_at' => ($validated['status'] === 'APROVADO') ? now() : null,
            ]);
        }

        // Audit Trail
        Auditoria::create([
            'empresa_id' => $aprovacao->empresa_id,
            'usuario_id' => $request->user()?->id ?? User::first()->id,
            'origem' => 'OPERADOR',
            'entidade_tipo' => 'APROVACAO',
            'entidade_id' => $aprovacao->id,
            'campo' => 'status',
            'valor_anterior' => 'PENDENTE',
            'valor_novo' => $validated['status'],
            'motivo' => $validated['motivo_recusa'] ?? "Decisão manual do operador sobre recomendação de IA.",
        ]);

        return response()->json([
            'success' => true,
            'aprovacao' => $aprovacao,
            'message' => "Aprovação marcada como {$validated['status']}.",
        ]);
    }

    /**
     * Trigger fresh AI analysis via Groq Llama 3.3.
     */
    public function generateRecommendations(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        $empresa = $user ? $user->empresas()->first() : Empresa::first();

        $newRecs = $this->groqService->generateRecommendations($empresa);

        return response()->json([
            'success' => true,
            'recommendations' => $newRecs,
            'message' => count($newRecs) . ' novas recomendações geradas pela IA especialista.',
        ]);
    }
}
