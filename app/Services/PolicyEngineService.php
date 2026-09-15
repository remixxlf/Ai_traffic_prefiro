<?php

namespace App\Services;

use App\Models\Auditoria;
use App\Models\Campanha;
use App\Models\ConjuntoAnuncio;
use App\Models\Empresa;

class PolicyEngineService
{
    /**
     * Maximum percentage change allowed in a single budget operation (20%).
     */
    public const MAX_CHANGE_PERCENT = 0.20;

    /**
     * Cooldown period in hours between budget changes.
     */
    public const COOLDOWN_HOURS = 24;

    /**
     * Validate and guard budget change according to PRD safety policies.
     *
     * @param Empresa $empresa
     * @param Campanha|ConjuntoAnuncio $entity
     * @param float $newBudget
     * @return array{allowed: bool, reason: string|null, suggested: float}
     */
    public function validateBudgetChange(Empresa $empresa, Campanha|ConjuntoAnuncio $entity, float $newBudget): array
    {
        $currentBudget = (float) ($entity->orcamento_diario ?? 0);
        $maxDailyCeiling = (float) ($empresa->orcamento_max_diario ?? 500.0);

        // 1. Check Cooldown (24h)
        $entityType = ($entity instanceof Campanha) ? 'CAMPANHA' : 'CONJUNTO';
        $recentAudit = Auditoria::where('empresa_id', $empresa->id)
            ->where('entidade_tipo', $entityType)
            ->where('entidade_id', $entity->id)
            ->where('campo', 'orcamento_diario')
            ->where('created_at', '>=', now()->subHours(self::COOLDOWN_HOURS))
            ->latest()
            ->first();

        if ($recentAudit) {
            return [
                'allowed' => false,
                'reason' => 'Período de cooldown de 24h ativo para alteração de orçamento nesta entidade.',
                'suggested' => $currentBudget,
            ];
        }

        // 2. Check Daily Max Ceiling
        if ($newBudget > $maxDailyCeiling) {
            return [
                'allowed' => false,
                'reason' => "Orçamento solicitado (R$ {$newBudget}) excede o teto diário da empresa de R$ {$maxDailyCeiling}.",
                'suggested' => $maxDailyCeiling,
            ];
        }

        // 3. Check 20% Rule (if current budget > 0)
        if ($currentBudget > 0) {
            $maxAllowed = round($currentBudget * (1 + self::MAX_CHANGE_PERCENT), 2);
            $minAllowed = round($currentBudget * (1 - self::MAX_CHANGE_PERCENT), 2);

            if ($newBudget > $maxAllowed) {
                return [
                    'allowed' => false,
                    'reason' => "Aumento excede o limite seguro de 20% (máximo permitido: R$ {$maxAllowed}).",
                    'suggested' => min($maxAllowed, $maxDailyCeiling),
                ];
            }

            if ($newBudget < $minAllowed) {
                return [
                    'allowed' => false,
                    'reason' => "Redução excede o limite seguro de 20% (mínimo permitido: R$ {$minAllowed}).",
                    'suggested' => $minAllowed,
                ];
            }
        }

        return [
            'allowed' => true,
            'reason' => null,
            'suggested' => $newBudget,
        ];
    }
}
