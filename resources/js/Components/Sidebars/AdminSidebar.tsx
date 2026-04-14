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
    Users,
    Building2,
    IdCardLanyard,
    UserPlus,
    ChartPie,
    Headset,
    CalendarDays,
    ClipboardList, 
} from "lucide-react";

const data = {
    navPrimary: [
        {
            title: "Dashboard",
            url: route('admin.dashboard'),
            icon: LayoutDashboard,
        },
        {
            title: "Students",
            url: route('admin.students'),
            icon: Users,
        },
        {
            title: "Companies",
            url: route('admin.companies'),
            icon: Building2,
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
            title: "Applications",   
            url: route('admin.applications.review'),
            icon: ClipboardList,
        },
    ],
    navSecondary: [
        {
            title: "Reports",
            url: route('admin.reports'),
            icon: ChartPie,
        },
        {
            title: "Support",
            url: route('admin.support'),
            icon: Headset,
        },
        {
            title: "Calendar",
            url: route('admin.calendar'),
            icon: CalendarDays,
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
                    <NavMain items={data.navPrimary} label="Management" />
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
