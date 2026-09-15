<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampanhaMetrica extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'campanha_metrica';

    protected $guarded = [];

    protected $casts = [
        'data' => 'date',
        'investimento' => 'float',
        'impressoes' => 'integer',
        'alcance' => 'integer',
        'cliques' => 'integer',
        'ctr' => 'float',
        'cpc' => 'float',
        'cpm' => 'float',
        'frequencia' => 'float',
        'conversoes' => 'integer',
        'vendas' => 'integer',
        'receita' => 'float',
        'cpa' => 'float',
        'roas' => 'float',
        'pedidos_reais' => 'integer',
        'receita_real' => 'float',
        'roas_real' => 'float',
        'cpa_real' => 'float',
    ];

    public function campanha(): BelongsTo
    {
        return $this->belongsTo(Campanha::class, 'campanha_id');
    }
}
