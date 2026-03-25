import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const [dateTime, setDateTime] = useState<string>('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
            const date = now.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setDateTime(`${dayOfWeek} - ${date} - ${time}`);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full">
            <div className="relative m-[15px] h-[250px] w-[1150px] rounded-xl bg-[#D9D9D9]">
                <div className="absolute top-4 left-8 text-black text-sm">
                    {dateTime}
                </div>
                <div className="absolute bottom-4 left-8 flex flex-col gap-2">
                    <div className="text-black text-[40px] font-bold">
                        Welcome, {auth.user.name}
                    </div>
                    <div className="text-black text-[20px]">
                        Check available companies to apply!
                    </div>
                </div>
                <img
                    className="absolute right-[56px] top-1/2 h-[100%] -translate-y-1/2 object-contain"
                    src="/studentdashboard.png"
                    alt="Student dashboard"
                />
            </div>
            <div className="m-[15px] flex gap-6">
                <div className="relative h-[300px] w-[835px] rounded-xl bg-[#D9D9D9] p-[10px] pb-6">
                    <div className="text-black text-[20px] font-bold">
                        Reminders
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 pb-4">
                        <div className="aspect-square w-full rounded-lg bg-white/80" />
                        <div className="aspect-square w-full rounded-lg bg-white/80" />
                        <div className="aspect-square w-full rounded-lg bg-white/80" />
                    </div>
                </div>
                <div className="relative ml-auto h-[300px] w-[300px] rounded-xl bg-[#D9D9D9]">
                    <div className="absolute top-4 left-4 text-black text-[20px] font-bold">
                        Recommended Companies
                    </div>
                </div>
            </div>
            <div className="relative m-[15px] h-[150px] w-[1150px] rounded-xl bg-[#D9D9D9]">
                <div className="absolute top-4 left-4 text-black text-[20px] font-bold">
                    Application Tracking
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;