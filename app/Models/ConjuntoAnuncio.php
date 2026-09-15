<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConjuntoAnuncio extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'conjunto_anuncio';

    protected $guarded = [];

    protected $casts = [
        'orcamento_diario' => 'float',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function campanha(): BelongsTo
    {
        return $this->belongsTo(Campanha::class, 'campanha_id');
    }

    public function anuncios(): HasMany
    {
        return $this->hasMany(Anuncio::class, 'conjunto_anuncio_id');
    }

    public function metricas(): HasMany
    {
        return $this->hasMany(ConjuntoMetrica::class, 'conjunto_anuncio_id');
    }
}
