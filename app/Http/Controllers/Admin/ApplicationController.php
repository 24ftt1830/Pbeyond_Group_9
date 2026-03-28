<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function update(Request $request, Application $application)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $application->app_status = ucfirst($request->status);
        $application->save();

        return redirect()->back()->with('success', 'Application updated.');
    }
}
