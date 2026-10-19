<?php
use App\Http\Controllers\AcademicSupervisor\EvaluationController as AcademicEvaluationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\InterventionController;
use App\Http\Controllers\Admin\EvaluationTemplateController;
use App\Http\Controllers\SupervisorEvaluationController;
use App\Http\Controllers\FinalInternshipReportController;
use App\Http\Controllers\Student\CalendarController as StudentCalendarController;
use App\Http\Controllers\Student\CompanyController as StudentCompanyController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\FaqController as StudentFaqController;
use App\Http\Controllers\Student\FavouriteController as StudentFavouriteController;
use App\Http\Controllers\Student\LogbookController;
use App\Http\Controllers\Student\ProfileController as StudentProfileController;
use App\Http\Controllers\Student\ReportController as StudentReportController;
use App\Http\Controllers\AcademicSupervisor\LogbookController as AcademicSupervisorLogbookController;
use App\Http\Controllers\AcademicSupervisor\StudentController as AcademicSupervisorStudentController;
use App\Http\Controllers\IndustrySupervisor\StudentController as IndustrySupervisorStudentController;
use App\Http\Controllers\AcademicSupervisor\VisitController as AcademicSupervisorVisitController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Event;

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
    if (app()->environment('local', 'staging')) {

        Route::post('/dev/switch-role/{role}', function ($role) {

            if (! in_array($role, [
                'Admin',
                'Student',
                'Company',
                'Academic Supervisor',
            ])) {
                return back()->withErrors('Invalid role');
            }

            auth()->user()->update([
                'role' => $role,
            ]);

            return back()->with('success', 'Role updated!');
        })->name('dev.switch-role');
    }


    // --- Shared Profile Routes ---

    Route::get('/profile', [
        ProfileController::class,
        'edit'
    ])->name('profile.edit');

    Route::match(['post', 'patch'], '/profile', [
        ProfileController::class,
        'update'
    ])->name('profile.update');

    Route::get('/students/{student}/insurance', [StudentProfileController::class, 'downloadInsurance'])->name('students.insurance.download');
    Route::get('/logbooks/{entry}/attachments/{attachment}', [LogbookController::class, 'downloadAttachment'])->name('logbook.attachments.download');

    Route::delete('/profile', [
        ProfileController::class,
        'destroy'
    ])->name('profile.destroy');


    // =========================================================
    // ADMIN ROUTES
    // =========================================================

    Route::middleware(['role:Admin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {

            Route::get(
                '/dashboard',
                [App\Http\Controllers\Admin\DashboardController::class, 'index']
            )->name('dashboard');

            // Temporary catalogue of current interface patterns for the Admin review.
            Route::get('/ui-reference', fn () => Inertia::render('Admin/UIReference'))->name('ui-reference');

            Route::get('/academic-semesters', [App\Http\Controllers\Admin\AcademicSemesterController::class, 'index'])->name('academic-semesters');
            Route::post('/academic-semesters', [App\Http\Controllers\Admin\AcademicSemesterController::class, 'store'])->name('academic-semesters.store');
            Route::put('/academic-semesters/{semester}', [App\Http\Controllers\Admin\AcademicSemesterController::class, 'update'])->name('academic-semesters.update');

            // Superadmin management remains in the existing Admin portal.
            Route::get('/students', [App\Http\Controllers\Admin\StudentRecordController::class, 'index'])->name('students');
            Route::get('/unplaced-students', [App\Http\Controllers\Admin\UnplacedStudentController::class, 'index'])->name('unplaced-students');
            Route::get('/students/{student}', [App\Http\Controllers\Admin\StudentRecordController::class, 'show'])->name('students.show');
            Route::get('/students/{student}/profile', [StudentProfileController::class, 'index'])->name('students.profile');
            Route::post('/students/{student}/profile', [StudentProfileController::class, 'update'])->name('students.profile.update');
            Route::get('/students/{student}/cv', [App\Http\Controllers\Admin\StudentRecordController::class, 'cv'])->name('students.cv');
            Route::put('/students/{student}/dates', [App\Http\Controllers\Admin\StudentRecordController::class, 'dates'])->name('students.dates');
            Route::put('/students/{student}/company-confirmation', [App\Http\Controllers\Admin\StudentRecordController::class, 'confirmCompany'])->name('students.company-confirmation');
            Route::put('/students/{student}/completion', [App\Http\Controllers\Admin\StudentRecordController::class, 'decide'])->name('students.completion');
            Route::put('/students/{student}/academic-assignment', [App\Http\Controllers\Admin\StudentRecordController::class, 'assignAcademic'])->name('students.academic-assignment');
            Route::put('/students/{student}/monitoring', [App\Http\Controllers\Admin\StudentRecordController::class, 'monitoring'])->name('students.monitoring');
            Route::post('/students/{student}/visits', [App\Http\Controllers\Admin\StudentRecordController::class, 'visit'])->name('students.visits');
            Route::put('/students/{student}/visits/{visit}', [App\Http\Controllers\Admin\StudentRecordController::class, 'updateVisit'])->name('students.visits.update');
            Route::get('/students/{student}/evaluations/{submission}', [App\Http\Controllers\Admin\StudentRecordController::class, 'evaluation'])->name('students.evaluations.show');
            Route::post('/students/{student}/evaluations/{submission}/reopen', [App\Http\Controllers\Admin\StudentRecordController::class, 'reopenEvaluation'])->name('students.evaluations.reopen');
            Route::get('/students/{student}/written-report', [FinalInternshipReportController::class, 'admin'])->name('students.report');
            Route::get('/students/{student}/written-report/pdf', [FinalInternshipReportController::class, 'download'])->name('students.report.pdf');
            Route::post('/students/{student}/written-report/reopen', [App\Http\Controllers\Admin\StudentRecordController::class, 'reopenReport'])->name('students.report.reopen');
            Route::get('/logbooks/{submission}', [AcademicSupervisorLogbookController::class, 'review'])->name('logbooks.review');
            Route::post('/logbooks/{submission}/review', [AcademicSupervisorLogbookController::class, 'markReviewed'])->name('logbooks.update');
            Route::post('/students/{student}/logbooks/{submission}/reopen', [App\Http\Controllers\Admin\StudentRecordController::class, 'reopenLogbook'])->name('students.logbooks.reopen');
            Route::get('/manage-users/supervisors', [App\Http\Controllers\Admin\SupervisorManagementController::class, 'index'])->name('supervisors');
            Route::post('/manage-users/supervisors', [App\Http\Controllers\Admin\SupervisorManagementController::class, 'store'])->name('supervisors.store');
            Route::put('/manage-users/supervisors/{type}/{id}', [App\Http\Controllers\Admin\SupervisorManagementController::class, 'update'])->name('supervisors.update');
            Route::get('/companies/{company}/manage', [App\Http\Controllers\Admin\CompanyRecordController::class, 'show'])->name('companies.manage');
            Route::put('/companies/{company}', [App\Http\Controllers\Admin\CompanyRecordController::class, 'update'])->name('companies.update');
            Route::post('/companies/{company}/quotas', [App\Http\Controllers\Admin\CompanyRecordController::class, 'storeQuota'])->name('companies.quotas.store');
            Route::put('/quotas/{quota:quota_id}', [App\Http\Controllers\Admin\CompanyRecordController::class, 'updateQuota'])->name('quotas.update');
            Route::delete('/quotas/{quota:quota_id}', [App\Http\Controllers\Admin\CompanyRecordController::class, 'destroyQuota'])->name('quotas.destroy');
            Route::post('/quotas/{quota:quota_id}/close', [App\Http\Controllers\Admin\CompanyRecordController::class, 'closeQuota'])->name('quotas.close');
            Route::put('/applications/{application}', [App\Http\Controllers\Admin\CompanyRecordController::class, 'application'])->name('applications.update');

            Route::get('/evaluations', [EvaluationTemplateController::class, 'index'])->name('evaluations');
            Route::post('/evaluations', [EvaluationTemplateController::class, 'store'])->name('evaluations.store');
            Route::put('/evaluations/student-written-report', [EvaluationTemplateController::class, 'saveReportComponent'])->name('evaluations.report-component');
            Route::post('/evaluations/student-written-report/rubric', [EvaluationTemplateController::class, 'saveWrittenReportTemplate'])->name('evaluations.report-rubric');
            Route::post('/evaluations/activate', [EvaluationTemplateController::class, 'activateAll'])->name('evaluations.activate');
            Route::put('/evaluations/{template}', [EvaluationTemplateController::class, 'update'])->name('evaluations.update');
            
            Route::get(
                '/interventions',
                [InterventionController::class, 'index']
            )->name('interventions');

            Route::delete(
                '/events/{event}',
                [EventController::class, 'destroy']
            )->name('events.destroy');


            // Company Management

            Route::prefix('companies')->group(function () {

                Route::get(
                    '/',
                    [App\Http\Controllers\Admin\CompanyController::class, 'index']
                )->name('companies');

                Route::post(
                    '/',
                    [App\Http\Controllers\Admin\CompanyController::class, 'store']
                )->name('companies.store');

                Route::post(
                    '/import',
                    [App\Http\Controllers\Admin\CompanyController::class, 'import']
                )->name('companies.import');

                Route::post(
                    '/{company}/approve',
                    [App\Http\Controllers\Admin\CompanyController::class, 'approve']
                )->name('companies.approve');

                Route::post(
                    '/{company}/reject',
                    [App\Http\Controllers\Admin\CompanyController::class, 'reject']
                )->name('companies.reject');
            });


            // Placements / Quotas

            Route::prefix('quotas')
                ->name('placements.')
                ->group(function () {

                    Route::post(
                        '/{quota}/approve',
                        [App\Http\Controllers\Admin\PlacementController::class, 'approve']
                    )->name('approve');

                    Route::post(
                        '/{quota}/reject',
                        [App\Http\Controllers\Admin\PlacementController::class, 'reject']
                    )->name('reject');

                    Route::post(
                        '/{quota}/release',
                        [App\Http\Controllers\Admin\PlacementController::class, 'release']
                    )->name('release');

                    Route::get(
                        '/{quota}/applications',
                        [App\Http\Controllers\Admin\PlacementController::class, 'applications']
                    )->name('applications');
                });


            Route::get(
                '/placements',
                [App\Http\Controllers\Admin\PlacementController::class, 'index']
            )->name('placements');


            // User Management

            Route::prefix('manage-users')->group(function () {

                Route::get(
                    '/',
                    [App\Http\Controllers\Admin\UserManagementController::class, 'index']
                )->name('manage-users');

                Route::post(
                    '/',
                    [App\Http\Controllers\Admin\UserManagementController::class, 'store']
                )->name('manage-users.store');

                Route::post(
                    '/import',
                    [App\Http\Controllers\Admin\UserManagementController::class, 'import']
                )->name('students.import');

                Route::get(
                    '/{id}/edit',
                    [App\Http\Controllers\Admin\UserManagementController::class, 'edit']
                )->name('manage-users.edit');

                Route::put(
                    '/{id}',
                    [App\Http\Controllers\Admin\UserManagementController::class, 'update']
                )->name('manage-users.update');

                Route::delete(
                    '/{id}',
                    [App\Http\Controllers\Admin\UserManagementController::class, 'destroy']
                )->name('manage-users.destroy');
            });


            Route::get(
                '/applications',
                [App\Http\Controllers\Admin\ApplicationController::class, 'index']
            )->name('applications');


            Route::get(
                '/profile',
                [App\Http\Controllers\Admin\ProfileController::class, 'index']
            )->name('profile');


            // Reports

            Route::prefix('reports')->group(function () {

                Route::get(
                    '/',
                    [App\Http\Controllers\Admin\ReportController::class, 'index']
                )->name('reports');

                Route::post(
                    '/{report}/resolve',
                    [App\Http\Controllers\Admin\ReportController::class, 'resolve']
                )->name('reports.resolve');
            });


            Route::get(
                '/support',
                fn () => Inertia::render('Admin/Support')
            )->name('support');


            // Calendar

            Route::get('/calendar', function () {

                return Inertia::render('Admin/Calendar', [
                    'events' => Event::all()->map(function ($event) {

                        return [
                            'id' => $event->id,
                            'title' => $event->title,
                            'description' => $event->description,
                            'startDate' => $event->start_date,
                            'endDate' => $event->end_date,
                            'variant' => $event->variant ?? 'primary',
                        ];
                    }),
                ]);

            })->name('calendar');


            Route::post(
                '/events',
                [EventController::class, 'store']
            )->name('events.store');
        });


    // =========================================================
    // COMPANY ROUTES
    // =========================================================

    Route::middleware(['role:Company'])
        ->prefix('company')
        ->name('company.')
        ->group(function () {

            Route::get(
                '/dashboard',
                [\App\Http\Controllers\Company\DashboardController::class, 'index']
            )->name('dashboard');

            Route::post(
                '/onboarding/complete',
                [\App\Http\Controllers\Company\DashboardController::class, 'completeOnboarding']
            )->name('onboarding.complete');

            Route::get(
                '/quotas',
                [App\Http\Controllers\Company\QuotaController::class, 'index']
            )->name('quotas');

            Route::post(
                '/quotas',
                [App\Http\Controllers\Company\QuotaController::class, 'store']
            )->name('quotas.store');

            Route::put(
                '/quotas/{quota}',
                [App\Http\Controllers\Company\QuotaController::class, 'update']
            )->name('quotas.update');

            Route::delete(
                '/quotas/{quota}',
                [App\Http\Controllers\Company\QuotaController::class, 'destroy']
            )->name('quotas.destroy');

            Route::post(
                '/quotas/{quota}/close',
                [App\Http\Controllers\Company\QuotaController::class, 'close']
            )->name('quotas.close');

            Route::get(
                '/applications',
                [App\Http\Controllers\Company\ApplicationController::class, 'index']
            )->name('applications');

            Route::get(
                '/applications/{quota}',
                [App\Http\Controllers\Company\ApplicationController::class, 'show']
            )->name('applications.show');

            Route::get(
                '/application/{application}',
                [App\Http\Controllers\Company\ApplicationController::class, 'viewSingle']
            )->name('applications.view');

            Route::put(
                '/applications/{quota:quota_id}/update-status/{application}',
                [App\Http\Controllers\Company\ApplicationController::class, 'updateStatus']
            )->name('applications.update-status');

            Route::get(
                '/representatives',
                [App\Http\Controllers\Company\RepresentativeController::class, 'index']
            )->name('representatives');

            // COMPANY MANAGE USERS
            Route::get(
                '/manage-users',
                [App\Http\Controllers\Company\UserManagementController::class, 'index']
            )->name('manage-users');

            Route::post(
                '/manage-users',
                [App\Http\Controllers\Company\UserManagementController::class, 'store']
            )->name('manage-users.store');
            Route::put('/manage-users/{supervisor}/assignments', [App\Http\Controllers\Company\UserManagementController::class, 'assign'])->name('manage-users.assignments');

            Route::get(
                '/profile',
                [App\Http\Controllers\Company\ProfileController::class, 'show']
            )->name('profile');

            Route::put(
                '/profile',
                [App\Http\Controllers\Company\ProfileController::class, 'update']
            )->name('profile.update');

            Route::get(
                '/interns',
                [App\Http\Controllers\Company\InternController::class, 'index']
            )->name('interns');

            Route::put(
                '/interns/{application}/dates',
                [App\Http\Controllers\Company\InternController::class, 'updateDates']
            )->name('interns.update-dates');

            Route::get(
                '/contact-support',
                fn () => Inertia::render('Company/ContactSupport')
            )->name('contact-support');

            Route::get(
                '/faqs',
                fn () => Inertia::render('Company/Faqs')
            )->name('faqs');

            Route::get(
                '/calendar',
                fn () => Inertia::render('Company/Calendar')
            )->name('calendar');
        });


    // =========================================================
    // ACADEMIC SUPERVISOR ROUTES
    // =========================================================

    Route::middleware(['role:Academic Supervisor'])
        ->prefix('academic-supervisor')
        ->name('academic-supervisor.')
        ->group(function () {
              Route::get(
                '/dashboard',
                [App\Http\Controllers\AcademicSupervisor\DashboardController::class, 'index']
            )->name('dashboard');

            // Logbook

            Route::get(
                '/logbook',
                [AcademicSupervisorLogbookController::class, 'index']
            )->name('logbook');

            Route::get(
                '/logbook/{submission}/review',
                [AcademicSupervisorLogbookController::class, 'review']
            )->name('logbook.review');

            Route::post(
                '/logbook/{submission}/mark-reviewed',
                [AcademicSupervisorLogbookController::class, 'markReviewed']
            )->name('logbook.mark-reviewed');

            // Students

            Route::get(
                '/students',
                [AcademicSupervisorStudentController::class, 'index']
            )->name('students');
            Route::post('/students/assign', [AcademicSupervisorStudentController::class, 'assign'])->name('students.assign');

            Route::get(
                '/students/{student}',
                [AcademicSupervisorStudentController::class, 'show']
            )->name('student.show');

            Route::put(
                '/students/{student}/monitoring-status',
                [AcademicSupervisorStudentController::class, 'updateMonitoringStatus']
            )->name('student.monitoring-status.update');

            Route::put('/students/{student}/completion-decision', [AcademicSupervisorStudentController::class, 'updateCompletionDecision'])
                ->name('student.completion-decision.update');

            // Internship Visits

            Route::post(
                '/students/{student}/visits',
                [AcademicSupervisorVisitController::class, 'store']
            )->name('student.visits.store');

            //Evaluation check
            Route::post('/students/{student}/evaluation/complete', [AcademicEvaluationController::class, 'complete'])
             ->name('student.evaluation.complete');

            Route::get('/students/{student}/evaluate', [SupervisorEvaluationController::class, 'createAcademic'])
                ->name('student.evaluate');
            Route::post('/students/{student}/evaluate', [SupervisorEvaluationController::class, 'storeAcademic'])
                ->name('student.evaluate.store');
            Route::get('/students/{student}/evaluations/{submission}', [SupervisorEvaluationController::class, 'showAcademicSubmission'])
                ->name('student.evaluations.show');
            Route::get('/students/{student}/final-report', [FinalInternshipReportController::class, 'academic'])
                ->name('student.final-report');
            Route::put('/students/{student}/final-report/review', [FinalInternshipReportController::class, 'reviewAcademic'])
                ->name('student.final-report.review');
            Route::get('/students/{student}/final-report/pdf', [FinalInternshipReportController::class, 'download'])
                ->name('student.final-report.download');

        });
                


    // =========================================================
    // INDUSTRY SUPERVISOR ROUTES
    // =========================================================

    Route::middleware(['role:Industry Supervisor'])
        ->prefix('industry-supervisor')
        ->name('industry-supervisor.')
        ->group(function () {

            Route::get(
                '/dashboard',
                [App\Http\Controllers\IndustrySupervisor\DashboardController::class, 'index']
            )->name('dashboard');

            Route::get('/logbook', [App\Http\Controllers\IndustrySupervisor\LogbookController::class, 'index'])->name('logbook');
            Route::get('/logbook/{submission}/review', [App\Http\Controllers\IndustrySupervisor\LogbookController::class, 'review'])->name('logbook.review');
            Route::post('/logbook/{submission}/mark-reviewed', [App\Http\Controllers\IndustrySupervisor\LogbookController::class, 'markReviewed'])->name('logbook.mark-reviewed');

            Route::get(
                '/students',
                [IndustrySupervisorStudentController::class, 'index']
            )->name('students');

            Route::get(
                '/students/{student}',
                [IndustrySupervisorStudentController::class, 'show']
            )->name('student.show');

            Route::put('/students/{student}/completion-confirmation', [IndustrySupervisorStudentController::class, 'updateCompletionConfirmation'])
                ->name('student.completion-confirmation.update');

            Route::get('/students/{student}/evaluate', [SupervisorEvaluationController::class, 'createIndustry'])
                ->name('student.evaluate');

            Route::post('/students/{student}/evaluate', [SupervisorEvaluationController::class, 'storeIndustry'])
                ->name('student.evaluate.store');
            Route::get('/students/{student}/evaluations/{submission}', [SupervisorEvaluationController::class, 'showIndustrySubmission'])
                ->name('student.evaluations.show');
        });

 
            

    // =========================================================
    // STUDENT ROUTES
    // =========================================================

    Route::middleware(['role:Student'])
        ->prefix('student')
        ->name('student.')
        ->group(function () {

            Route::get(
                '/profile',
                [StudentProfileController::class, 'index']
            )->name('profile');

            Route::post(
                '/profile',
                [StudentProfileController::class, 'update']
            )->name('profile.update');

            // CV Generation / Checkpoint

            Route::post(
                '/cv-generator/generate',
                [StudentProfileController::class, 'generateCv']
            )->name('cv-generator.generate');

            Route::get(
                '/cv-generator',
                [StudentProfileController::class, 'cvGenerator']
            )->name('cv-generator');


            Route::get(
                '/dashboard',
                [StudentDashboardController::class, 'index']
            )->name('dashboard');

            Route::post(
                '/dashboard/onboarding',
                [StudentDashboardController::class, 'completeOnboarding']
            )->name('dashboard.onboarding');

            Route::post(
                '/onboarding/complete',
                [StudentDashboardController::class, 'completeOnboarding']
            )->name('onboarding.complete');


            Route::get(
                '/companies',
                [StudentCompanyController::class, 'index']
            )->name('companies');

            Route::get(
                '/companies/{company}',
                [StudentCompanyController::class, 'show']
            )->name('companies.view');

            Route::post(
                '/companies/{company}/apply',
                [StudentCompanyController::class, 'apply']
            )->name('companies.apply');


            Route::get(
                '/application-tracking',
                [App\Http\Controllers\Student\ApplicationTrackingController::class, 'index']
            )->name('application-tracking');

            Route::delete(
                '/applications/{application}/cancel',
                [StudentCompanyController::class, 'cancel']
            )->name('applications.cancel');


            // Logbook

            Route::get(
                '/logbook',
                [LogbookController::class, 'index']
            )->name('logbook');

            Route::get('/logbook/attachments', [LogbookController::class, 'attachmentsPage'])->name('logbook.attachments');
            Route::get('/logbook/export', [LogbookController::class, 'export'])->name('logbook.export');

            Route::get(
                '/logbook/create',
                [LogbookController::class, 'create']
            )->name('logbook.create');

            Route::post(
                '/logbook/submit-week',
                [LogbookController::class, 'submitWeek']
            )->name('logbook.submit-week');

            Route::post(
                '/logbook',
                [LogbookController::class, 'store']
            )->name('logbook.store');

            Route::delete(
                '/logbook/{date}',
                [LogbookController::class, 'destroy']
            )->name('logbook.destroy');


            Route::get(
                '/calendar',
                [StudentCalendarController::class, 'index']
            )->name('calendar');

            Route::get(
                '/faqs',
                [StudentFaqController::class, 'index']
            )->name('faqs');


            Route::get(
                '/favourites',
                [StudentFavouriteController::class, 'index']
            )->name('favourites');

            Route::post(
                '/favourites/{company}',
                [StudentFavouriteController::class, 'store']
            )->name('favourites.store');

            Route::delete(
                '/favourites/{company}',
                [StudentFavouriteController::class, 'destroy']
            )->name('favourites.destroy');


            Route::get(
                '/past-reports',
                [StudentReportController::class, 'index']
            )->name('past-reports');

            Route::get(
                '/report-issue',
                [StudentReportController::class, 'create']
            )->name('report-issue');

            Route::post(
                '/report-issue',
                [StudentReportController::class, 'store']
            )->name('report-issue.store');
            Route::get('/final-report', [FinalInternshipReportController::class, 'student'])->name('final-report');
            Route::post('/final-report', [FinalInternshipReportController::class, 'saveStudent'])->name('final-report.save');
        });
});


require __DIR__.'/auth.php';
