import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarTrigger,
    SidebarSeparator,
    SidebarFooter,
} from "@/Components/ui/sidebar"
import { NavMain } from "@/Components/nav-main"
import { NavUser } from "@/Components/nav-user"
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'
import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    Upload,
    Heart,
    Flag,
    HelpCircle,
    CalendarDays,
    FileText,
} from "lucide-react";

const data = {
    navPrimary: [
        {
            title: "Dashboard",
            url: route('student.dashboard'),
            icon: LayoutDashboard,
        },
        {
            title: "Companies",
            url: route('student.companies'),
            icon: Building2,
        },
        {
            title: "Application Tracking",
            url: route('student.application-tracking'),
            icon: ClipboardList,
        },
        {
            title: "Documentations",
            url: route('student.documentations'),
            icon: Upload,
        },
        {
            title: "Favourites",
            url: route('student.favourites'),
            icon: Heart,
        },
        {
            title: "Report Issue",
            url: route('student.report-issue'),
            icon: Flag,
        },
    ],
    navSecondary: [
        {
            title: "Past Reports",
            url: route('student.past-reports'),
            icon: FileText,
        },
        {
            title: "FAQs",
            url: route('student.faqs'),
            icon: HelpCircle,
        },
        {
            title: "Calendar",
            url: route('student.calendar'),
            icon: CalendarDays,
        },
    ]
}

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<PageProps>().props

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex h-12 items-center justify-between px-4 pt-4">
                    <Link
                        href={route('student.dashboard')}
                        className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center justify-center">
                            <img
                                src="/politeknik/pb-logo-black.png"
                                alt="PB Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                    </Link>

                    <div className="flex items-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
                        <SidebarTrigger className="hover:bg-sidebar-accent" />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                <div className="pt-2">
                    <NavMain items={data.navPrimary} label="Student Portal" />
                </div>
                <SidebarSeparator />
                <NavMain items={data.navSecondary} label="Resources" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={auth.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
