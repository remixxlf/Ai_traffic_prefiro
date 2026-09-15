<?php

namespace App\Http\Controllers;

use App\Models\CampanhaMetrica;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
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

        $diario = $this->getDailyReportData($empresa);
        $semanal = $this->getWeeklyReportData($empresa);

        return Inertia::render('Reports/Index', [
            'empresa' => $empresa,
            'diario' => $diario,
            'semanal' => $semanal,
        ]);
    }

    public function apiDaily(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        return response()->json([
            'success' => true,
            'relatorio' => $this->getDailyReportData($empresa),
        ]);
    }

    public function apiWeekly(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        return response()->json([
            'success' => true,
            'relatorio' => $this->getWeeklyReportData($empresa),
        ]);
    }

    private function getDailyReportData(?Empresa $empresa): array
    {
        return [
            'investido' => 165.40,
            'receita' => 984.50,
            'pedidos' => 14,
            'roas' => 5.95,
            'custoPorPedido' => 11.81,
            'destaque' => 'Campanha Burger Artesanal Supremo liderou o retorno do dia com ROAS de 6.4x.',
            'alertas' => [
                'Pico de conversão ocorreu entre as 19h15 e as 21h40.',
                'Frequência do criativo principal em 1.8 (estável).',
            ],
        ];
    }

    private function getWeeklyReportData(?Empresa $empresa): array
    {
        return [
            'investido' => 1180.20,
            'receita' => 6491.00,
            'pedidos' => 96,
            'roas' => 5.50,
            'custoPorPedido' => 12.29,
            'comparativoSemanaAnterior' => [
                'receitaCrescimento' => 14.2,
                'roasCrescimento' => 8.5,
                'pedidosCrescimento' => 18.0,
            ],
            'topCampanhas' => [
                ['nome' => 'Aquisição Local - Burger Supremo', 'investido' => 640.00, 'receita' => 3840.00, 'roas' => 6.0],
                ['nome' => 'Retargeting Clientes Antigos', 'investido' => 320.00, 'receita' => 1920.00, 'roas' => 6.0],
                ['nome' => 'Combo Noite da Pizza', 'investido' => 220.20, 'receita' => 731.00, 'roas' => 3.32],
            ],
            'conclusaoIa' => 'Semana de excelente consistência. A estratégia de concentrar 70% da verba após as 18h provou ser o motor de rentabilidade da operação.',
        ];
    }
}
