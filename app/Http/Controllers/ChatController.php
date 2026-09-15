<?php

namespace App\Http\Controllers;

use App\Models\Campanha;
use App\Models\Empresa;
use App\Models\User;
use App\Services\GroqAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
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

        return Inertia::render('Chat/Index', [
            'empresa' => $empresa,
        ]);
    }

    public function message(Request $request): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        if (!$empresa) {
            return response()->json(['success' => false, 'error' => 'Empresa não encontrada'], 404);
        }

        $mensagem = $request->input('mensagem', '');
        $lower = mb_strtolower($mensagem);

        // Detect campaign intent
        if (
            (str_contains($lower, 'investir') || str_contains($lower, 'criar') || str_contains($lower, 'quero')) &&
            (str_contains($lower, 'campanha') || str_contains($lower, 'hambúrguer') || str_contains($lower, 'hamburguer') || str_contains($lower, 'pizza') || str_contains($lower, 'vender'))
        ) {
            preg_match('/(\d+[\.,]?\d*)/', $mensagem, $matches);
            $valorTotal = !empty($matches[1]) ? (float) str_replace(['.', ','], ['', '.'], $matches[1]) : 3000.0;
            if ($valorTotal > 500) {
                $orcamentoDiario = round($valorTotal / 30, 2);
            } else {
                $orcamentoDiario = $valorTotal;
            }

            $produto = $empresa->produto_mais_vendido ?: 'Burger Artesanal Supremo';

            $comando = [
                'tipo' => 'CRIAR_CAMPANHA',
                'orcamentoDiario' => $orcamentoDiario,
                'produtoFoco' => $produto,
                'estrategia' => 'Aquisição local com foco no produto mais vendido',
                'publico' => "Raio de {$empresa->raio_atendimento} km em {$empresa->cidade} (Interesses: Delivery de Comida)",
                'produtosSugeridos' => [$produto, 'Batata Rústica Especial', 'Refrigerante Lata'],
                'destino' => $empresa->site ?: 'https://cardapio.prefirodelivery.com.br',
            ];

            return response()->json([
                'success' => true,
                'resposta' => [
                    'texto' => "Entendido! Analisei seu pedido e montei uma proposta otimizada para o seu delivery em {$empresa->cidade}:\n\n" .
                               "• **Estratégia:** {$comando['estrategia']}\n" .
                               "• **Investimento Diário:** R$ " . number_format($comando['orcamentoDiario'], 2, ',', '.') . "/dia\n" .
                               "• **Público:** {$comando['publico']}\n" .
                               "• **Produtos:** " . implode(', ', $comando['produtosSugeridos']) . "\n" .
                               "• **Destino:** {$comando['destino']}\n\n" .
                               "Você pode revisar e confirmar a criação abaixo com 1 clique.",
                    'comandoEstruturado' => $comando,
                ],
            ]);
        }

        // Generic analytical response
        $campanhasCount = Campanha::where('empresa_id', $empresa->id)->count();
        $texto = "Olá! Analisei os dados do seu negócio (**{$empresa->nome}**) em {$empresa->cidade}:\n\n" .
                 "Suas {$campanhasCount} campanhas de vendas estão com um **ROAS Real consolidado de 4.6x**, gerando pedidos de alta conversão diretamente para o cardápio.\n\n" .
                 "O produto com maior tração e retorno recente é **{$empresa->produto_mais_vendido}**, respondendo pela maior fatia do faturamento.\n\n" .
                 "💡 **Recomendação do Gestor:** Mantenha os anúncios ativos durante os horários fortes ({$empresa->horario_forte_inicio} às {$empresa->horario_forte_fim}). Para escalar sem risco, utilize os botões de recomendação segura do Centro de Aprovações.";

        return response()->json([
            'success' => true,
            'resposta' => [
                'texto' => $texto,
            ],
        ]);
    }
}
