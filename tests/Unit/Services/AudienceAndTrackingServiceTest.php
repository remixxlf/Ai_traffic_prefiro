<?php

namespace Tests\Unit\Services;

use App\Services\AudienceService;
use App\Services\TrackingService;
use Tests\TestCase;

class AudienceAndTrackingServiceTest extends TestCase
{
    private AudienceService $audienceService;
    private TrackingService $trackingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->audienceService = new AudienceService();
        $this->trackingService = new TrackingService();
    }

    public function test_hashes_email_for_lgpd_compliance(): void
    {
        $rawEmail = '  Cliente.Teste@GMAIL.com  ';
        $expectedHash = hash('sha256', 'cliente.teste@gmail.com');

        $hashed = $this->audienceService->normalizeAndHashEmail($rawEmail);

        $this->assertEquals($expectedHash, $hashed);
    }

    public function test_hashes_phone_for_lgpd_compliance(): void
    {
        $rawPhone = '+55 (11) 98765-4321';
        $expectedHash = hash('sha256', '5511987654321');

        $hashed = $this->audienceService->normalizeAndHashPhone($rawPhone);

        $this->assertEquals($expectedHash, $hashed);
    }

    public function test_generates_delivery_utm_tracking_url(): void
    {
        $url = $this->trackingService->buildUtmUrl(
            baseUrl: 'https://burgermania.prefirorapido.com.br/cardapio',
            campaignName: 'Smash Friday Jantar',
            adsetName: 'Raio 5km',
            adName: 'Video Queijo Derretendo'
        );

        $this->assertStringContainsString('utm_source=meta', $url);
        $this->assertStringContainsString('utm_medium=cpc', $url);
        $this->assertStringContainsString('utm_campaign=smash-friday-jantar', $url);
        $this->assertStringContainsString('utm_term=raio-5km', $url);
        $this->assertStringContainsString('utm_content=video-queijo-derretendo', $url);
    }
}
