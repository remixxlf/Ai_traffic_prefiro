<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campanha extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'campanha';

    protected $guarded = [];

    protected $casts = [
        'orcamento_diario' => 'float',
        'orcamento_total' => 'float',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function conjuntos(): HasMany
    {
        return $this->hasMany(ConjuntoAnuncio::class, 'campanha_id');
    }

    public function metricas(): HasMany
    {
        return $this->hasMany(CampanhaMetrica::class, 'campanha_id');
    }
}
