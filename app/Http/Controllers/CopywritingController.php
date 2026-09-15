<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\User;
use App\Services\CopywritingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CopywritingController extends Controller
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

        return Inertia::render('Copywriting/Index', [
            'empresa' => $empresa,
        ]);
    }

    public function gerar(Request $request, CopywritingService $service): JsonResponse
    {
        $empresa = $this->resolveEmpresa($request);
        $produtoNome = $request->input('produtoNome') ?: ($empresa?->produto_mais_vendido ?: 'Burger Artesanal Especial');
        $segmento = $empresa?->segmento ?: 'Hamburgueria / Delivery';
        $preco = $request->input('preco');
        $precoPromocional = $request->input('precoPromocional');

        $variacoes = $service->generateCopies($produtoNome, $segmento, 'VENDAS');

        return response()->json([
            'success' => true,
            'resultado' => [
                'empresa' => $empresa?->nome ?: 'Restaurante',
                'produto' => $produtoNome,
                'variacoes' => [
                    'focoProduto' => [
                        'estrategia' => 'Sensorial & Sabor',
                        'titulo' => $variacoes[1]['headline'],
                        'textoPrincipal' => $variacoes[1]['body'],
                        'descricao' => $precoPromocional ? "De R$ {$preco} por apenas R$ {$precoPromocional} no Prefiro Delivery" : 'Entrega rápida e quentinha',
                        'cta' => 'PEDIR_AGORA',
                        'porQueFunciona' => 'Desperta o apetite imediato destacando o visual e os ingredientes artesanais.',
                    ],
                    'focoBeneficio' => [
                        'estrategia' => 'Praticidade & Comodidade',
                        'titulo' => "Chega de cozinhar hoje: peça {$produtoNome} no conforto de casa",
                        'textoPrincipal' => "Você merece relaxar com o melhor delivery da cidade. Em poucos cliques pelo Prefiro Delivery, seu pedido chega rápido e no ponto perfeito.",
                        'descricao' => 'Sem filas, direto na sua porta',
                        'cta' => 'VER_CARDAPIO',
                        'porQueFunciona' => 'Conecta com a dor do cansaço e o desejo de conforto do consumidor à noite.',
                    ],
                    'focoUrgencia' => [
                        'estrategia' => 'Urgência & Escassez',
                        'titulo' => $variacoes[0]['headline'],
                        'textoPrincipal' => $variacoes[0]['body'],
                        'descricao' => 'Promoção válida enquanto durar o estoque da noite',
                        'cta' => 'GARANTIR_OFERTA',
                        'porQueFunciona' => 'Cria gatilho de urgência que acelera a decisão de compra para entrega no mesmo dia.',
                    ],
                ],
            ],
        ]);
    }
}
