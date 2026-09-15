<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Aprovacao extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'aprovacao';

    protected $guarded = [];

    protected $casts = [
        'payload' => 'array',
        'decidido_em' => 'datetime',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function recomendacao(): BelongsTo
    {
        return $this->belongsTo(RecomendacaoIa::class, 'recomendacao_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
