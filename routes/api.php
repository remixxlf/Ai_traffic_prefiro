<?php

use App\Http\Controllers\AutomationController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CreativeFatigueController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ReconciliationController;
use Illuminate\Support\Facades\Route;

// Onboarding Endpoints
Route::prefix('onboarding')->group(function () {
    Route::post('/step1', [OnboardingController::class, 'step1'])->name('api.onboarding.step1');
    Route::post('/step2/{empresaId}', [OnboardingController::class, 'step2'])->name('api.onboarding.step2');
    Route::post('/step3/{empresaId}', [OnboardingController::class, 'step3'])->name('api.onboarding.step3');
    Route::post('/step4/{empresaId}', [OnboardingController::class, 'step4'])->name('api.onboarding.step4');
});

// Campaign & Budget Guard Endpoints
Route::prefix('campaigns')->group(function () {
    Route::patch('/{id}/budget', [CampaignController::class, 'updateBudget'])->name('api.campaigns.budget');
    Route::post('/{id}/toggle', [CampaignController::class, 'toggleStatus'])->name('api.campaigns.toggle');
});

// Creative Fatigue Endpoints
Route::prefix('creative-fatigue')->group(function () {
    Route::post('/{id}/evaluate', [CreativeFatigueController::class, 'evaluate'])->name('api.creative-fatigue.evaluate');
    Route::post('/ads/{anuncioId}/pause', [CreativeFatigueController::class, 'pauseAd'])->name('api.creative-fatigue.pause');
});

// Automation & AI Approvals Endpoints
Route::prefix('automation')->group(function () {
    Route::post('/recommendations/generate', [AutomationController::class, 'generateRecommendations'])->name('api.automation.recommendations');
    Route::post('/approvals/{id}/decide', [AutomationController::class, 'decideApproval'])->name('api.automation.approvals.decide');
});

// Real Sales Reconciliation Endpoints
Route::prefix('reconciliation')->group(function () {
    Route::post('/{metricaId}', [ReconciliationController::class, 'reconcile'])->name('api.reconciliation.reconcile');
});
