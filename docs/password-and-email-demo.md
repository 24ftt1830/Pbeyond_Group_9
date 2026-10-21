# Password recovery and email demo

## Temporary local student testing

With `APP_ENV=local` and `STUDENT_ALLOW_TEST_LOGIN=true`, any existing student account can log in with its saved email and `password123`, including freshly seeded, added or imported students before invitation/setup. This only affects login: stored passwords, invitation states and email flows are preserved, and Account Settings still checks the actual current password. Supervisors already use their initial account password without a student invitation gate and are unchanged. To restore normal student access, set `STUDENT_ALLOW_TEST_LOGIN=false` and run `php artisan config:clear`. The example environment defaults to disabled, and this override is ignored outside the local environment.

## User flows

- Released accounts use **Forgot your password?** on the shared login page. They enter their saved account email and receive a reset link automatically. There is no Admin approval step. Unreleased student accounts cannot use recovery to bypass the invitation process.
- Reset links expire after 60 minutes and can be used once. Requesting a link does not change the existing password. Requests for the same account are limited to one link per minute.
- In **Account Settings**, users enter their current password, their new password twice, and confirm before saving. Success and validation errors produce toast feedback. Changing the password also invalidates outstanding reset links.
- In **Admin → Manage Users**, edit an HR, supervisor or active student account and choose **Send password reset link**. Confirm the recipient before sending. This sends to the saved account email; save any email change first. It does not change the password or require Admin to choose one.
- Existing HR and supervisor passwords are no longer replaced directly through their edit forms. New accounts still receive an initial password set when the account is created. Account creation does not automatically email credentials.

## Student invitations

- Adding students or importing CSV files creates **Not invited** accounts with unknown random passwords. No email is sent and login/recovery stays blocked until Admin releases access. The CSV's optional `email` column supports real addresses; without it, the school address is derived from the student code. Verify those addresses before releasing access.
- **Admin → Manage Users → Students → Send account invitations** previews recipients and requires confirmation. It only includes **Not invited** students matching the current search, with up to 500 per batch. Already invited, failed and active students are skipped.
- A queue worker sends individual setup emails. The list updates from **Sending** to **Awaiting setup**. Students choose their own password through a single-use, 24-hour setup link. Ordinary recovery links still expire after 60 minutes and use separate tokens.
- **Resend invitation** is a separate row/edit action. **Retry invitation** handles failed sending. Successful resends replace the previous setup link. Sending is retried up to three times before marking failure.
- A released student can also use Forgot password if their setup email is lost. Completing either valid flow activates the account. Until password setup succeeds, login remains blocked.
- Reimporting a student never resets their password or invitation state. To change an existing student's email, edit the account explicitly. For a pending account, changing the email cancels old setup links and queued attempts and returns it to **Not invited**, ready for a new invitation.
- Existing student accounts are kept active when the migration is first applied. Newly created accounts, including fresh-seeded students, follow the invitation flow. Reseeding preserves existing passwords and access status.

Run `composer dev`, or start a worker with `php artisan queue:work --queue=student-invitations,default --tries=3 --timeout=60`. A VPS process manager must keep a worker running with those queue names. A local dedicated invitation worker can use `--queue=student-invitations` to avoid processing unrelated mail jobs. Restart workers after deploying code or changing mail settings.

## Database setup

Run `php artisan migrate`. The password-support migration adds `password_reset_tokens` and `users.remember_token` if missing. Passwords are stored as hashes; reset tokens are also hashed in storage.

## Option 1: Local email log

Keep `MAIL_MAILER=log`. Use fake account emails and request a reset. Open `storage/logs/laravel.log`, find the latest **Reset Password Notification**, and open its reset URL on the same laptop.

This exercises token generation and password recovery without SMTP credentials. The UI's send success means the message was passed to the configured mail transport; with `log`, it is recorded locally.

## Option 2: Mailtrap Sandbox

Copy SMTP credentials from your own Mailtrap Sandbox into the local `.env`:

```dotenv
MAIL_MAILER=smtp
MAIL_SCHEME=null
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_sandbox_smtp_username
MAIL_PASSWORD=your_sandbox_smtp_password
MAIL_FROM_ADDRESS="no-reply@pbeyond.test"
MAIL_FROM_NAME="PBeyond"
```

Use the exact host and port shown for your Sandbox if different. Run `php artisan config:clear` after changing settings. Do not commit your `.env` or put credentials in tracked files.

Keep fake emails on the seeded accounts. Request a reset, open the captured email in the Mailtrap Sandbox inbox, click the reset link, set a new password twice, confirm, and log in with it. Messages do not go to Gmail while Sandbox is configured, even if the recipient address is real.

Use a separate browser profile or private window for the recipient if Admin is logged in: password recovery pages are for logged-out users. A local `.test` reset URL must be opened on a device that can reach that local website.

Reset emails send immediately through the configured mailer. Acceptance/rejection emails use the job queue, so run `php artisan queue:work` (or `composer dev`) when demonstrating those notifications. Restart a running worker after changing mail settings.

## Real delivery later

Configure Mailtrap Email Sending SMTP credentials and a verified sending domain in `.env`, then clear the configuration cache. Put a real recipient address on the HR or supervisor account being tested. The Admin account email does not receive another account's reset link. Use an accessible application URL when demonstrating from another device.

Mailtrap references: [Sandbox](https://docs.mailtrap.io/email-sandbox/overview), [sending domain setup](https://docs.mailtrap.io/email-api-smtp/setup/sending-domain).
