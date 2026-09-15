<?php

namespace App\Http\Controllers;

use App\Models\Anuncio;
use App\Models\Criativo;
use App\Models\Empresa;
use App\Models\User;
use App\Services\CreativeFatigueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreativeFatigueController extends Controller
{
    public function __construct(
        private CreativeFatigueService $fatigueService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::first();
        $empresa = $user ? $user->empresas()->first() : Empresa::first();

        $criativos = Criativo::where('empresa_id', $empresa->id)
            ->with(['produto', 'anuncios.conjunto.campanha'])
            ->get();

        return Inertia::render('CreativeFatigue/Index', [
            'empresa' => $empresa,
            'criativos' => $criativos,
        ]);
    }

    public function evaluate(Request $request, string $id): JsonResponse
    {
        $criativo = Criativo::findOrFail($id);

        $validated = $request->validate([
            'frequency' => 'required|numeric|min:0.1',
            'current_ctr' => 'required|numeric|min:0',
            'baseline_ctr' => 'required|numeric|min:0',
        ]);

        $result = $this->fatigueService->evaluateFatigue(
            $criativo,
            (float) $validated['frequency'],
            (float) $validated['current_ctr'],
            (float) $validated['baseline_ctr']
        );

        return response()->json([
            'success' => true,
            'result' => $result,
            'criativo' => $criativo->fresh(),
        ]);
    }

    public function pauseAd(Request $request, string $anuncioId): JsonResponse
    {
        $anuncio = Anuncio::findOrFail($anuncioId);
        $anuncio->update(['status' => 'PAUSED']);

        return response()->json([
            'success' => true,
            'message' => 'Anúncio fadigado pausado com sucesso para proteger o investimento.',
            'anuncio' => $anuncio,
        ]);
    }
}
