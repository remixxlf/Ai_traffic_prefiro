<?php

namespace App\Services;

use App\Models\CampanhaMetrica;

class RealSalesReconciliationService
{
    /**
     * Reconcile Meta reported metrics with real sales from Prefiro Delivery.
     *
     * @param CampanhaMetrica $campanhaMetrica
     * @param int $pedidosReais
     * @param float $receitaReal
     * @return array{roas_real: float, cpa_real: float, discrepancia_receita: float, confianca_atribuicao: string}
     */
    public function reconcile(CampanhaMetrica $campanhaMetrica, int $pedidosReais, float $receitaReal): array
    {
        $investimento = (float) $campanhaMetrica->investimento;
        $receitaMeta = (float) $campanhaMetrica->receita;
        $conversoesMeta = (int) $campanhaMetrica->conversoes;

        // Calculate Real ROAS
        $roasReal = $investimento > 0 ? round($receitaReal / $investimento, 2) : 0.0;

        // Calculate Real CPA
        $cpaReal = $pedidosReais > 0 ? round($investimento / $pedidosReais, 2) : 0.0;

        // Calculate Revenue Discrepancy
        $discrepancia = $receitaMeta > 0
            ? round((($receitaReal - $receitaMeta) / $receitaMeta) * 100, 2)
            : 0.0;

        // Attribution Confidence
        $confianca = 'MEDIA';
        if ($pedidosReais >= $conversoesMeta || abs($discrepancia) <= 20.0) {
            $confianca = 'ALTA';
        } elseif (abs($discrepancia) > 50.0) {
            $confianca = 'BAIXA';
        }

        // Update database record
        $campanhaMetrica->update([
            'pedidos_reais' => $pedidosReais,
            'receita_real' => $receitaReal,
            'roas_real' => $roasReal,
            'cpa_real' => $cpaReal,
        ]);

        return [
            'roas_real' => $roasReal,
            'cpa_real' => $cpaReal,
            'discrepancia_receita' => $discrepancia,
            'confianca_atribuicao' => $confianca,
        ];
    }
}
