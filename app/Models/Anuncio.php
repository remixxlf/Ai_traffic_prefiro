<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Anuncio extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'anuncio';

    protected $guarded = [];

    protected $casts = [
        'fadiga_detectada' => 'boolean',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function conjunto(): BelongsTo
    {
        return $this->belongsTo(ConjuntoAnuncio::class, 'conjunto_anuncio_id');
    }

    public function criativo(): BelongsTo
    {
        return $this->belongsTo(Criativo::class, 'criativo_id');
    }

    public function metricas(): HasMany
    {
        return $this->hasMany(AnuncioMetrica::class, 'anuncio_id');
    }
}
