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
    GaugeCircle,
    Factory,
    IdCardLanyard,
    UserPlus,
    ChartPie,
    Files,
    ClipboardCheck,
    ContactRound,
    CalendarRange,
    UserRoundSearch,
    PanelsTopLeft,
} from "lucide-react";

const data = {
    navPrimary: [
        {
            title: "Dashboard",
            url: route('admin.dashboard'),
            icon: GaugeCircle,
        },
        {
            title: "Academic Semesters",
            url: route('admin.academic-semesters'),
            icon: CalendarRange,
        },
        {
            title: "Companies",
            url: route('admin.companies'),
            icon: Factory,
        },
        {
            title: "Placements",
            url: route('admin.placements'),
            icon: IdCardLanyard,
        },
        {
            title: "Manage Users",
            url: route('admin.manage-users'),
            icon: UserPlus,
        },
        {
            title: "Student Records",
            url: route('admin.students'),
            icon: ContactRound,
        },
        {
            title: 'Unplaced Students',
            url: route('admin.unplaced-students'),
            icon: UserRoundSearch,
        },
        {
            title: "Applications",   
            url: route('admin.applications'),
            icon: Files,
        },
        {
            title: "Evaluations",
            url: route('admin.evaluations'),
            icon: ClipboardCheck,
        },
    ],
    navSecondary: [
        {
            title: "UI Reference",
            url: route('admin.ui-reference'),
            icon: PanelsTopLeft,
        },
        {
            title: "Reports",
            url: route('admin.reports'),
            icon: ChartPie,
        },
    ]
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<PageProps>().props

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex h-12 items-center justify-between px-4 pt-4">
                    <Link
                        href={route('admin.dashboard')}
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
                    <NavMain items={data.navPrimary} label="Superadmin Management" />
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
