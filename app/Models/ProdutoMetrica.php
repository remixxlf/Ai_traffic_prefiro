<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdutoMetrica extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'produto_metrica';

    protected $guarded = [];

    protected $casts = [
        'data' => 'date',
        'vendas' => 'integer',
        'receita' => 'float',
    ];

    public function produto(): BelongsTo
    {
        return $this->belongsTo(MetaProduto::class, 'produto_id');
    }
}
