<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\models\Event;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::all()->map(fn ($event) => [
            'id' => (string) $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'startDate' => $event->start_date,
            'endDate' => $event->end_date,
            'color' => $event->color,
            'variant' => $event->variant,
        ]);

        return Inertia::render('Calendar', [
            'events' => $events,
        ]);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'title'       => 'required|string|max:255',
        'description' => 'nullable|string',
        'startDate'   => 'required|date',
        'endDate'     => 'required|date|after_or_equal:startDate',
        'variant'     => 'nullable|string|in:primary,danger,success,warning,default',
        'color'       => 'nullable|string',
    ]);

    Event::create([
        'title'       => $validated['title'],
        'description' => $validated['description'],
        'start_date'  => $validated['startDate'],
        'end_date'    => $validated['endDate'],
        'variant'     => $validated['variant'] ?? 'primary',
        'color'       => $validated['color'] ?? '#3b82f6',
    ]);

    return redirect()->back()->with('success', 'Event created successfully!');
}

    public function destroy(Event $event)
    {
        $event->delete();

        return back()->with('success', 'Event deleted successfully.');
    }
}
