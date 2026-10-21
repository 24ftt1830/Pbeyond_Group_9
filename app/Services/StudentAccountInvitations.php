<?php

namespace App\Services;

use App\Jobs\SendStudentAccountInvitation;
use App\Models\AdminRecordChange;
use App\Models\User;
use App\Notifications\StudentAccountInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StudentAccountInvitations
{
    public function queue(User $student, User $actor, bool $resend = false): bool
    {
        return DB::transaction(function () use ($student, $actor, $resend) {
            $student = User::whereKey($student->getKey())->lockForUpdate()->firstOrFail();
            if ($student->role !== 'Student' || ! $student->requiresStudentPasswordSetup()) {
                return false;
            }
            $status = $student->student_invitation_status;
            if ((! $resend && $status !== 'not_invited')
                || ($resend && ! in_array($status, ['sent', 'failed'], true))) {
                return false;
            }
            if ($student->student_invitation_sent_at?->gt(now()->subMinute())) {
                throw ValidationException::withMessages(['invitation' => 'Please wait one minute before resending this invitation.']);
            }

            $before = $student->toArray();
            $attempt = (string) Str::uuid();
            $student->forceFill([
                'student_access_released_at' => $student->student_access_released_at ?? now(),
                'student_invitation_status' => 'queued',
                'student_invitation_attempt_id' => $attempt,
                'student_invitation_error' => null,
            ])->save();

            SendStudentAccountInvitation::dispatch($student->getKey(), $attempt)->onQueue('student-invitations')->afterCommit();
            AdminRecordChange::record($actor, $student, $resend ? 'Queued student invitation resend' : 'Released student access and queued invitation', $before);

            return true;
        });
    }

    public function deliver(int $userId, string $attempt): void
    {
        DB::transaction(function () use ($userId, $attempt) {
            $student = User::whereKey($userId)->lockForUpdate()->first();
            if (! $student || ! $student->requiresStudentPasswordSetup() || $student->studentAccessIsUnreleased()
                || $student->student_invitation_status !== 'queued' || $student->student_invitation_attempt_id !== $attempt) {
                return;
            }

            $status = Password::broker('student_invitations')->sendResetLink(
                ['email' => $student->email],
                fn ($user, $token) => $user->notify(new StudentAccountInvitation($token)),
            );
            if ($status !== Password::RESET_LINK_SENT) {
                throw new \RuntimeException('Student invitation could not be sent: '.$status);
            }

            $student->forceFill([
                'student_invitation_status' => 'sent',
                'student_invitation_sent_at' => now(),
                'student_invitation_error' => null,
            ])->save();
        });
    }
}
