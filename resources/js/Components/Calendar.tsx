import React from "react";
import { SchedulerProvider, SchedularView } from "mina-scheduler";
import { router } from "@inertiajs/react";

interface CalendarProps {
    events: any[];
}

export default function Calendar({ events = [] }: { events: any[] }) {
    const formattedEvents = (events || []).map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
    }));

    const handleAddEvent = (newEvent: any) => {
        router.post(route('admin.events.store'), newEvent, { 
            preserveScroll: true,
        });
    };

    return (
        <div className="p-6">
            <SchedulerProvider 
                initialState={formattedEvents} 
                onAddEvent={handleAddEvent}
            >
                <SchedularView />
            </SchedulerProvider>
        </div>
    );
}