# Backend review — 18 October 2026

The agreed workflow changes are implemented. The items below are findings from code inspection, left unchanged for confirmation. This is not a claim that every possible defect has been identified. No automated or browser tests were run in this batch; PHP syntax, TypeScript, routes, database migrations and the frontend build were checked.

## Findings to confirm

1. **High — An approved report can be resubmitted without reopening.** `FinalInternshipReportController::saveStudent()` accepts a submission even after approval and resets its marks, review and final decision. Restrict replacement to the permitted pending/correction states and require Superadmin reopening after approval. Source: `app/Http/Controllers/FinalInternshipReportController.php:27`.

2. **High — Existing identity documents use public storage.** IC, licence and academic results are stored on the public disk. If the public storage link is enabled, a known file URL bypasses the portal's permissions. Move these existing document types to private storage and authorized downloads. New insurance and logbook attachments already use private storage. Source: `app/Http/Controllers/Student/ProfileController.php:435` and `config/filesystems.php:40`.

3. **Medium — Approved positions can change without approval again.** HR's quota update preserves the Approved/released flags while changing position details and branches. Define which changes require reapproval, and how existing applicants should be preserved. Source: `app/Http/Controllers/Company/QuotaController.php:248`.

4. **Medium — Company rejection does not suspend its access or positions.** Rejection only sets `is_approved=false`; position availability and the shared login do not consistently check that flag. Define whether rejection suspends the account, hides positions, or both, while retaining existing interns. Sources: `app/Http/Controllers/Admin/CompanyController.php:183`, `app/Models/PlacementQuota.php:119`, `app/Http/Controllers/Auth/AuthenticatedSessionController.php`.

5. **Medium — Assessment versions can leave completion pending.** Overall results combine saved component weights and require exactly 100%. Changing weights between submissions can create an incompatible set. Completion also requires currently active supervisor templates, even for previously submitted assessments. Define a consistent assessment set per student/session while retaining historical marks. Source: `app/Services/InternshipCompletionStatus.php:71`.

6. **Medium — Semester 5 depends on the order of semester records.** The target term is the fourth row after the intake row. A missing or newly inserted historical semester changes that result. January's new “second half” label does not itself change the underlying intake anchor. Confirm how intake starts should map to semester 1 before changing this calculation. Source: `app/Models/AcademicSemester.php:53`.

7. **Medium — Date edits do not reconcile existing logbooks.** Internship dates can change after weeks have been submitted or approved. Those weeks and final decisions are not automatically reconciled with the new period, while attendance uses the new dates. Define whether date edits should be blocked or affected reviews reopened. Source: `app/Services/InternshipWorkflow.php:20`.

8. **Medium — Final decisions can race with other changes.** Eligibility is checked before the decision transaction, without a shared student lock across all completion/report paths. A concurrent report or company change can invalidate the checks before the final decision is saved. Source: `app/Services/InternshipWorkflow.php:132`.

9. **Minor — Company profile validation does not match its schema.** Username uniqueness and several database field lengths are not fully validated, so ordinary edits can produce database errors. Source: `app/Http/Controllers/Company/ProfileController.php:42`.

10. **Minor — Daily boundaries use UTC.** Daily logging and CSV availability use the application timezone, currently UTC. Brunei's next day begins eight hours earlier. Confirm the intended application timezone. Source: `config/app.php:68`.

## Previously deferred by the user

- Restricting development role switching and adding main-login throttling.
- Admin-only programme/intake controls and preventing CSV imports from changing intake after applications.
- Allowing HR reassignment between companies.

These remain unchanged. The previously approved supervisor Profile page repair is included in this implementation.

## Operational notes

- Four new migrations have been applied without a database reset; the existing seven students and four companies were retained.
- Existing class supervision was copied into individual student assignments. Original class records and visits remain stored.
- New evaluation examples are drafts. Already published templates and submitted results were not deactivated or rewritten.
- Mailtrap credentials remain deferred and the real `.env` is unchanged. Notifications are queued and require a queue worker; actual delivery depends on the configured mailer.
- Attendance uses recorded student statuses, with missing days reported separately. No workplace schedule is used.
- New rejection decisions retain their event time. Older migrated rejection records are labelled with their last recorded time, not presented as a reconstructed complete history.
