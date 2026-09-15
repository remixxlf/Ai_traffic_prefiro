<?php

namespace App\Http\Controllers;

use App\Models\Alerta;
use App\Models\Aprovacao;
use App\Models\Campanha;
use App\Models\CampanhaMetrica;
use App\Models\Criativo;
use App\Models\Empresa;
use App\Models\MetaProduto;
use App\Models\RecomendacaoIa;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::first();
        $empresaId = $request->query('empresaId');
        $empresa = null;
        if ($empresaId) {
            $empresa = Empresa::find($empresaId);
        }
        if (!$empresa) {
            $empresa = $user ? $user->empresas()->first() : Empresa::first();
        }

        if (!$empresa) {
            return Inertia::render('Onboarding/Wizard');
        }

        // Summary metrics from last 7 days
        $metricas = CampanhaMetrica::whereHas('campanha', function ($query) use ($empresa) {
            $query->where('empresa_id', $empresa->id);
        })
        ->orderBy('data', 'asc')
        ->get();

        $totalInvestimento = $metricas->sum('investimento');
        $totalVendasMeta = $metricas->sum('vendas');
        $totalReceitaMeta = $metricas->sum('receita');
        $totalPedidosReais = $metricas->sum('pedidos_reais');
        $totalReceitaReal = $metricas->sum('receita_real');

        $roasMeta = $totalInvestimento > 0 ? round($totalReceitaMeta / $totalInvestimento, 2) : 0;
        $roasReal = $totalInvestimento > 0 ? round($totalReceitaReal / $totalInvestimento, 2) : 0;
        $cpaReal = $totalPedidosReais > 0 ? round($totalInvestimento / $totalPedidosReais, 2) : 0;

        $campanhas = Campanha::where('empresa_id', $empresa->id)
            ->with(['conjuntos.anuncios.criativo'])
            ->get();

        $recomendacoes = RecomendacaoIa::where('empresa_id', $empresa->id)
            ->where('status', '!=', 'EXECUTADA')
            ->latest()
            ->take(5)
            ->get();

        $aprovacoesPendentes = Aprovacao::where('empresa_id', $empresa->id)
            ->where('status', 'PENDENTE')
            ->count();

        $alertas = Alerta::where('empresa_id', $empresa->id)
            ->where('lido', false)
            ->latest()
            ->take(5)
            ->get();

        $criativos = Criativo::where('empresa_id', $empresa->id)
            ->orderBy('roas', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/Index', [
            'empresa' => $empresa,
            'kpis' => [
                'investimento' => $totalInvestimento,
                'vendas_meta' => $totalVendasMeta,
                'receita_meta' => $totalReceitaMeta,
                'pedidos_reais' => $totalPedidosReais,
                'receita_real' => $totalReceitaReal,
                'roas_meta' => $roasMeta,
                'roas_real' => $roasReal,
                'cpa_real' => $cpaReal,
            ],
            'chart_data' => $metricas->map(fn($m) => [
                'data' => $m->data->format('d/m'),
                'investimento' => (float) $m->investimento,
                'receita_meta' => (float) $m->receita,
                'receita_real' => (float) $m->receita_real,
                'pedidos_reais' => (int) $m->pedidos_reais,
                'roas_real' => (float) $m->roas_real,
            ]),
            'campanhas' => $campanhas,
            'recomendacoes' => $recomendacoes,
            'aprovacoes_pendentes' => $aprovacoesPendentes,
            'alertas' => $alertas,
            'top_criativos' => $criativos,
        ]);
    }
}
