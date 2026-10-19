# PBeyond client demo checklist

Starting point: the default `DatabaseSeeder` after a fresh reset. Checked against the project source on 19 October 2026. Use one student throughout the main demo.

## What the seeders already provide

| Item | Fresh-seeded state |
| --- | --- |
| Accounts | Admin, seven students, two PB Supervisors and four company HR accounts |
| Companies and locations | Four approved companies, each with a Main Branch |
| Student profiles | Personal information, programme, first emergency number, placeholder photo and example CV content are filled |
| Student documents | Second emergency number, insurance upload and generated CV still need attention |
| Quotas | Six pending requests, two slots each; hidden until Admin approves; assigned to the current semester |
| Evaluation templates | PB, Industry and Written Report rubrics are filled but inactive; overall weights are 40% + 40% + 20% |
| PB assignments | Ahmad Haziq and Nurul Aisyah are already assigned; Sarah is available for a PB Supervisor to select |
| Industry Supervisors | None created by the default seed run |
| Applications and internships | None created by the default seed run |
| Logbooks, reports and evaluations | No student submissions or final decisions |

The separate Application, Internship and Industry Supervisor seeders exist, but the default `DatabaseSeeder` does not call them.

## Accounts for this walkthrough

The following seeded accounts use `password123`. The Industry Supervisor account is created during the demo.

| Role | Login | Demo record |
| --- | --- | --- |
| Admin | admin.sict@pb.edu.bn | Admin portal |
| Company HR | hr@techcorp.com | TechCorp Brunei |
| Student | 24FTT002@student.pb.edu.bn | Sarah Binti Ali, Application Development |
| PB Supervisor | academic.supervisor@pb.edu.bn | Haji Ahmad bin Haji Omar |
| Industry Supervisor | Set during the demo | Select Sarah as the assigned student |

All roles use the same login page with email and password.

## 1. Prepare before the client arrives

- [ ] Start the database and website. Use `php artisan migrate:fresh --seed` only when ready to replace the tables in the demo database.
- [ ] Prepare a sample insurance document, an MC/permission attachment and a written-report PDF.
- [ ] **Admin → Manage Users → Students → Edit Sarah:** confirm **July 2024 · Intake 14** as her intake. Her fifth semester should then be July–December 2026.
- [ ] Confirm the internship term and the chosen quota's target semester match. For this walkthrough, both should be **July 2026**.
- [ ] For a demo on or after **19 October 2026**, use **5–18 October 2026** as the sample internship period: two complete Monday–Sunday weeks, entirely in the past and within Semester 5. Adjust the intake, quota term and dates together if demonstrating in another semester.

## 2. Company quota → Admin approval

- [ ] **HR → Quotas:** open the seeded **Application Developer Intern** request. Show the job details, two slots, semester and Main Branch. It is Pending and hidden from students.
- [ ] **Admin → Placements:** approve that request. Approval also releases the position to students; a separate release action is unnecessary.
- [ ] Confirm HR sees the approved status. If you want to demonstrate submitting a brand-new request, create an additional position through HR and approve that one instead.

## 3. Activate assessment templates

- [ ] **Admin → Evaluation templates:** show the filled PB, Industry and Written Report rubrics.
- [ ] Confirm component weights are **40% PB + 40% Industry + 20% Written Report = 100%**. PB and Industry section weights each total 40%; the Written Report rubric totals 100% of its own report mark.
- [ ] Keep the seeded grading settings, save any edits, and choose **Activate all**. Supervisors can now use the assessments.

## 4. PB Supervisor selects the student

- [ ] **PB Supervisor → Students:** filter by SICT and find Sarah under Available students. Select her to supervise.
- [ ] Confirm she moves into Your students immediately, without Admin approval. Her details, attendance and progress are now accessible to this PB Supervisor.

## 5. Student profile → application → recruitment

- [ ] **Student → Profile:** show the prefilled information, add the second emergency number and upload the insurance document. Save the profile and generate the CV.
- [ ] **Student → Companies:** open TechCorp, select **Application Developer Intern** and its **Main Branch**, then apply. Show Pending under Application Tracking.
- [ ] Show that another active application is blocked. Cancellation is available while the application is Pending.
- [ ] **HR → Applications:** open Sarah's application and view her submitted CV. If demonstrating interviews, set Interviewing with an interview date first; then choose **Recruited**.
- [ ] **Student → Application Tracking:** confirm the status becomes Recruited.

Email demonstration is optional until Mailtrap credentials are configured. Acceptance/rejection messages are queued; use `php artisan queue:work` if a queue worker is not already running. With the log mailer they appear in Laravel's log; with Mailtrap Sandbox they appear in its test inbox.

## 6. Set dates and assign Industry Supervisor

- [ ] **HR → Interns:** set Sarah's internship dates to **5–18 October 2026** for this sample. Show the allowed Semester 5 range; HR dates must start after the school's semester start date.
- [ ] **HR → Manage Users:** create an Industry Supervisor account and select Sarah as an assigned student. The assignment belongs to Sarah individually.
- [ ] **Industry Supervisor → Students:** sign in with that new account and confirm Sarah appears.

## 7. Student logbook → Industry review → attendance

- [ ] **Student → Logbook:** open **5–11 October**. Show that the second week is locked until the first week is approved.
- [ ] Fill all **7/7** daily records. Work day requires activities and learning outcomes. Include one **Absent with permission/MC** day and upload its evidence; the remaining days can use sample Work day entries.
- [ ] Submit the first week. Show that submitted entries are locked and attendance has not yet credited the unapproved week.
- [ ] **Industry Supervisor → Logbook Review:** read the entries and evidence, request one correction with feedback, then save the decision.
- [ ] **Student:** correct the requested entry and resubmit the week.
- [ ] **Industry Supervisor:** approve the resubmitted first week. Its seven credited days now contribute to attendance and the next week unlocks.
- [ ] **Student:** fill and submit **12–18 October**, then have Industry Supervisor approve it. For an attendance example, use six Work days and one Absent day: both approved weeks then give **13 credited / 14 recorded days = 92.9%**.
- [ ] **PB Supervisor and Admin → Sarah's details:** show the attendance percentage and day counts. PB Supervisor can view the logbooks; Industry Supervisor handles their review.
- [ ] **Student → Logbook:** download the CSV. This is available after the internship end date and includes entries/review information and attachment names, without embedding images or files.

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
- [ ] Show Superadmin's authorised reopening of a submitted evaluation, report or logbook. Do this last: reopening can return the final decision to pending and require review again.

## Steps that were missing from the original outline

- [ ] Assign the intake and match the quota semester before applying.
- [ ] Generate the CV; seeded profile content alone does not submit an application.
- [ ] Select a branch and assign both supervisors to the student.
- [ ] Demonstrate correction/resubmission and approval before attendance counts or later weeks unlock.
- [ ] Upload and mark the written report, record company confirmation, and make the manual PB completion decision.

This guide was prepared by reading the seeders, routes and workflow rules. A database reset and full browser rehearsal have not been run as part of preparing it.
