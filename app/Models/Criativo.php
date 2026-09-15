<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Criativo extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'criativo';

    protected $guarded = [];

    protected $casts = [
        'impressoes' => 'integer',
        'cliques' => 'integer',
        'ctr' => 'float',
        'frequencia' => 'float',
        'conversoes' => 'integer',
        'cpa' => 'float',
        'roas' => 'float',
        'investimento' => 'float',
        'receita' => 'float',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function produto(): BelongsTo
    {
        return $this->belongsTo(MetaProduto::class, 'produto_id');
    }

    public function anuncios(): HasMany
    {
        return $this->hasMany(Anuncio::class, 'criativo_id');
    }
}
