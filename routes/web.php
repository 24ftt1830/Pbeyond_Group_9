<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- Admin Routes ---
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
        Route::get('/students', fn () => Inertia::render('Dashboard'))->name('students');
        Route::get('/companies', fn () => Inertia::render('Dashboard'))->name('companies');
        Route::get('/placements', fn () => Inertia::render('Dashboard'))->name('placements');

        Route::get('/reports', fn () => Inertia::render('Dashboard'))->name('reports');
        Route::get('/support', fn () => Inertia::render('Dashboard'))->name('support');
        Route::get('/calendar', fn () => Inertia::render('Dashboard'))->name('calendar');
    });

    Route::prefix('company')->name('company.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
        Route::get('/vacancies', fn () => Inertia::render('Dashboard'))->name('vacancies');
        Route::get('/applicants', fn () => Inertia::render('Dashboard'))->name('applicants');
        Route::get('/interns', fn () => Inertia::render('Dashboard'))->name('interns');
        Route::get('/representatives', fn () => Inertia::render('Dashboard'))->name('representatives');
        Route::get('/interviews', fn () => Inertia::render('Dashboard'))->name('interviews');

        Route::get('/contact-support', fn () => Inertia::render('Dashboard'))->name('contact-support');
        Route::get('/faqs', fn () => Inertia::render('Dashboard'))->name('faqs');
        Route::get('/calendar', fn () => Inertia::render('Dashboard'))->name('calendar');
    });
});

require __DIR__.'/auth.php';
