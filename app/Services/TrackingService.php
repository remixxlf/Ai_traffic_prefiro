<?php

namespace App\Services;

use Illuminate\Support\Str;

class TrackingService
{
    /**
     * Build UTM-tagged URL for Prefiro Delivery campaigns.
     */
    public function buildUtmUrl(string $baseUrl, string $campaignName, string $adsetName, string $adName): string
    {
        $params = [
            'utm_source' => 'meta',
            'utm_medium' => 'cpc',
            'utm_campaign' => Str::slug($campaignName),
            'utm_term' => Str::slug($adsetName),
            'utm_content' => Str::slug($adName),
        ];

        $separator = str_contains($baseUrl, '?') ? '&' : '?';
        return $baseUrl . $separator . http_build_query($params);
    }
}
