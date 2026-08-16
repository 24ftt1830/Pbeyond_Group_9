import React, { useState } from "react";
import { SchedulerProvider, SchedularView } from "mina-scheduler";
import { router } from "@inertiajs/react";

interface CalendarProps {
    events: any[];
}

export default function Calendar({ events = [] }: CalendarProps) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
    });

    const formattedEvents = (events || []).map((event) => ({
        id: event.id ?? Math.random().toString(36).substring(2, 9),
        title: event.title,
        description: event.description ?? "",
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        variant: event.variant ?? "primary",
    }));

    const saveEvent = () => {
        router.post(
            route("admin.events.store"),
            {
                title: form.title,
                description: form.description,
                startDate: form.startDate,
                endDate: form.endDate,
                variant: "primary",
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setOpen(false);
                    setForm({
                        title: "",
                        description: "",
                        startDate: new Date().toISOString().slice(0, 10),
                        endDate: new Date().toISOString().slice(0, 10),
                    });
                },
            }
        );
    };

        const handleDeleteEvent = (event: any) => {
        const eventId =
            typeof event === "number" || typeof event === "string"
                ? event
                : event?.id;

        if (!eventId) {
            console.error("Delete failed: event id is missing", event);
            return;
        }

        router.delete(route("admin.events.destroy", eventId), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Add Event
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <SchedulerProvider
            initialState={formattedEvents}
            weekStartsOn="monday"
            onDeleteEvent={handleDeleteEvent}
        >
            <SchedularView
                classNames={{
                    buttons: {
                        addEvent: "hidden",
                    },
                }}
            />
        </SchedulerProvider>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-2xl font-semibold mb-5">Add Event</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Name
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter event name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter event description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                startDate: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                endDate: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEvent}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Save Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}