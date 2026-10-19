<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationDecisionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 120, 600];
    public string $company;
    public string $position;
    public ?string $branch;

    public function __construct(public string $decision, Application $application)
    {
        $application->loadMissing('quota.company', 'branch');
        $this->company = $application->quota?->company?->company_name ?? 'The company';
        $this->position = $application->quota?->job_title ?? 'Internship placement';
        $this->branch = $application->branch?->name;
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $accepted = $this->decision === 'Recruited';
        $message = (new MailMessage)
            ->subject('PBeyond · Internship application ' . ($accepted ? 'accepted' : 'declined'))
            ->greeting('Hello ' . ($notifiable->student?->full_name ?? $notifiable->username) . ',')
            ->line($this->company . ' has ' . ($accepted ? 'accepted' : 'declined') . ' your application for ' . $this->position . '.');
        if ($this->branch) {
            $message->line('Branch: ' . $this->branch);
        }
        return $message
            ->line($accepted ? 'Open PBeyond to view your placement and next steps.' : 'You may apply for another available internship placement.')
            ->action('View application', route('student.application-tracking'))
            ->salutation('PBeyond');
    }
}
