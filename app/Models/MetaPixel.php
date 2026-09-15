<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaPixel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'meta_pixel';

    protected $guarded = [];

    protected $casts = [
        'last_event_at' => 'datetime',
        'has_purchase' => 'boolean',
        'has_add_to_cart' => 'boolean',
        'capi_enabled' => 'boolean',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}
