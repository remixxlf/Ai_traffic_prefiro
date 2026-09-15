<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Publico extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'publico';

    protected $guarded = [];

    protected $casts = [
        'tamanho_estimado' => 'integer',
        'raio_km' => 'float',
        'idade_min' => 'integer',
        'idade_max' => 'integer',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}
