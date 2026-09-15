<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomacaoExecucao extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'automacao_execucao';

    protected $guarded = [];

    protected $casts = [
        'executed_at' => 'datetime',
    ];

    public function automacao(): BelongsTo
    {
        return $this->belongsTo(Automacao::class, 'automacao_id');
    }
}
