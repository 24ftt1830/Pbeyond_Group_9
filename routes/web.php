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
        // Dashboard
        Route::get('/dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');

        // Companies
        Route::get('/companies', [App\Http\Controllers\Admin\CompanyController::class, 'index'])->name('companies');
        Route::post('/companies/{company}/approve', [App\Http\Controllers\Admin\CompanyController::class, 'approve'])->name('companies.approve');
        Route::post('/companies/{company}/reject', [App\Http\Controllers\Admin\CompanyController::class, 'reject'])->name('companies.reject');

        // Placements
        Route::get('/placements', [App\Http\Controllers\Admin\PlacementController::class, 'index'])->name('placements');
        Route::post('/placements/{quota}/approve', [App\Http\Controllers\Admin\PlacementController::class, 'approve'])->name('placements.approve');
        Route::post('/placements/{quota}/reject', [App\Http\Controllers\Admin\PlacementController::class, 'reject'])->name('placements.reject');
        Route::post('/placements/{quota}/release', [App\Http\Controllers\Admin\PlacementController::class, 'release'])->name('placements.release');
        Route::get('/placements/{quota}/applications', [App\Http\Controllers\Admin\PlacementController::class, 'applications'])->name('placements.applications');

        // Manage Users (Company representatives)
        Route::get('/manage-users', [App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('manage-users');
        Route::post('/manage-users', [App\Http\Controllers\Admin\UserManagementController::class, 'store'])->name('users.store');
        Route::get('/manage-users/{user}/edit', [App\Http\Controllers\Admin\UserManagementController::class, 'edit'])->name('users.edit');
        Route::put('/manage-users/{user}', [App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('users.update');
        Route::delete('/manage-users/{user}', [App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('users.destroy');

        Route::get('/students', [App\Http\Controllers\Admin\StudentController::class, 'index'])->name('students');
        Route::get('/students/{student}', [App\Http\Controllers\Admin\StudentController::class, 'show'])->name('students.show');
        Route::post('/students/{student}/approve', [App\Http\Controllers\Admin\StudentController::class, 'approve'])->name('students.approve');
        Route::post('/students/{student}/reject', [App\Http\Controllers\Admin\StudentController::class, 'reject'])->name('students.reject');

        Route::get('/reports', fn () => Inertia::render('Admin/Reports'))->name('reports');
        Route::get('/support', fn () => Inertia::render('Admin/Support'))->name('support');
        Route::get('/calendar', fn () => Inertia::render('Admin/Calendar'))->name('calendar');


    });

    // --- Company Routes (no data yet, just placeholders) ---
    Route::prefix('company')->name('company.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Company/Dashboard'))->name('dashboard');
        Route::get('/quotas', fn () => Inertia::render('Company/Quotas'))->name('quotas');
        Route::get('/applicants', fn () => Inertia::render('Company/Applicants'))->name('applicants');
        Route::get('/interns', fn () => Inertia::render('Company/Interns'))->name('interns');
        Route::get('/representatives', fn () => Inertia::render('Company/Representatives'))->name('representatives');
        Route::get('/interviews', fn () => Inertia::render('Company/Interviews'))->name('interviews');
        Route::get('/contact-support', fn () => Inertia::render('Company/ContactSupport'))->name('contact-support');
        Route::get('/faqs', fn () => Inertia::render('Company/Faqs'))->name('faqs');
        Route::get('/calendar', fn () => Inertia::render('Company/Calendar'))->name('calendar');
    });

     // --- Student Routes ---
    Route::prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Student/Dashboard'))->name('dashboard');
        Route::get('/companies', function () {
            return Inertia::render('Student/CompaniesList', [
                'companies' => Company::query()
                    ->select([
                        'id',
                        'name',
                        'status',
                        'quota_availability',
                        'interview_required',
                        'school',
                        'district',
                        'description',
                        'additional_information',
                    ])
                    ->orderBy('id')
                    ->get(),
            ]);
        })->name('companies');
        Route::get('/companies/{company}', function (Company $company) {
            $hasApplied = InternshipApplication::query()
                ->where('user_id', auth()->id())
                ->where('company_id', $company->id)
                ->exists();

            return Inertia::render('Student/ViewCompany', [
                'company' => $company,
                'hasApplied' => $hasApplied,
            ]);
        })->name('companies.view');
        Route::post('/companies/{company}/apply', function (Company $company) {
            if ($company->quota_availability <= 0 || strtolower($company->status) === 'full') {
                throw ValidationException::withMessages([
                    'apply' => 'Application rejected because slots are full.',
                ]);
            }

            InternshipApplication::query()->firstOrCreate(
                [
                    'user_id' => auth()->id(),
                    'company_id' => $company->id,
                ],
                [
                    'status' => 'Applied',
                    'applied_at' => now(),
                ]
            );

            return back();
        })->name('companies.apply');
        Route::get('/favourites', fn () => Inertia::render('Student/Favourites'))->name('favourites');
        Route::get('/application-tracking', function () {
            $applications = InternshipApplication::query()
                ->where('user_id', auth()->id())
                ->with('company:id,name')
                ->latest('applied_at')
                ->get();

            return Inertia::render('Student/ApplicationTracking', [
                'applications' => $applications,
            ]);
        })->name('application-tracking');
        Route::get('/documentations', fn () => Inertia::render('Student/Documentations'))->name('documentations');
        Route::get('/report-issue', fn () => Inertia::render('Student/ReportIssue'))->name('report-issue');
        Route::get('/faqs', fn () => Inertia::render('Student/FAQs'))->name('faqs');
        Route::get('/calendar', fn () => Inertia::render('Student/Calendar'))->name('calendar');
        Route::get('/past-reports', fn () => Inertia::render('Student/PastReports'))->name('past-reports');
    });
});

require __DIR__.'/auth.php';
