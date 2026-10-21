<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentAccountInvitation extends Notification
{
    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // Use the configured application domain, including when a queue worker sends it.
        $url = rtrim(config('app.url'), '/').'/set-password/'.$this->token.'?'.http_build_query(['email' => $notifiable->email]);

        return (new MailMessage)
            ->subject('PBeyond · Set up your student account')
            ->greeting('Hello '.$notifiable->username.',')
            ->line('Your school has released access to your PBeyond student account.')
            ->line('Choose your own password to start using your account. Your login email is '.$notifiable->email.'.')
            ->action('Set up my password', $url)
            ->line('This link expires after 24 hours and can be used once.')
            ->line('If the link expires, use Forgot password or ask Admin to resend your invitation.')
            ->salutation('PBeyond');
    }
}
