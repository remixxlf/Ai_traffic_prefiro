<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RecomendacaoIa extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'recomendacao_ia';

    protected $guarded = [];

    protected $casts = [
        'nivel_confianca' => 'float',
        'executed_at' => 'datetime',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function aprovacao(): HasOne
    {
        return $this->hasOne(Aprovacao::class, 'recomendacao_id');
    }
}
