<?php

namespace App\Services;

class CopywritingService
{
    /**
     * Generate 3 delivery copywriting variations (Urgência, Sensorial, Prova Social).
     *
     * @return array<int, array{style: string, name: string, headline: string, body: string, cta: string}>
     */
    public function generateCopies(string $productName, string $segment, string $objective): array
    {
        return [
            [
                'style' => 'URGENCIA',
                'name' => 'Foco em Urgência & Fome Imediata',
                'headline' => "Bateu a fome de {$productName}? Peça agora antes que esgote!",
                'body' => "Forno a todo vapor e entrega quentinha na sua porta pelo Prefiro Delivery em até 35 minutos. Não fique na vontade hoje!",
                'cta' => 'PEDIR_AGORA',
            ],
            [
                'style' => 'SENSORIAL',
                'name' => 'Foco em Experiência Sensorial & Ingredientes',
                'headline' => "Aqueça sua noite com o sabor irresistível de {$productName}",
                'body' => "Ingredientes nobres selecionados, queijo derretendo e massa artesanal com fermentação lenta. A verdadeira experiência gastronômica no conforto da sua casa.",
                'cta' => 'VER_CARDAPIO',
            ],
            [
                'style' => 'PROVA_SOCIAL',
                'name' => 'Foco em Prova Social & Mais Vendido',
                'headline' => "Mais de 1.200 clientes já elegeram: o melhor {$productName} da região",
                'body' => "Avaliação 4.9 estrelas no Prefiro Delivery. Quem experimenta uma vez nunca mais pede em outro lugar. Garanta o seu combo hoje!",
                'cta' => 'APROVEITAR_OFERTA',
            ],
        ];
    }
}
