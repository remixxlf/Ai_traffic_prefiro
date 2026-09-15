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
use App\Http\Controllers\IaController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ReconciliationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TrackingController;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Empresas
Route::get('/empresas', function () {
    return response()->json([
        'success' => true,
        'empresas' => Empresa::withCount(['campanhas', 'metaProdutos', 'criativos', 'aprovacoes'])->get(),
    ]);
});

// Onboarding
Route::prefix('onboarding')->group(function () {
    Route::post('/step1', [OnboardingController::class, 'step1'])->name('api.onboarding.step1');
    Route::post('/step2/{empresaId}', [OnboardingController::class, 'step2'])->name('api.onboarding.step2');
    Route::post('/step3/{empresaId}', [OnboardingController::class, 'step3'])->name('api.onboarding.step3');
    Route::post('/step4/{empresaId}', [OnboardingController::class, 'step4'])->name('api.onboarding.step4');
});

// Integrações
Route::prefix('integracoes')->group(function () {
    Route::get('/', [IntegrationController::class, 'apiStatus']);
    Route::delete('/', [IntegrationController::class, 'disconnect']);
});

// Catálogo
Route::prefix('catalogo')->group(function () {
    Route::get('/', [CatalogController::class, 'apiIndex']);
    Route::post('/', [CatalogController::class, 'sync']);
    Route::post('/anunciar/produto', [CatalogController::class, 'anunciarProduto']);
    Route::post('/anunciar/categoria', [CatalogController::class, 'anunciarCategoria']);
    Route::post('/anunciar/cardapio', [CatalogController::class, 'anunciarCardapio']);
});

// Campanhas & Wizard
Route::prefix('campanhas')->group(function () {
    Route::post('/', [CampaignController::class, 'apiStore']);
    Route::get('/orcamento', [CampaignController::class, 'apiOrcamento']);
    Route::post('/interpretar', [CampaignController::class, 'apiInterpretar']);
});
Route::prefix('campaigns')->group(function () {
    Route::patch('/{id}/budget', [CampaignController::class, 'updateBudget'])->name('api.campaigns.budget');
    Route::post('/{id}/toggle', [CampaignController::class, 'toggleStatus'])->name('api.campaigns.toggle');
});

// Copywriting
Route::prefix('copywriting')->group(function () {
    Route::post('/gerar', [CopywritingController::class, 'gerar']);
});

// Criativos & Fadiga
Route::prefix('creative-fatigue')->group(function () {
    Route::post('/{id}/evaluate', [CreativeFatigueController::class, 'evaluate'])->name('api.creative-fatigue.evaluate');
    Route::post('/ads/{anuncioId}/pause', [CreativeFatigueController::class, 'pauseAd'])->name('api.creative-fatigue.pause');
});

// Públicos & LGPD
Route::prefix('publicos')->group(function () {
    Route::get('/', [AudienceController::class, 'apiIndex']);
    Route::get('/lookalike', [AudienceController::class, 'apiLookalikeEligibility']);
    Route::post('/lookalike', [AudienceController::class, 'createLookalike']);
    Route::post('/sync-clientes', [AudienceController::class, 'syncClientes']);
});

// Rastreamento & Health Score
Route::get('/tracking', [TrackingController::class, 'apiTracking']);
Route::get('/score', [TrackingController::class, 'apiScore']);

// Minha IA
Route::prefix('minha-ia')->group(function () {
    Route::get('/', [IaController::class, 'apiIndex']);
    Route::post('/modo', [IaController::class, 'updateMode']);
});

// Aprovações
Route::prefix('aprovacoes')->group(function () {
    Route::get('/', [ApprovalController::class, 'apiIndex']);
    Route::post('/decidir', [ApprovalController::class, 'decide']);
});

// Automações
Route::prefix('automation')->group(function () {
    Route::post('/recommendations/generate', [AutomationController::class, 'generateRecommendations'])->name('api.automation.recommendations');
    Route::post('/approvals/{id}/decide', [AutomationController::class, 'decideApproval'])->name('api.automation.approvals.decide');
});

// Chat com IA
Route::post('/chat', [ChatController::class, 'message']);

// Relatórios
Route::prefix('relatorios')->group(function () {
    Route::get('/diario', [ReportController::class, 'apiDaily']);
    Route::get('/semanal', [ReportController::class, 'apiWeekly']);
});

// Alertas
Route::prefix('alertas')->group(function () {
    Route::get('/', [AlertController::class, 'apiIndex']);
    Route::patch('/', [AlertController::class, 'markAsRead']);
});

// Reconciliação
Route::prefix('reconciliation')->group(function () {
    Route::post('/{metricaId}', [ReconciliationController::class, 'reconcile'])->name('api.reconciliation.reconcile');
});
