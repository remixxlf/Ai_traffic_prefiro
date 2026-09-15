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

    private function resolveEmpresa(Request $request): ?Empresa
    {
        $user = $request->user() ?? User::first();
        $empresaId = $request->query('empresaId') ?? $request->input('empresaId');
        if ($empresaId) {
            $empresa = Empresa::find($empresaId);
            if ($empresa) return $empresa;
        }
        return $user ? $user->empresas()->first() : Empresa::first();
    }

    public function index(Request $request): Response
    {
        $empresa = $this->resolveEmpresa($request);

        if (!$empresa) {
            return Inertia::render('Onboarding/Wizard');
        }

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

    public function create(Request $request): Response
    {
        $empresa = $this->resolveEmpresa($request);

        if (!$empresa) {
            return Inertia::render('Onboarding/Wizard');
        }

        return Inertia::render('Campaigns/Create', [
            'empresa' => $empresa,
        ]);
    }

    public function apiOrcamento(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $ticketMedio = $empresa->ticket_medio ?: 55.0;
        $baseCalculada = round(($ticketMedio * 1.25) / 5) * 5;
        $orcamentoDiarioRecomendado = max(40, min($baseCalculada, 200));

        return response()->json([
            'success' => true,
            'recomendacao' => [
                'orcamentoDiarioRecomendado' => $orcamentoDiarioRecomendado,
                'justificativa' => "Considerando seu segmento ({$empresa->segmento}) em {$empresa->cidade}, seu ticket médio de R$ {$ticketMedio} e raio de atendimento de {$empresa->raio_atendimento}km, recomendamos começar com R$ {$orcamentoDiarioRecomendado} por dia para gerar pedidos consistentes.",
                'opcoesRapidas' => array_values(array_unique([50, $orcamentoDiarioRecomendado, 100, 200])),
            ],
        ]);
    }

    public function apiInterpretar(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        $promptTexto = $request->input('promptTexto', '');
        $lower = mb_strtolower($promptTexto);

        $produtoFoco = $empresa?->produto_mais_vendido ?: 'Burger Artesanal Especial';
        if (str_contains($lower, 'pizza')) {
            $produtoFoco = 'Pizza Artesanal da Casa';
        } elseif (str_contains($lower, 'hambúrguer') || str_contains($lower, 'hamburguer') || str_contains($lower, 'burger')) {
            $produtoFoco = 'Burger Artesanal Duplo';
        }

        return response()->json([
            'success' => true,
            'interpretacao' => [
                'produtoFoco' => $produtoFoco,
                'objetivoNegocio' => 'Aumentar pedidos para entrega via cardápio online',
                'sugestaoGancho' => "Bateu aquela fome de {$produtoFoco}? Peça quentinho pelo Prefiro Delivery!",
                'sugestaoPublico' => "Raio de {$empresa?->raio_atendimento} km em {$empresa?->cidade}",
                'sugestaoOrcamento' => 80,
            ],
        ]);
    }

    public function apiStore(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $validated = $request->validate([
            'nomeCampanha' => 'required|string',
            'orcamentoDiario' => 'required|numeric|min:1',
            'produtoNome' => 'nullable|string',
            'criativo' => 'nullable|array',
        ]);

        $campanha = Campanha::create([
            'empresa_id' => $empresa->id,
            'meta_campaign_id' => 'cmp_' . \Illuminate\Support\Str::random(12),
            'nome' => $validated['nomeCampanha'],
            'objetivo' => 'OUTCOME_SALES',
            'status' => 'ACTIVE',
            'orcamento_diario' => $validated['orcamentoDiario'],
            'orcamento_tipo' => 'DAILY',
        ]);

        return response()->json([
            'success' => true,
            'resultado' => [
                'campanhaId' => $campanha->id,
                'metaCampaignId' => $campanha->meta_campaign_id,
            ],
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
