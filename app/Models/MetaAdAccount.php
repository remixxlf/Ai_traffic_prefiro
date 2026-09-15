<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaAdAccount extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'meta_ad_account';

    protected $guarded = [];

    protected $casts = [
        'account_health' => 'integer',
        'payment_method_ok' => 'boolean',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}
