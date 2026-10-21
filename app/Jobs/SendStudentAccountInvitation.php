<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\StudentAccountInvitations;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendStudentAccountInvitation implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;
    public array $backoff = [60, 300];

    public function __construct(public int $userId, public string $attempt) {}

    public function handle(StudentAccountInvitations $invitations): void
    {
        $invitations->deliver($this->userId, $this->attempt);
    }

    public function failed(?\Throwable $exception): void
    {
        User::whereKey($this->userId)->where('role', 'Student')
            ->whereNull('student_password_set_at')->where('student_invitation_attempt_id', $this->attempt)
            ->where('student_invitation_status', 'queued')->update([
                'student_invitation_status' => 'failed',
                'student_invitation_error' => 'Invitation could not be sent. Check the email address and mail configuration, then retry.',
            ]);
    }
}
