<?php

namespace App\Http\Controllers;

use App\Models\Alerta;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
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

        $alertas = Alerta::where('empresa_id', $empresa->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Alerts/Index', [
            'empresa' => $empresa,
            'alertas' => $alertas,
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $alertas = Alerta::where('empresa_id', $empresa->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'alertas' => $alertas,
        ]);
    }

    public function markAsRead(Request $request): JsonResponse
    {
        $alertaId = $request->input('alertaId');
        $alerta = Alerta::find($alertaId);
        if ($alerta) {
            $alerta->update(['lido' => true]);
        }

        return response()->json(['success' => true]);
    }
}
