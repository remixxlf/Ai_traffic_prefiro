<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetaCatalogo extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'meta_catalogo';

    protected $guarded = [];

    protected $casts = [
        'total_products' => 'integer',
        'active_products' => 'integer',
        'error_products' => 'integer',
        'last_sync_at' => 'datetime',
        'next_sync_at' => 'datetime',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function produtos(): HasMany
    {
        return $this->hasMany(MetaProduto::class, 'catalogo_id');
    }
}
