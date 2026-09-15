<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Empresa extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'empresa';

    protected $guarded = [];

    protected $casts = [
        'raio_atendimento' => 'float',
        'ticket_medio' => 'float',
        'orcamento_max_diario' => 'float',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(EmpresaUsuario::class, 'empresa_id');
    }

    public function integracaoMeta(): HasOne
    {
        return $this->hasOne(IntegracaoMeta::class, 'empresa_id');
    }

    public function metaBusiness(): HasOne
    {
        return $this->hasOne(MetaBusiness::class, 'empresa_id');
    }

    public function metaAdAccount(): HasOne
    {
        return $this->hasOne(MetaAdAccount::class, 'empresa_id');
    }

    public function metaPages(): HasMany
    {
        return $this->hasMany(MetaPage::class, 'empresa_id');
    }

    public function metaInstagram(): HasMany
    {
        return $this->hasMany(MetaInstagram::class, 'empresa_id');
    }

    public function metaPixel(): HasOne
    {
        return $this->hasOne(MetaPixel::class, 'empresa_id');
    }

    public function metaCatalogos(): HasMany
    {
        return $this->hasMany(MetaCatalogo::class, 'empresa_id');
    }

    public function metaProdutos(): HasMany
    {
        return $this->hasMany(MetaProduto::class, 'empresa_id');
    }

    public function campanhas(): HasMany
    {
        return $this->hasMany(Campanha::class, 'empresa_id');
    }

    public function criativos(): HasMany
    {
        return $this->hasMany(Criativo::class, 'empresa_id');
    }

    public function publicos(): HasMany
    {
        return $this->hasMany(Publico::class, 'empresa_id');
    }

    public function recomendacoes(): HasMany
    {
        return $this->hasMany(RecomendacaoIa::class, 'empresa_id');
    }

    public function automacoes(): HasMany
    {
        return $this->hasMany(Automacao::class, 'empresa_id');
    }

    public function aprovacoes(): HasMany
    {
        return $this->hasMany(Aprovacao::class, 'empresa_id');
    }

    public function alertas(): HasMany
    {
        return $this->hasMany(Alerta::class, 'empresa_id');
    }

    public function auditorias(): HasMany
    {
        return $this->hasMany(Auditoria::class, 'empresa_id');
    }
}
