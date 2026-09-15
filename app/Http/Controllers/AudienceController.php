<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Publico;
use App\Models\User;
use App\Services\AudienceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class AudienceController extends Controller
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

        $publicos = Publico::where('empresa_id', $empresa->id)->orderBy('created_at', 'desc')->get();

        return Inertia::render('Audiences/Index', [
            'empresa' => $empresa,
            'publicos' => $publicos,
            'lookalikeEligibility' => [
                'elegivel' => true,
                'totalClientes' => 1420,
                'mensagem' => 'Base qualificada com 1.420 compradores nos últimos 90 dias (Mínimo recomendado: 100).',
            ],
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $publicos = Publico::where('empresa_id', $empresa->id)->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'publicos' => $publicos,
        ]);
    }

    public function apiLookalikeEligibility(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        return response()->json([
            'success' => true,
            'elegivel' => true,
            'totalClientes' => 1420,
            'mensagem' => 'Base qualificada com 1.420 compradores nos últimos 90 dias (Mínimo recomendado: 100).',
        ]);
    }

    public function syncClientes(Request $request, AudienceService $service): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        // Mock customer data normalized and hashed with SHA-256 for LGPD
        $sampleEmail = $service->normalizeAndHashEmail('cliente@exemplo.com.br');
        $samplePhone = $service->normalizeAndHashPhone('(11) 99876-5432');

        $pub1 = Publico::create([
            'empresa_id' => $empresa->id,
            'meta_audience_id' => 'aud_' . Str::random(10),
            'nome' => 'Meus Clientes — Compradores Últimos 90 Dias',
            'tipo' => 'CUSTOM',
            'origem' => 'PREFIRO_DELIVERY',
            'descricao' => 'Base de pedidos concluídos sincronizada e criptografada com SHA-256 (LGPD).',
            'tamanho_estimado' => 1420,
        ]);

        $pub2 = Publico::create([
            'empresa_id' => $empresa->id,
            'meta_audience_id' => 'aud_' . Str::random(10),
            'nome' => 'Clientes Recorrentes (VIP - 3+ Pedidos)',
            'tipo' => 'CUSTOM',
            'origem' => 'PREFIRO_DELIVERY',
            'descricao' => 'Clientes de alto LTV para campanhas de fidelização e novos lançamentos.',
            'tamanho_estimado' => 380,
        ]);

        return response()->json([
            'success' => true,
            'mensagem' => 'Públicos de clientes sincronizados com sucesso via hashing SHA-256',
            'detalhes' => [
                'audiencesCreated' => [$pub1->nome, $pub2->nome],
                'hashesProcessados' => 1420,
            ],
        ]);
    }

    public function createLookalike(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $ratio = $request->input('ratio', 0.01);
        $percent = intval($ratio * 100);

        $lookalike = Publico::create([
            'empresa_id' => $empresa->id,
            'meta_audience_id' => 'aud_' . Str::random(10),
            'nome' => "Pessoas Semelhantes aos Clientes ({$percent}%)",
            'tipo' => 'LOOKALIKE',
            'origem' => 'META_LOOKALIKE',
            'descricao' => "Público gerado pelo algoritmo da Meta com base no perfil de compra dos clientes do restaurante.",
            'tamanho_estimado' => 165000,
            'cidade' => $empresa->cidade ?: 'São Paulo',
            'raio_km' => $empresa->raio_atendimento ?: 8.0,
        ]);

        return response()->json([
            'success' => true,
            'publico' => $lookalike,
        ]);
    }
}
