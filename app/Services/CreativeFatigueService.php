<?php

namespace App\Services;

use App\Models\Anuncio;
use App\Models\Criativo;

class CreativeFatigueService
{
    public const FREQUENCY_THRESHOLD = 3.5;
    public const FREQUENCY_WARNING_THRESHOLD = 2.8;
    public const CTR_DROP_THRESHOLD_PERCENT = 25.0;

    /**
     * Evaluate creative fatigue based on frequency and CTR performance decline.
     *
     * @param Criativo $criativo
     * @param float $frequency
     * @param float $currentCtr
     * @param float $baselineCtr
     * @return array{status: string, action_needed: bool, reason: string|null, ctr_drop_pct: float}
     */
    public function evaluateFatigue(Criativo $criativo, float $frequency, float $currentCtr, float $baselineCtr): array
    {
        $ctrDropPct = 0.0;
        if ($baselineCtr > 0) {
            $ctrDropPct = round((($baselineCtr - $currentCtr) / $baselineCtr) * 100, 2);
        }

        $status = 'SAUDAVEL';
        $actionNeeded = false;
        $reason = null;

        if ($frequency >= self::FREQUENCY_THRESHOLD) {
            $status = 'FADIGADO';
            $actionNeeded = true;
            $reason = "Frequência excessiva ({$frequency} >= " . self::FREQUENCY_THRESHOLD . "). Audiência saturada.";
        } elseif ($ctrDropPct >= self::CTR_DROP_THRESHOLD_PERCENT) {
            $status = 'FADIGADO';
            $actionNeeded = true;
            $reason = "Queda severa no CTR de {$ctrDropPct}% em relação à média histórica.";
        } elseif ($frequency >= self::FREQUENCY_WARNING_THRESHOLD) {
            $status = 'ALERTA_FADIGA';
            $actionNeeded = false;
            $reason = "Frequência em elevação ({$frequency}), aproximando-se do limite de fadiga.";
        }

        // Update Criativo
        $criativo->update([
            'frequencia' => $frequency,
            'ctr' => $currentCtr,
            'status_fadiga' => $status,
        ]);

        // Flag or unflag related ads
        $isFadigado = ($status === 'FADIGADO');
        Anuncio::where('criativo_id', $criativo->id)->update([
            'fadiga_detectada' => $isFadigado,
        ]);

        return [
            'status' => $status,
            'action_needed' => $actionNeeded,
            'reason' => $reason,
            'ctr_drop_pct' => $ctrDropPct,
        ];
    }
}
