<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\EventController;

use App\Http\Controllers\Company\QuotaController;
use App\Http\Controllers\Company\RepresentativeController;

use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\CompanyController as StudentCompanyController;
use App\Http\Controllers\Student\ApplicationController as StudentApplicationController;
use App\Http\Controllers\Student\DocumentController as StudentDocumentController;
use App\Http\Controllers\Student\FaqController as StudentFaqController;
use App\Http\Controllers\Student\FavouriteController as StudentFavouriteController;
use App\Http\Controllers\Student\ReportController as StudentReportController;
use App\Http\Controllers\Student\CalendarController as StudentCalendarController;
use App\Http\Controllers\Student\ProfileController as StudentProfileController;

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
    // Dev access for me
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

    // --- Admin Routes (protected by admin middleware) ---
    Route::middleware(['auth', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        // Companies
        Route::get('/companies', [App\Http\Controllers\Admin\CompanyController::class, 'index'])->name('companies');
        Route::post('/companies/{company}/approve', [App\Http\Controllers\Admin\CompanyController::class, 'approve'])->name('companies.approve');
        Route::post('/companies/{company}/reject', [App\Http\Controllers\Admin\CompanyController::class, 'reject'])->name('companies.reject');
        Route::post('/companies', [App\Http\Controllers\Admin\CompanyController::class, 'store'])->name('companies.store');

        // Placements
        Route::get('/placements', [App\Http\Controllers\Admin\PlacementController::class, 'index'])->name('placements');
        Route::post('/placements/{quota}/approve', [App\Http\Controllers\Admin\PlacementController::class, 'approve'])->name('placements.approve');
        Route::post('/placements/{quota}/reject', [App\Http\Controllers\Admin\PlacementController::class, 'reject'])->name('placements.reject');
        Route::post('/placements/{quota}/release', [App\Http\Controllers\Admin\PlacementController::class, 'release'])->name('placements.release');
        Route::get('/placements/{quota}/applications', [App\Http\Controllers\Admin\PlacementController::class, 'applications'])->name('placements.applications');

        // Manage Users
        Route::get('/manage-users', [App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('manage-users');
        Route::post('/manage-users', [App\Http\Controllers\Admin\UserManagementController::class, 'store'])->name('manage-users.store');
        Route::post('/manage-users/import', [App\Http\Controllers\Admin\UserManagementController::class, 'import'])->name('manage-users.import');
        Route::get('/manage-users/{id}/edit', [App\Http\Controllers\Admin\UserManagementController::class, 'edit'])->name('manage-users.edit');
        Route::put('/manage-users/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('manage-users.update');
        Route::delete('/manage-users/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('manage-users.destroy');

        // Students
        Route::get('/students', [App\Http\Controllers\Admin\StudentController::class, 'index'])->name('students');
        Route::get('/students/{student}', [App\Http\Controllers\Admin\StudentController::class, 'show'])->name('students.show');
        Route::post('/students/{student}/approve', [App\Http\Controllers\Admin\StudentController::class, 'approve'])->name('students.approve');
        Route::post('/students/{student}/reject', [App\Http\Controllers\Admin\StudentController::class, 'reject'])->name('students.reject');

        // Application review (Gatekeeper)
        Route::get('/applications/review', [App\Http\Controllers\Admin\ApplicationReviewController::class, 'index'])->name('applications.review');
        Route::post('/applications/{application}/approve', [App\Http\Controllers\Admin\ApplicationReviewController::class, 'approve'])->name('applications.approve');
        Route::post('/applications/{application}/reject', [App\Http\Controllers\Admin\ApplicationReviewController::class, 'reject'])->name('applications.reject');

        // Admin can update application status directly (optional)
        Route::post('/applications/{application}/update', [App\Http\Controllers\Admin\ApplicationController::class, 'update'])->name('admin.applications.update');

        // Reports (Grievance Portal) – using controller instead of closure
        Route::get('/reports', [App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports');
        Route::post('/reports/{report}/resolve', [App\Http\Controllers\Admin\ReportController::class, 'resolve'])->name('reports.resolve');

        // Other admin pages
        Route::get('/support', fn () => Inertia::render('Admin/Support'))->name('support');
        Route::get('/calendar', fn () => Inertia::render('Admin/Calendar'))->name('calendar');

        // Calendar events
        Route::post('/events', [EventController::class, 'store'])->name('events.store');
    });

    // --- Company Routes ---
    Route::middleware(['auth'])->prefix('company')->name('company.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Company/Dashboard'))->name('dashboard');

        // Quota Management
        Route::get('/quotas', [App\Http\Controllers\Company\QuotaController::class, 'index'])->name('quotas');
        Route::post('/quotas', [App\Http\Controllers\Company\QuotaController::class, 'store'])->name('quotas.store');
        Route::delete('/quotas/{quota}', [App\Http\Controllers\Company\QuotaController::class, 'destroy'])->name('quotas.destroy');

        // Applicants (will later be filtered to Pending_Company)
        Route::get('/applicants', [App\Http\Controllers\Company\ApplicantController::class, 'index'])->name('applicants');
        Route::post('/applicants/{application}/review', [App\Http\Controllers\Company\ApplicantController::class, 'review'])->name('applicants.review');

        // Representatives
        Route::get('/representatives', [App\Http\Controllers\Company\RepresentativeController::class, 'index'])->name('representatives');

        // Other placeholders
        Route::get('/interns', fn () => Inertia::render('Company/Interns'))->name('interns');
        Route::get('/interviews', fn () => Inertia::render('Company/Interviews'))->name('interviews');
        Route::get('/contact-support', fn () => Inertia::render('Company/ContactSupport'))->name('contact-support');
        Route::get('/faqs', fn () => Inertia::render('Company/Faqs'))->name('faqs');
        Route::get('/calendar', fn () => Inertia::render('Company/Calendar'))->name('calendar');
    });

    // --- Student Routes ---
    Route::prefix('student')->name('student.')->group(function () {
        Route::get('/profile', [StudentProfileController::class, 'index'])->name('profile');
        Route::post('/profile', [StudentProfileController::class, 'update'])->name('profile.update');

        Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
        Route::get('/companies', [StudentCompanyController::class, 'index'])->name('companies');
        Route::get('/companies/{company}', [StudentCompanyController::class, 'show'])->name('companies.view');
        Route::post('/companies/{company}/apply', [StudentCompanyController::class, 'apply'])->name('companies.apply');
        Route::get('/application-tracking', [StudentApplicationController::class, 'index'])->name('application-tracking');
        Route::post('/applications/{application}/accept', [StudentApplicationController::class, 'accept'])->name('applications.accept');
        Route::get('/calendar', [StudentCalendarController::class, 'index'])->name('calendar');
        Route::get('/documentations', [StudentDocumentController::class, 'index'])->name('documentations');
        Route::post('/documentations/upload', [StudentDocumentController::class, 'upload'])->name('documentations.upload');
        Route::delete('/documentations/{document}', [StudentDocumentController::class, 'destroy'])->name('documentations.destroy');
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
