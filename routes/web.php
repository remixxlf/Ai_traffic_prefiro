<?php

use App\Http\Controllers\AutomationController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CreativeFatigueController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ReconciliationController;
use Illuminate\Support\Facades\Route;

// Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard', [DashboardController::class, 'index']);

// Onboarding
Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');

// Campaigns
Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns');

// Creative Fatigue
Route::get('/creative-fatigue', [CreativeFatigueController::class, 'index'])->name('creative-fatigue');

// Automation & AI Approvals
Route::get('/automation', [AutomationController::class, 'index'])->name('automation');

// Real Sales Reconciliation
Route::get('/reconciliation', [ReconciliationController::class, 'index'])->name('reconciliation');
