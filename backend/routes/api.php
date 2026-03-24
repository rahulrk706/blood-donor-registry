<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\DonorController;
use Illuminate\Support\Facades\Route;

// ── User auth ─────────────────────────────────────────
Route::post('auth/register',       [AuthController::class, 'register']);
Route::post('auth/login',          [AuthController::class, 'login']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password',  [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout',           [AuthController::class, 'logout']);
    Route::get('auth/me',                [AuthController::class, 'me']);
    Route::put('auth/profile',           [AuthController::class, 'updateProfile']);
    Route::put('auth/change-password',   [AuthController::class, 'changePassword']);
    Route::get('auth/my-donor',          [DonorController::class, 'myDonor']);

    Route::get('donations',          [DonationController::class, 'index']);
    Route::post('donations',         [DonationController::class, 'store']);
    Route::delete('donations/{donation}', [DonationController::class, 'destroy']);
});

// ── Donors (public read, auth required for write) ─────
Route::get('donors',          [DonorController::class, 'index']);
Route::get('donors/{donor}',  [DonorController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('donors',             [DonorController::class, 'store']);
    Route::put('donors/{donor}',      [DonorController::class, 'update']);
    Route::delete('donors/{donor}',   [DonorController::class, 'destroy']);
});

// ── Admin: Users ──────────────────────────────────────
Route::get('admin/users', [AuthController::class, 'adminUsers']);

// ── Admin: Donors ─────────────────────────────────────
Route::get('admin/donors/{donor}/donations', [DonationController::class, 'adminIndex']);
Route::post('admin/donors',           [DonorController::class, 'adminStore']);
Route::put('admin/donors/{donor}',    [DonorController::class, 'adminUpdate']);
Route::delete('admin/donors/{donor}', [DonorController::class, 'destroy']);

// ── Contact ───────────────────────────────────────────
Route::post('contact', [ContactController::class, 'store']);

Route::get('admin/contacts/unread-count', [ContactController::class, 'unreadCount']);
Route::apiResource('admin/contacts', ContactController::class)->except(['store']);
