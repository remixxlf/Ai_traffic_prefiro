<?php

namespace App\Services;

class AudienceService
{
    /**
     * Normalize and hash customer email with SHA-256 for Meta Custom Audiences (LGPD).
     */
    public function normalizeAndHashEmail(string $email): string
    {
        $normalized = strtolower(trim($email));
        return hash('sha256', $normalized);
    }

    /**
     * Normalize and hash customer phone with SHA-256 for Meta Custom Audiences (LGPD).
     */
    public function normalizeAndHashPhone(string $phone): string
    {
        $digitsOnly = preg_replace('/\D+/', '', $phone) ?? '';
        return hash('sha256', $digitsOnly);
    }
}
