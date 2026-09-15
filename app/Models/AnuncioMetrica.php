<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnuncioMetrica extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'anuncio_metrica';

    protected $guarded = [];

    protected $casts = [
        'data' => 'date',
        'investimento' => 'float',
        'impressoes' => 'integer',
        'cliques' => 'integer',
        'ctr' => 'float',
        'frequencia' => 'float',
        'cpa' => 'float',
        'roas' => 'float',
    ];

    public function anuncio(): BelongsTo
    {
        return $this->belongsTo(Anuncio::class, 'anuncio_id');
    }
}
