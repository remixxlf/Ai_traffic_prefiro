<?php

namespace Tests\Unit\Services;

use App\Services\CopywritingService;
use Tests\TestCase;

class CopywritingServiceTest extends TestCase
{
    private CopywritingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CopywritingService();
    }

    public function test_generates_three_copy_variations(): void
    {
        $copies = $this->service->generateCopies(
            productName: 'Pizza Quatro Queijos',
            segment: 'Pizzaria Artesanal',
            objective: 'Vendas Delivery'
        );

        $this->assertCount(3, $copies);
        $this->assertEquals('URGENCIA', $copies[0]['style']);
        $this->assertEquals('SENSORIAL', $copies[1]['style']);
        $this->assertEquals('PROVA_SOCIAL', $copies[2]['style']);

        foreach ($copies as $copy) {
            $this->assertNotEmpty($copy['headline']);
            $this->assertNotEmpty($copy['body']);
            $this->assertNotEmpty($copy['cta']);
        }
    }
}
