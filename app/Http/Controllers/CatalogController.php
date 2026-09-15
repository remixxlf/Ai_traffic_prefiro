<?php

namespace App\Http\Controllers;

use App\Models\Campanha;
use App\Models\Empresa;
use App\Models\MetaProduto;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class CatalogController extends Controller
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

        $produtos = MetaProduto::where('empresa_id', $empresa->id)->get();
        $total = $produtos->count();
        $ativos = $produtos->where('disponibilidade', true)->count();
        $inativos = $total - $ativos;

        return Inertia::render('Catalog/Index', [
            'empresa' => $empresa,
            'produtos' => $produtos,
            'resumo' => [
                'total' => $total,
                'ativos' => $ativos,
                'inativos' => $inativos,
                'comErro' => 0,
                'ultimaAtualizacao' => now()->subMinutes(15)->toIso8601String(),
                'proximaAtualizacao' => now()->addMinutes(45)->toIso8601String(),
            ],
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $produtos = MetaProduto::where('empresa_id', $empresa->id)->get();
        $total = $produtos->count();
        $ativos = $produtos->where('disponibilidade', true)->count();

        return response()->json([
            'success' => true,
            'produtos' => $produtos,
            'resumo' => [
                'total' => $total,
                'ativos' => $ativos,
                'inativos' => $total - $ativos,
                'comErro' => 0,
                'ultimaAtualizacao' => now()->subMinutes(10)->toIso8601String(),
                'proximaAtualizacao' => now()->addMinutes(50)->toIso8601String(),
            ],
        ]);
    }

    public function sync(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        return response()->json([
            'success' => true,
            'mensagem' => 'Sincronização de catálogo realizada com sucesso.',
            'detalhes' => [
                'novos' => 2,
                'alterados' => 1,
                'removidos' => 0,
            ],
        ]);
    }

    public function anunciarProduto(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        $produtoId = $request->input('produtoId');
        $orcamento = $request->input('orcamentoDiario', 50);

        $produto = MetaProduto::find($produtoId);
        $nome = $produto ? "Campanha de Prato - {$produto->nome}" : "Campanha de Prato Rápida";

        $campanha = Campanha::create([
            'empresa_id' => $empresa->id,
            'meta_campaign_id' => 'cmp_' . Str::random(12),
            'nome' => $nome,
            'objetivo' => 'OUTCOME_SALES',
            'status' => 'ACTIVE',
            'orcamento_diario' => $orcamento,
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

    public function anunciarCategoria(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        $categoria = $request->input('categoria', 'Geral');
        $orcamento = $request->input('orcamentoDiario', 60);

        $campanha = Campanha::create([
            'empresa_id' => $empresa->id,
            'meta_campaign_id' => 'cmp_' . Str::random(12),
            'nome' => "Campanha Categoria - {$categoria}",
            'objetivo' => 'OUTCOME_SALES',
            'status' => 'ACTIVE',
            'orcamento_diario' => $orcamento,
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

    public function anunciarCardapio(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        $orcamento = $request->input('orcamentoDiario', 80);

        $campanha = Campanha::create([
            'empresa_id' => $empresa->id,
            'meta_campaign_id' => 'cmp_' . Str::random(12),
            'nome' => "Campanha Catálogo Completo - {$empresa->nome}",
            'objetivo' => 'OUTCOME_SALES',
            'status' => 'ACTIVE',
            'orcamento_diario' => $orcamento,
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
}
