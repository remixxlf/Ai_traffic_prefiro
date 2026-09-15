<?php

namespace App\Http\Controllers;

use App\Models\Aprovacao;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
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

        $aprovacoes = Aprovacao::where('empresa_id', $empresa->id)
            ->with(['recomendacao'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Approvals/Index', [
            'empresa' => $empresa,
            'aprovacoes' => $aprovacoes,
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $aprovacoes = Aprovacao::where('empresa_id', $empresa->id)
            ->with(['recomendacao'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'aprovacoes' => $aprovacoes,
        ]);
    }

    public function decide(Request $request): JsonResponse
    {
        $aprovacaoId = $request->input('aprovacaoId');
        $decisao = $request->input('decisao');

        $aprovacao = Aprovacao::find($aprovacaoId);
        if (!$aprovacao) {
            return response()->json(['success' => false, 'error' => 'Aprovação não encontrada'], 404);
        }

        $novoStatus = $decisao === 'APROVAR' ? 'APROVADO' : 'REJEITADO';
        $aprovacao->update([
            'status' => $novoStatus,
            'decidido_em' => now(),
            'motivo_rejeicao' => $decisao === 'RECUSAR' ? 'Recusado manualmente pelo operador' : null,
        ]);

        if ($aprovacao->recomendacao_id) {
            $aprovacao->recomendacao()->update([
                'status' => $decisao === 'APROVAR' ? 'EXECUTADA' : 'REJEITADA',
            ]);
        }

        return response()->json([
            'success' => true,
            'mensagem' => $decisao === 'APROVAR' ? 'Aprovado com sucesso' : 'Recusado com sucesso',
            'aprovacao' => $aprovacao,
        ]);
    }
}
