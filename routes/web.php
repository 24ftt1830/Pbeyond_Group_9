<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Temporary file for debugging post-vps db connection
Route::get('/test-route', function () {
    return 'The application is working but theres STILL AN ISSUE';
});

Route::get('/debug-session', function () {
    session(['test_key' => 'it_works!']);
    return session('test_key');
});

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
        Route::get('/dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
        Route::get('/students', fn () => Inertia::render('Admin/Students'))->name('students');
        Route::get('/companies', fn () => Inertia::render('Admin/Companies'))->name('companies');
        Route::get('/placements', fn () => Inertia::render('Admin/Placements'))->name('placements');
        Route::get('/manage-users', fn () => Inertia::render('Admin/ManageUsers'))->name('manage-users');

        Route::get('/reports', fn () => Inertia::render('Admin/Reports'))->name('reports');
        Route::get('/support', fn () => Inertia::render('Admin/Support'))->name('support');
        Route::get('/calendar', fn () => Inertia::render('Admin/Calendar'))->name('calendar');
    });

    Route::prefix('company')->name('company.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Company/Dashboard'))->name('dashboard');
        Route::get('/vacancies', fn () => Inertia::render('Company/Vacancies'))->name('vacancies');
        Route::get('/applicants', fn () => Inertia::render('Company/Applicants'))->name('applicants');
        Route::get('/interns', fn () => Inertia::render('Company/Interns'))->name('interns');
        Route::get('/representatives', fn () => Inertia::render('Company/Representatives'))->name('representatives');
        Route::get('/interviews', fn () => Inertia::render('Company/Interviews'))->name('interviews');

        Route::get('/contact-support', fn () => Inertia::render('Company/ContactSupport'))->name('contact-support');
        Route::get('/faqs', fn () => Inertia::render('Company/Faqs'))->name('faqs');
        Route::get('/calendar', fn () => Inertia::render('Company/Calendar'))->name('calendar');
    });
});

require __DIR__.'/auth.php';
