<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetaProduto extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'meta_produto';

    protected $guarded = [];

    protected $casts = [
        'preco' => 'float',
        'preco_promocional' => 'float',
        'disponibilidade' => 'boolean',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function catalogo(): BelongsTo
    {
        return $this->belongsTo(MetaCatalogo::class, 'catalogo_id');
    }

    public function criativos(): HasMany
    {
        return $this->hasMany(Criativo::class, 'produto_id');
    }

    public function metricas(): HasMany
    {
        return $this->hasMany(ProdutoMetrica::class, 'produto_id');
    }
}
