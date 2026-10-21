# Workflow fix checklist

Items are addressed individually after the user's decision. Checked items are fixed; skipped items will be labelled explicitly.

- [x] **1. Supervisor lookup SQL error** — Corrected student and application relationships. Company and recruitment restrictions remain enforced.
- [x] **2. Approved reports can be resubmitted without reopening.** — Approved reports are locked for students until Superadmin reopens them. Reports marked Changes Required remain resubmittable.
- [x] **3. HR can recruit cancelled applications.** — Company HR cannot change a student-cancelled application; Admin status corrections remain available.
- [ ] **4. Interviewing status accepts no interview date.** — Skipped at the user's request.
- [x] **5. Daily restrictions use UTC instead of Brunei time.** — Logbook calendar-day checks now use Brunei dates; application timestamp storage stays unchanged.
- [x] **6. Company dashboard checks old supervisor assignments.** — Setup queue now checks the student’s direct Industry Supervisor assignment from the same company.
- [x] **7. HR sees the current profile instead of the generated CV.** — Applications now keep the generated CV snapshot. Students can update it while the application is Pending; HR sees the updated version and its revision date. Once HR changes the application status, that CV copy is frozen.
- [x] **8. Internship date changes retain old approvals and completion decisions.** — A real date change resets the PB completion decision. Existing logbook entries and their original review metadata are kept. Weeks containing entries outside the new date range are flagged for Industry Supervisor review; flagged weeks do not count toward attendance or week-order approval, and they block a new PB completion decision until approved again.
- [~] **9. Semester 5 term mapping.** — Deferred to the Special case list at the user's request.
- [~] **10. Evaluation versions can produce incompatible component weights.** — Deferred to the Special case list at the user's request.
- [x] **11. Completed internship stays final after a logbook is reopened.** — Superadmin must provide a reason and confirmation. Reopening an approved week returns an existing final decision to Pending Evaluation while retaining its original decision and actor/date in history. The student must correct and resubmit; approval resolves the correction, and PB Supervisor must record completion again. Completed is blocked while any reopened week remains unresolved. Report marks, evaluations and company confirmation are retained unless separately changed or reopened.

## Completed internship logbook corrections

- The correction rule is permanent and also applies while **For demo** is enabled.
- Superadmin and PB Supervisor can view **Completion and correction history** in the student's completion section. Reopening, student resubmission, review decisions and final completion decisions are recorded with the responsible user and time.
- Student, PB Supervisor, Industry Supervisor and Superadmin see **Logbook correction pending** with the reason while a correction is unresolved.
- Migration `2026_10_20_000005_add_logbook_correction_workflow.php` adds correction metadata and reconciles earlier administrative reopenings using their saved history. Earlier final decisions are preserved before being returned to pending.
- The migration was applied locally on 20 October 2026. Automated tests and a browser walkthrough were not run for this change.

## Verification for problem 1

- Seven focused regression tests passed with 15 assertions, using an isolated in-memory database.
- Covered direct relationship queries, existence queries, eager loading, counts, the PB evaluation subquery and combined completion scores.
- Confirmed that unassigned students, students not recruited and students recruited by another company are excluded.
- Read-only checks against the current project database passed for student/application lookups, eager loading/counts, the PB student-details controller and the completion-score lookup.
- No database migrations or frontend changes were needed for this fix.

## Verification for problem 2

- Three focused regression tests passed with 12 assertions using an isolated in-memory database.
- Confirmed approved reports retain their mark and completion decision when a student tries to resubmit.
- Confirmed correction-requested reports remain resubmittable.
- Confirmed Superadmin-reopened reports can be resubmitted and return to Pending Review.
- PHP syntax checks passed for the controller and regression test.

## Verification for problem 3

- One focused regression test passed with two assertions using an isolated in-memory database.
- Confirmed Company HR cannot recruit a cancelled application and its status stays Cancelled.
- PHP syntax checks passed for the workflow service and regression test.
- The TypeScript check and production frontend build passed.

## Verification for problem 5

- Two focused Brunei date-boundary tests passed with eight assertions.
- Confirmed that “today” changes at midnight in Brunei, including while the UTC date is still the previous day.
- Updated student logbook entry limits, week submission eligibility, attendance elapsed days, missing-week tracking and CSV export availability.
- PHP syntax checks passed for the helper, controller and related services.

## Verification for problem 6

- The supervisor relationship suite passed with eight tests and 17 assertions.
- Confirmed direct assignments satisfy setup for their own company, while an assignment from another company does not.
- PHP syntax checks passed for the dashboard controller and regression test.

## Verification for problem 7

- New applications save the student's generated CV snapshot and its timestamp.
- Regenerating a CV replaces the snapshot only on Pending applications and increments its revision.
- Company CV view renders the application snapshot, with a notice when it was updated after applying.
- Added migration: `2026_10_18_000001_add_cv_snapshot_to_applications_table.php`. It has not been run.

## Verification for problem 8

- Date changes mark weekly logbooks with saved entries outside the updated internship range for Industry Supervisor review.
- Original daily entries and review metadata are retained; affected weeks appear in the review queue and remain flagged until approved.
- Flagged weeks do not count toward attendance or unlock later weeks, and they block the PB completion decision.
- Updating dates also resets a prior PB completion decision to Pending Evaluation. Company confirmation and evaluation/report records are retained.
- Added migration: `2026_10_18_000006_add_date_change_review_to_weekly_logbooks.php`. It has not been run.

## Extra — review later

- Role-targeted pop-up notifications when a change in one part of the system requires another role to know or act.
- Review how to count verified work days that fall before an updated internship start date (pre-start attendance).

## Special case — review later

- **Problem 9: Semester 5 term mapping.** — Deferred for now. The internship term is inferred by counting four date-ordered semester records after the student's intake term; missing or incorrectly dated terms could produce the wrong internship term.
- **Problem 10: Evaluation grading changes during an internship semester.** — Deferred for now. Review locking percentages, sections, criteria and points for each active internship semester while allowing wording corrections that preserve the assessment meaning. Admin can prepare future semester grading; unfinished assessments should retain their semester's grading after the calendar semester ends. This is a proposal for later review, not an implemented restriction.

## For demo

Command convention for this project:

- **"For demo"** means enable only the four exceptions below: student test login without activation, future logbook entries/submissions/Industry Supervisor approvals, early CSV downloads, and attendance totals and percentages that include approved future-dated entries. In local `.env`, set `STUDENT_ALLOW_TEST_LOGIN=true` and `LOGBOOK_ALLOW_FUTURE_DATES=true`, then run `php artisan config:clear`. These four exceptions use the same two flags; no third flag is needed.
- **"Revert back"**, when referring to demo mode, means disable all four exceptions by setting both flags to `false`, then run `php artisan config:clear`. Restore normal invitation/activation, logbook date and CSV end-date restrictions, and attendance calculation using only actual elapsed dates. Do not undo unrelated project work.
- This convention applies only to `APP_ENV=local`. Preserve real password hashes, activation state, saved records and the other workflow requirements. Supervisor login rules are unchanged. Industry Supervisor approval is still required before a week contributes to attendance; reopened or date-change-flagged weeks remain excluded until resolved.

- [ ] **Restore student invitation requirements after login testing.** Temporary local `.env` setting `STUDENT_ALLOW_TEST_LOGIN=true` lets existing, seeded, manually added and imported students log in with their saved email and `password123`, without an invitation or password setup. Real password hashes and invitation/access state are preserved. This changes login only; password changes in Account Settings still require the real current password. Supervisor accounts do not have this invitation gate and remain unchanged. After testing, set it to `false` and run `php artisan config:clear` to restore the normal login and invitation rules. The override is ignored outside `APP_ENV=local`; `.env.example` defaults to `false`.
- [ ] **Restore future-date restrictions after logbook testing.** Temporary local `.env` setting `LOGBOOK_ALLOW_FUTURE_DATES=true` allows daily entries, evidence uploads, weekly submission and Industry Supervisor approval before their dates arrive, within the assigned internship period. Complete every required day and obtain approval for earlier weeks as usual. After testing, set it to `false` and run `php artisan config:clear`. The override is ignored outside `APP_ENV=local`; `.env.example` defaults to `false`. Missing-week reminders and internship completion dates still use real Brunei time.
- [ ] **Restore the CSV end-date restriction after the client demo.** The same local setting `LOGBOOK_ALLOW_FUTURE_DATES=true` temporarily shows **Student → Logbook → Download CSV** and permits the download before the assigned internship ends, including future logbook records. It still requires an internship record and exports only the signed-in student's logbook. Set the flag to `false` and run `php artisan config:clear` to restore downloads only after the actual internship end date. This exception is ignored outside `APP_ENV=local`.
- [ ] **Restore attendance calculation using actual elapsed dates after the client demo.** The same local setting `LOGBOOK_ALLOW_FUTURE_DATES=true` includes approved future-dated logbook entries in credited, recorded and absent totals and the attendance percentage within the assigned internship period. Industry Supervisor approval and the normal attendance credit rules still apply; unapproved, unresolved reopened and date-change-flagged weeks do not count. Actual elapsed-day, unrecorded-day and unapproved-day counts continue to use real Brunei dates: future dates are not reported as missing. Set the flag to `false` and run `php artisan config:clear` to exclude future entries from attendance and return to actual elapsed-date calculation. This exception is ignored outside `APP_ENV=local`.
