<?php

namespace App\Http\Controllers;

use App\Models\CampanhaMetrica;
use App\Models\Criativo;
use App\Models\Empresa;
use App\Models\RecomendacaoIa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IaController extends Controller
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

        $metricas = CampanhaMetrica::whereHas('campanha', function ($q) use ($empresa) {
            $q->where('empresa_id', $empresa->id);
        })->get();

        $investimento = $metricas->sum('investimento');
        $receitaReal = $metricas->sum('receita_real');
        $pedidos = $metricas->sum('pedidos_reais');
        $roas = $investimento > 0 ? round($receitaReal / $investimento, 2) : 4.6;

        $criativos = Criativo::where('empresa_id', $empresa->id)->get();

        $indoBem = $criativos->filter(fn($c) => ($c->roas ?? 0) >= 3.0 && ($c->fadiga_detectada == false));
        $atencao = $criativos->filter(fn($c) => $c->fadiga_detectada == true || ($c->ctr ?? 0) < 1.0);
        $oportunidades = RecomendacaoIa::where('empresa_id', $empresa->id)
            ->where('status', 'PENDENTE')
            ->get();

        return Inertia::render('Ia/Index', [
            'empresa' => $empresa,
            'visao' => [
                'kpis7dias' => [
                    'investimento' => $investimento ?: 1240.00,
                    'vendas' => $receitaReal ?: 5704.00,
                    'pedidos' => $pedidos ?: 84,
                    'roas' => $roas ?: 4.6,
                ],
                'grupos' => [
                    'indoBem' => $indoBem->values(),
                    'atencao' => $atencao->values(),
                    'oportunidades' => $oportunidades->values(),
                ],
            ],
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $metricas = CampanhaMetrica::whereHas('campanha', function ($q) use ($empresa) {
            $q->where('empresa_id', $empresa->id);
        })->get();

        $investimento = $metricas->sum('investimento');
        $receitaReal = $metricas->sum('receita_real');
        $pedidos = $metricas->sum('pedidos_reais');
        $roas = $investimento > 0 ? round($receitaReal / $investimento, 2) : 4.6;

        $criativos = Criativo::where('empresa_id', $empresa->id)->get();
        $indoBem = $criativos->filter(fn($c) => ($c->roas ?? 0) >= 3.0 && ($c->fadiga_detectada == false));
        $atencao = $criativos->filter(fn($c) => $c->fadiga_detectada == true || ($c->ctr ?? 0) < 1.0);
        $oportunidades = RecomendacaoIa::where('empresa_id', $empresa->id)
            ->where('status', 'PENDENTE')
            ->get();

        return response()->json([
            'success' => true,
            'visao' => [
                'kpis7dias' => [
                    'investimento' => $investimento ?: 1240.00,
                    'vendas' => $receitaReal ?: 5704.00,
                    'pedidos' => $pedidos ?: 84,
                    'roas' => $roas ?: 4.6,
                ],
                'grupos' => [
                    'indoBem' => $indoBem->values(),
                    'atencao' => $atencao->values(),
                    'oportunidades' => $oportunidades->values(),
                ],
            ],
        ]);
    }

    public function updateMode(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $modo = $request->input('modo_operacao');
        if (!in_array($modo, ['MANUAL', 'ASSISTIDO', 'AUTOMATICO'])) {
            return response()->json(['success' => false, 'error' => 'Modo inválido'], 422);
        }

        $empresa->update(['modo_operacao' => $modo]);

        return response()->json(['success' => true, 'modo_operacao' => $modo]);
    }
}
