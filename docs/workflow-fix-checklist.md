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
