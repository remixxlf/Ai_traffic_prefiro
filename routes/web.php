<?php

use App\Http\Controllers\AlertController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AudienceController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CopywritingController;
use App\Http\Controllers\CreativeFatigueController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\IaController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ReconciliationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TrackingController;
use Illuminate\Support\Facades\Route;

// 1. Hub Executivo
Route::get('/', [HomeController::class, 'index'])->name('home');

// 2. Dashboard Executivo & ROAS Real
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// 3. Onboarding & Memória de Negócio
Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');

// 4. Hub de Integrações
Route::get('/integracoes', [IntegrationController::class, 'index'])->name('integrations');

// 5. Catálogo & Campanhas de Pratos
Route::get('/catalogo', [CatalogController::class, 'index'])->name('catalog');

// 6. Gestão de Campanhas & Wizard
Route::get('/campanhas', [CampaignController::class, 'index'])->name('campaigns');
Route::get('/campanhas/nova', [CampaignController::class, 'create'])->name('campaigns.create');

// 7. Copywriting com IA
Route::get('/copywriting', [CopywritingController::class, 'index'])->name('copywriting');

// 8. Biblioteca de Criativos & Fadiga
Route::get('/criativos', [CreativeFatigueController::class, 'index'])->name('creatives');
Route::get('/creative-fatigue', [CreativeFatigueController::class, 'index'])->name('creative-fatigue');

// 9. Públicos & Segmentação LGPD
Route::get('/publicos', [AudienceController::class, 'index'])->name('audiences');

// 10. Saúde da Conta & Rastreamento
Route::get('/rastreamento', [TrackingController::class, 'index'])->name('tracking');

// 11. Automações & Guardrails
Route::get('/automacoes', [AutomationController::class, 'index'])->name('automations');
Route::get('/automation', [AutomationController::class, 'index'])->name('automation');

// 12. Minha IA & Memória Operacional
Route::get('/minha-ia', [IaController::class, 'index'])->name('minha-ia');

// 13. Central de Aprovações
Route::get('/aprovacoes', [ApprovalController::class, 'index'])->name('approvals');

// 14. Chat IA & Assistente
Route::get('/chat', [ChatController::class, 'index'])->name('chat');

// 15. Relatórios Automáticos
Route::get('/relatorios', [ReportController::class, 'index'])->name('reports');

// 16. Central de Alertas
Route::get('/alertas', [AlertController::class, 'index'])->name('alerts');

// 17. Reconciliação de Vendas Reais
Route::get('/reconciliation', [ReconciliationController::class, 'index'])->name('reconciliation');
