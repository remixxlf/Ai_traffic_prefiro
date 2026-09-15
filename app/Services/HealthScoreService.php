<?php

namespace App\Services;

use App\Models\Empresa;

class HealthScoreService
{
    /**
     * Calculate Account Health Score (0-100) based on PRD Section 11 & 63.
     *
     * @return array{score: int, level: string, subscores: array<string, int>, items: array<int, array{name: string, status: bool, points: int}>}
     */
    public function calculateHealthScore(Empresa $empresa): array
    {
        $items = [];
        $score = 0;

        // 1. Meta Integration Connected
        $metaOk = $empresa->integracaoMeta && $empresa->integracaoMeta->status === 'CONECTADO';
        $items[] = ['name' => 'Conta Meta Conectada', 'status' => (bool)$metaOk, 'points' => 15];
        if ($metaOk) $score += 15;

        // 2. Facebook Page Connected
        $pageOk = $empresa->metaPages()->where('is_connected', true)->exists();
        $items[] = ['name' => 'Página do Facebook Vinculada', 'status' => $pageOk, 'points' => 10];
        if ($pageOk) $score += 10;

        // 3. Instagram Professional Connected
        $igOk = $empresa->metaInstagram()->where('is_connected', true)->exists();
        $items[] = ['name' => 'Instagram Comercial Vinculado', 'status' => $igOk, 'points' => 10];
        if ($igOk) $score += 10;

        // 4. Meta Pixel Active
        $pixel = $empresa->metaPixel;
        $pixelOk = $pixel && $pixel->status === 'ATIVO';
        $items[] = ['name' => 'Pixel Meta Ativo', 'status' => (bool)$pixelOk, 'points' => 15];
        if ($pixelOk) $score += 15;

        // 5. Conversion API (CAPI) Active
        $capiOk = $pixel && $pixel->capi_enabled;
        $items[] = ['name' => 'Conversion API (CAPI) Ativa', 'status' => (bool)$capiOk, 'points' => 15];
        if ($capiOk) $score += 15;

        // 6. Purchase Event Verified
        $purchaseOk = $pixel && $pixel->has_purchase;
        $items[] = ['name' => 'Evento de Compra (Purchase) Disparando', 'status' => (bool)$purchaseOk, 'points' => 15];
        if ($purchaseOk) $score += 15;

        // 7. Catalog Synchronized
        $catOk = $empresa->metaCatalogos()->where('status', 'SINCRONIZADO')->exists();
        $items[] = ['name' => 'Catálogo de Produtos Sincronizado', 'status' => $catOk, 'points' => 10];
        if ($catOk) $score += 10;

        // 8. Active Campaigns Running
        $campOk = $empresa->campanhas()->where('status', 'ACTIVE')->exists();
        $items[] = ['name' => 'Campanhas em Veiculação Ativa', 'status' => $campOk, 'points' => 10];
        if ($campOk) $score += 10;

        $level = 'EXCELENTE';
        if ($score < 60) {
            $level = 'CRITICO';
        } elseif ($score < 80) {
            $level = 'ATENCAO';
        }

        return [
            'score' => $score,
            'level' => $level,
            'subscores' => [
                'tracking' => ($pixelOk ? 40 : 0) + ($capiOk ? 35 : 0) + ($purchaseOk ? 25 : 0),
                'catalog' => $catOk ? 100 : 0,
                'campaigns' => $campOk ? 90 : 30,
            ],
            'items' => $items,
        ];
    }
}
