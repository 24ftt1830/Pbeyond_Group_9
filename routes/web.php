<?php

use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\ApplicationTrackingController;
use App\Http\Controllers\Student\CalendarController as StudentCalendarController;
use App\Http\Controllers\Student\CompanyController as StudentCompanyController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\DocumentController as StudentDocumentController;
use App\Http\Controllers\Student\FaqController as StudentFaqController;
use App\Http\Controllers\Student\FavouriteController as StudentFavouriteController;
use App\Http\Controllers\Student\ProfileController as StudentProfileController;
use App\Http\Controllers\Student\ReportController as StudentReportController;
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

Route::middleware('auth')->group(function () {
    // --- Shared / Dev Routes ---
    Route::post('/dev/switch-role/{role}', function ($role) {
        if (! in_array($role, ['Admin', 'Student', 'Company'])) {
            return back()->withErrors('Invalid role');
        }
        auth()->user()->update(['role' => $role]);
        return back()->with('success', 'Role updated!');
    })->name('dev.switch-role');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- Admin Routes ---
    Route::middleware(['role:Admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        // Company Management
        Route::prefix('companies')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\CompanyController::class, 'index'])->name('companies');
            Route::post('/', [App\Http\Controllers\Admin\CompanyController::class, 'store'])->name('companies.store');
            Route::post('/{company}/approve', [App\Http\Controllers\Admin\CompanyController::class, 'approve'])->name('companies.approve');
            Route::post('/{company}/reject', [App\Http\Controllers\Admin\CompanyController::class, 'reject'])->name('companies.reject');
        });

        // Placements / Quotas (Renamed prefix to 'quotas' to avoid collision)
        Route::prefix('quotas')->name('placements.')->group(function () {
            Route::post('/{quota}/approve', [App\Http\Controllers\Admin\PlacementController::class, 'approve'])->name('approve');
            Route::post('/{quota}/reject', [App\Http\Controllers\Admin\PlacementController::class, 'reject'])->name('reject');
            Route::post('/{quota}/release', [App\Http\Controllers\Admin\PlacementController::class, 'release'])->name('release');
            Route::get('/{quota}/applications', [App\Http\Controllers\Admin\PlacementController::class, 'applications'])->name('applications');
        });
        
        // General Placements index
        Route::get('/placements', [App\Http\Controllers\Admin\PlacementController::class, 'index'])->name('placements');

        // User Management
        Route::prefix('manage-users')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('manage-users');
            Route::post('/', [App\Http\Controllers\Admin\UserManagementController::class, 'store'])->name('manage-users.store');
            Route::post('/import', [App\Http\Controllers\Admin\UserManagementController::class, 'import'])->name('students.import');
            Route::get('/{id}/edit', [App\Http\Controllers\Admin\UserManagementController::class, 'edit'])->name('manage-users.edit');
            Route::put('/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('manage-users.update');
            Route::delete('/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('manage-users.destroy');
        });

        Route::get('/applications', [App\Http\Controllers\Admin\ApplicationController::class, 'index'])->name('applications');
        Route::get('/profile', [App\Http\Controllers\Admin\ProfileController::class, 'index'])->name('profile');
        
        Route::prefix('reports')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports');
            Route::post('/{report}/resolve', [App\Http\Controllers\Admin\ReportController::class, 'resolve'])->name('reports.resolve');
        });

        Route::get('/support', fn () => Inertia::render('Admin/Support'))->name('support');
        Route::get('/calendar', fn () => Inertia::render('Admin/Calendar'))->name('calendar');
        Route::post('/events', [EventController::class, 'store'])->name('events.store');
    });

    // --- Company Routes ---
    Route::middleware(['role:Company'])->prefix('company')->name('company.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Company/Dashboard'))->name('dashboard');
        Route::get('/quotas', [App\Http\Controllers\Company\QuotaController::class, 'index'])->name('quotas');
        Route::post('/quotas', [App\Http\Controllers\Company\QuotaController::class, 'store'])->name('quotas.store');
        Route::delete('/quotas/{quota}', [App\Http\Controllers\Company\QuotaController::class, 'destroy'])->name('quotas.destroy');
        Route::get('/applications', [App\Http\Controllers\Company\ApplicationController::class, 'index'])->name('applications');
        Route::get('/applications/{quota}', [App\Http\Controllers\Company\ApplicationController::class, 'show'])->name('applications.show');
        Route::post('/applications/{quota:quota_id}/update-status/{application}', [App\Http\Controllers\Company\ApplicationController::class, 'updateStatus'])->name('applications.update-status');
        Route::get('/representatives', [App\Http\Controllers\Company\RepresentativeController::class, 'index'])->name('representatives');
        Route::get('/profile', [App\Http\Controllers\Company\ProfileController::class, 'index'])->name('profile');
        Route::get('/interns', fn () => Inertia::render('Company/Interns'))->name('interns');
        Route::get('/contact-support', fn () => Inertia::render('Company/ContactSupport'))->name('contact-support');
        Route::get('/faqs', fn () => Inertia::render('Company/Faqs'))->name('faqs');
        Route::get('/calendar', fn () => Inertia::render('Company/Calendar'))->name('calendar');
    });

    // --- Student Routes ---
    Route::middleware(['role:Student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/profile', [StudentProfileController::class, 'index'])->name('profile');
        Route::post('/profile', [StudentProfileController::class, 'update'])->name('profile.update');
        Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
        Route::get('/companies', [StudentCompanyController::class, 'index'])->name('companies');
        Route::get('/companies/{company}', [StudentCompanyController::class, 'show'])->name('companies.view');
        Route::post('/companies/{company}/apply', [StudentCompanyController::class, 'apply'])->name('companies.apply');
        Route::get('/application-tracking', [App\Http\Controllers\Student\ApplicationTrackingController::class, 'index'])->name('application-tracking');
        Route::get('/calendar', [StudentCalendarController::class, 'index'])->name('calendar');
        Route::get('/faqs', [StudentFaqController::class, 'index'])->name('faqs');
        Route::get('/favourites', [StudentFavouriteController::class, 'index'])->name('favourites');
        Route::post('/favourites/{company}', [StudentFavouriteController::class, 'store'])->name('favourites.store');
        Route::delete('/favourites/{company}', [StudentFavouriteController::class, 'destroy'])->name('favourites.destroy');
        Route::get('/past-reports', [StudentReportController::class, 'index'])->name('past-reports');
        Route::get('/report-issue', [StudentReportController::class, 'create'])->name('report-issue');
        Route::post('/report-issue', [StudentReportController::class, 'store'])->name('report-issue.store');
    });
});

require __DIR__.'/auth.php';