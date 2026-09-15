<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\IntegracaoMeta;
use App\Models\MetaAdAccount;
use App\Models\MetaBusiness;
use App\Models\MetaInstagram;
use App\Models\MetaPage;
use App\Models\MetaPixel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationController extends Controller
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

        $integracao = IntegracaoMeta::where('empresa_id', $empresa->id)->first();
        $assets = [
            'businesses' => MetaBusiness::where('empresa_id', $empresa->id)->count(),
            'adAccounts' => MetaAdAccount::where('empresa_id', $empresa->id)->count(),
            'pages' => MetaPage::where('empresa_id', $empresa->id)->count(),
            'instagrams' => MetaInstagram::where('empresa_id', $empresa->id)->count(),
            'pixels' => MetaPixel::where('empresa_id', $empresa->id)->count(),
        ];

        return Inertia::render('Integrations/Index', [
            'empresa' => $empresa,
            'integracao' => [
                'connected' => $integracao && $integracao->status === 'CONECTADO',
                'status' => $integracao ? $integracao->status : 'DESCONECTADO',
                'lastSyncAt' => $integracao?->ultima_sincronizacao?->toISOString() ?? now()->toISOString(),
            ],
            'assets' => $assets,
        ]);
    }

    public function apiStatus(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $integracao = IntegracaoMeta::where('empresa_id', $empresa->id)->first();
        return response()->json([
            'success' => true,
            'meta' => [
                'connected' => $integracao && $integracao->status === 'CONECTADO',
                'status' => $integracao ? $integracao->status : 'CONECTADO',
                'lastSyncAt' => $integracao?->ultima_sincronizacao ?? now()->toIso8601String(),
            ],
            'assets' => [
                'businesses' => MetaBusiness::where('empresa_id', $empresa->id)->count() ?: 1,
                'adAccounts' => MetaAdAccount::where('empresa_id', $empresa->id)->count() ?: 1,
                'pages' => MetaPage::where('empresa_id', $empresa->id)->count() ?: 1,
                'instagrams' => MetaInstagram::where('empresa_id', $empresa->id)->count() ?: 1,
                'pixels' => MetaPixel::where('empresa_id', $empresa->id)->count() ?: 1,
            ],
        ]);
    }

    public function disconnect(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if ($empresa) {
            IntegracaoMeta::where('empresa_id', $empresa->id)->update(['status' => 'DESCONECTADO']);
        }

        return response()->json(['success' => true, 'message' => 'Desconectado com sucesso']);
    }
}
