# PBeyond client demo checklist

Starting point: the default `DatabaseSeeder` after a fresh reset. Updated for the rolling quota rules on 20 October 2026. Use one student throughout the main demo. Term dates are selected from the configured calendar when seeding.

## What the seeders already provide

| Item | Fresh-seeded state |
| --- | --- |
| Accounts | Admin, seven students, two PB Supervisors and six company HR accounts |
| Companies and locations | Six approved companies, each with two branches; all four schools and all districts are represented |
| Student profiles | Personal information, programme, both emergency numbers, district, placeholder photo and example CV content are filled |
| Student documents | Insurance upload and generated CV still need attention |
| Quotas | 24 pending requests: four per company, two slots each; three positions in the first available term and one planning example in the next term |
| Evaluation templates | PB, Industry and Written Report rubrics are filled but inactive; overall weights are 40% + 40% + 20% |
| PB assignments | No students are preassigned; PB Supervisors select students directly |
| Industry Supervisors | None created by the default seed run |
| Applications and internships | None created by the default seed run |
| Logbooks, reports and evaluations | No student submissions or final decisions |

The separate Application, Internship and Industry Supervisor seeders exist, but the default `DatabaseSeeder` does not call them.

The six organisations are TechCorp, GlobalTech, DataTech, Brunei Shell Petroleum, Brunei Business Services, and CarePlus Health Services. These are illustrative demo records. The last two cover Business and Health programmes.

For an existing demo database, `php artisan db:seed` adds the current examples while preserving historical quota decisions, existing passwords and students who already have applications/internships. It refreshes unplaced sample students and their CV source content; generate their CVs again afterwards. It does not clear existing supervisor assignments. Exact totals above describe a fresh seed; a reseeded database also retains historical records.

## Accounts for this walkthrough

Fresh-seeded Admin, HR and PB Supervisor accounts use `password123`. Fresh-seeded students have no shared login password: release access and complete an invitation first. The Industry Supervisor account is created during the demo.

| Role | Login | Demo record |
| --- | --- | --- |
| Admin | admin.sict@pb.edu.bn | Admin portal |
| Company HR | hr@techcorp.com | TechCorp Brunei |
| Student | 24FTT002@student.pb.edu.bn | Sarah Binti Ali, Application Development |
| PB Supervisor | academic.supervisor@pb.edu.bn | Haji Ahmad bin Haji Omar |
| Industry Supervisor | Set during the demo | Select Sarah as the assigned student |

All roles use the same login page with email and password.

Other HR logins: `hr@globaltech.com`, `hr@datatech.com.bn`, `hr@shell.com.bn`, `hr@business.example`, and `hr@careplus.example`. These non-student demo accounts use `password123`; existing passwords and access states are preserved on reseeding.

## 1. Prepare before the client arrives

- [ ] Start the database and website. Use `php artisan migrate:fresh --seed` only when ready to replace the tables in the demo database.
- [ ] Prepare a sample insurance document, an MC/permission attachment and a written-report PDF.
- [ ] Run an invitation worker: `php artisan queue:work --queue=student-invitations,default --tries=3 --timeout=60` (also included in `composer dev`).
- [ ] **Admin → Manage Users → Students:** add/import records and show **Not invited**. No email is sent automatically. For a real delivery demo, edit the demo student's account to an email you control; for fake addresses, use the mail log or Mailtrap Sandbox.
- [ ] Click **Send account invitations**, review the recipient list and confirm. Show **Sending → Awaiting setup**. In a separate/private browser, open the email's 24-hour setup link, choose a password twice and confirm. The student's status becomes **Active**.
- [ ] Add another student and show that the main button now includes only this uninvited account. Demonstrate the separate resend action if needed. Existing active students are skipped.
- [ ] **Admin → Manage Users → Students → Edit Sarah:** confirm the seeded intake. It is chosen so semester 5 matches the first available quota term. On **20 October 2026**, fresh data uses **January 2025 · Intake 14**, with internship term **January 2027**.
- [ ] Confirm the internship term and the selected quota's target semester match. Use the first available term's request for the main demo; the second term's quota is a future planning example.
- [ ] For a future internship term, local `LOGBOOK_ALLOW_FUTURE_DATES=true` permits future logbook entries, submissions, Industry Supervisor approvals, early CSV downloads and attendance totals/percentages that include approved future-dated entries. An Admin date exception is not required to demonstrate attendance. Use `STUDENT_ALLOW_TEST_LOGIN=true` as well to enable all four exceptions in the **For demo** list. Both flags apply only to `APP_ENV=local`; run `php artisan config:clear` after changing them. Normal HR dates must still stay within semester 5. Do not change the quota to an expired term.

## 2. Company quota → Admin approval

- [ ] **HR → Quotas:** open the seeded **Application Developer Intern** request. Show the job details, two slots, semester and Main Branch. It is Pending and hidden from students.
- [ ] **Admin → Companies → Pending reviews:** approve that request. Approval also releases the position to students; a separate release action is unnecessary.
- [ ] Confirm HR sees the approved status. If you want to demonstrate submitting a brand-new request, create an additional position through HR and approve that one instead.

## 3. Activate assessment templates

- [ ] **Admin → Evaluation templates:** show the filled PB, Industry and Written Report rubrics.
- [ ] Confirm component weights are **40% PB + 40% Industry + 20% Written Report = 100%**. PB and Industry section weights each total 40%; the Written Report rubric totals 100% of its own report mark.
- [ ] Keep the seeded grading settings, save any edits, and choose **Activate all**. Supervisors can now use the assessments.

## 4. PB Supervisor selects the student

- [ ] **PB Supervisor → Students:** filter by SICT and find Sarah under Available students. Select her to supervise.
- [ ] Confirm she moves into Your students immediately, without Admin approval. Her details, attendance and progress are now accessible to this PB Supervisor.

## 5. Student profile → application → recruitment

- [ ] **Student → Profile:** show the prefilled information and two emergency numbers, then upload the insurance document. Save the profile and generate the CV.
- [ ] **Student → Companies:** open TechCorp, select **Application Developer Intern** and its **Main Branch**, then apply. Show Pending under Application Tracking.
- [ ] Show that another active application is blocked. Cancellation is available while the application is Pending.
- [ ] **HR → Applications:** open Sarah's application and view her submitted CV. If demonstrating interviews, set Interviewing with an interview date first; then choose **Recruited**.
- [ ] **Student → Application Tracking:** confirm the status becomes Recruited.

Email demonstration is optional until Mailtrap credentials are configured. Acceptance/rejection messages are queued; use `php artisan queue:work` if a queue worker is not already running. With the log mailer they appear in Laravel's log; with Mailtrap Sandbox they appear in its test inbox.

## 6. Set dates and assign Industry Supervisor

- [ ] **HR → Interns:** demonstrate the allowed semester 5 range. The earliest start is the day after the school's term start. For January 2027, choose **2 January–30 June 2027** as a normal scheduling example.
- [ ] **Choose the logbook demo dates:** keep the normal future internship dates while **For demo** is enabled; approved future entries now contribute to attendance. Alternatively, to demonstrate actual elapsed dates with demo mode off, use **Admin → Sarah's student record → Internship dates** to set a past two-week period. On 20 October 2026, **5–18 October 2026** is suitable. Explain that the past period is an Admin exception outside the normal intake schedule. The October dates below describe this alternative; for a future period, use its first two internship weeks instead.
- [ ] **HR → Manage Users:** create an Industry Supervisor account and select Sarah as an assigned student. The assignment belongs to Sarah individually.
- [ ] **Industry Supervisor → Students:** sign in with that new account and confirm Sarah appears.

## 7. Student logbook → Industry review → attendance

Industry Supervisors approve weekly logbooks or request corrections for their assigned students. PB Supervisors have view-only access to their own assigned students' entries, statuses, attachments and review feedback. The PB portal has no logbook review submission endpoint. Admin retains its existing correction/reopen tools. Historical reviewer details remain unchanged.

Supervisor navigation is **Logbooks → select student → select week**. The first page lists each assigned student once, alphabetically, with pending-review counts. Student weeks run from Week 1 onward in date order; partial weeks show only internship dates. Review save and Back return to that student's weeks. In local **For demo** mode, approved future-dated entries contribute to credited, recorded and absent totals and the attendance percentage. Actual elapsed-day, unrecorded-day and unapproved-day counts still use real dates; unrecorded or unapproved future dates are not reported as missing. Normal mode uses actual elapsed dates for attendance too and shows **No internship days elapsed yet** before the internship starts. Industry Supervisor approval remains required in both modes; unresolved reopened or date-change-flagged weeks remain excluded.

- [ ] **Student → Logbook:** open **5–11 October**. Show that the second week is locked until the first week is approved.
- [ ] Fill all **7/7** daily records. Work day requires activities and learning outcomes. Include one **Absent with permission/MC** day and upload its evidence; the remaining days can use sample Work day entries.
- [ ] Submit the first week. Show that submitted entries are locked and attendance has not yet credited the unapproved week.
- [ ] **Industry Supervisor → Logbook Review:** read the entries and evidence, request one correction with feedback, then save the decision.
- [ ] **Student:** correct the requested entry and resubmit the week.
- [ ] **Industry Supervisor:** approve the resubmitted first week. Its seven credited days now contribute to attendance and the next week unlocks.
- [ ] **Student:** fill and submit **12–18 October**, then have Industry Supervisor approve it. For an attendance example, use six Work days and one Absent day: both approved weeks then give **13 credited / 14 recorded days = 92.9%**.
- [ ] **PB Supervisor and Admin → Sarah's details:** show the attendance percentage and day counts. In local **For demo** mode, use approved future-dated entries without moving the internship into the past; the percentage follows the same credited/recorded calculation. PB Supervisor can view the logbooks; Industry Supervisor handles their review. **Revert back** restores actual elapsed-date attendance together with the other three normal restrictions.
- [ ] **Student → Logbook → Download CSV:** download entries/review information and attachment names, without embedding images or files. During the local client demo, `LOGBOOK_ALLOW_FUTURE_DATES=true` also permits this before the internship end date. Normal mode requires the actual end date to have passed. Restore the restriction using the **For demo** list in `docs/workflow-fix-checklist.md`.

The four daily options are Work day, Absent with permission/MC, Absent and Public Holiday. The first, second and fourth receive attendance credit after weekly approval; Absent receives zero.

## 8. Report, supervisor evaluations and final decision

- [ ] **Student → Written Report:** enter a title, upload the sample PDF and submit it.
- [ ] **Industry Supervisor → Sarah's details:** complete and submit the Industry evaluation. Show its saved result and submit lock.
- [ ] **Industry Supervisor → Company Internship Completion:** choose **Confirmed**. This is a separate step from submitting the evaluation.
- [ ] **PB Supervisor → Sarah's details → Report:** open the PDF, select rubric ratings and **approve and mark** the report. Approval must include a saved report score.
- [ ] **PB Supervisor → Sarah's details:** complete and submit the PB evaluation.
- [ ] **PB Supervisor → Internship Completion Decision:** check company confirmation, both supervisor submissions and the approved/marked report. Choose **Confirm Internship Completed**; the final school decision is manual.
- [ ] **Student:** show the final Completed status and combined evaluation score.

## Optional demonstrations after the main flow

- [ ] Use another student/application to show rejection, the confirmation dialog and Admin's rejected history with company and date/time. A declined application lets that student apply elsewhere.
- [ ] Show a PB supervision visit or progress status on Sarah's record.
- [ ] Show Superadmin's authorised reopening of a submitted evaluation, report or approved logbook. Reopening a logbook requires a reason and confirmation, returns an existing final decision to Pending Evaluation, and preserves report marks, evaluations and company confirmation. Show the student correction/resubmission, Industry review, then a new PB completion decision. **Completion and correction history** retains the original decision and subsequent actions. This rule also applies in **For demo** mode. Do this last if you do not intend to repeat the completion steps during the walkthrough.

## Steps that were missing from the original outline

- [ ] Assign the intake and match the quota semester before applying.
- [ ] Generate the CV; seeded profile content alone does not submit an application.
- [ ] Select a branch and assign both supervisors to the student.
- [ ] Demonstrate correction/resubmission and approval before attendance counts or later weeks unlock.
- [ ] Upload and mark the written report, record company confirmation, and make the manual PB completion decision.

This guide was prepared by reading the seeders, routes and workflow rules. A database reset and full browser rehearsal have not been run as part of preparing it.
