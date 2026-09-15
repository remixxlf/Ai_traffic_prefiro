<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Automacao extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'automacao';

    protected $guarded = [];

    protected $casts = [
        'ativa' => 'boolean',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function execucoes(): HasMany
    {
        return $this->hasMany(AutomacaoExecucao::class, 'automacao_id');
    }
}
