<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConjuntoMetrica extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'conjunto_metrica';

    protected $guarded = [];

    protected $casts = [
        'data' => 'date',
        'investimento' => 'float',
        'cliques' => 'integer',
        'conversoes' => 'integer',
        'cpa' => 'float',
        'roas' => 'float',
    ];

    public function conjunto(): BelongsTo
    {
        return $this->belongsTo(ConjuntoAnuncio::class, 'conjunto_anuncio_id');
    }
}
