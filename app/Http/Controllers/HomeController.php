<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $empresas = Empresa::withCount(['campanhas', 'metaProdutos', 'criativos', 'aprovacoes'])->get();

        $selectedEmpresaId = $request->query('empresaId');
        $selectedEmpresa = null;

        if ($selectedEmpresaId) {
            $selectedEmpresa = $empresas->firstWhere('id', $selectedEmpresaId);
        }

        if (!$selectedEmpresa && $empresas->isNotEmpty()) {
            $selectedEmpresa = $empresas->first();
        }

        return Inertia::render('Home/Index', [
            'empresas' => $empresas,
            'selectedEmpresa' => $selectedEmpresa,
            'counts' => [
                'campanhas' => $selectedEmpresa ? $selectedEmpresa->campanhas_count : 0,
                'produtos' => $selectedEmpresa ? $selectedEmpresa->meta_produtos_count : 0,
                'criativos' => $selectedEmpresa ? $selectedEmpresa->criativos_count : 0,
                'aprovacoes' => $selectedEmpresa ? $selectedEmpresa->aprovacoes_count : 0,
            ],
        ]);
    }
}
