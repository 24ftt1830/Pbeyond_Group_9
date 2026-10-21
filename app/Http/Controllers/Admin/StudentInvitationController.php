<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StudentAccountInvitations;
use Illuminate\Http\Request;

class StudentInvitationController extends Controller
{
    public function store(Request $request, StudentAccountInvitations $invitations)
    {
        $data = $request->validate([
            'user_ids' => ['required', 'array', 'min:1', 'max:500'],
            'user_ids.*' => ['required', 'integer', 'distinct', 'exists:users,user_id'],
        ]);
        $count = 0;
        foreach (User::whereIn('user_id', $data['user_ids'])->where('role', 'Student')->get() as $student) {
            $count += (int) $invitations->queue($student, $request->user());
        }

        return back()->with('success', $count ? $count.' student invitation(s) queued for sending.' : 'No new students needed an invitation.');
    }

    public function resend(Request $request, User $user, StudentAccountInvitations $invitations)
    {
        abort_unless($user->role === 'Student', 404);
        $queued = $invitations->queue($user, $request->user(), true);

        return back()->with('success', $queued ? 'Student invitation queued for resending.' : 'This student does not need an invitation resend.');
    }
}
