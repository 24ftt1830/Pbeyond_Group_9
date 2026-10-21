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
import { navigationIcons } from '@/lib/navigation-icons';

const data = {
    overview: [
        {
            title: "Dashboard",
            url: route('admin.dashboard'),
            icon: navigationIcons.dashboard,
        },
    ],
    placementManagement: [
        {
            title: "Companies",
            url: route('admin.companies'),
            icon: navigationIcons.companies,
        },
        {
            title: "Applications",
            url: route('admin.applications'),
            icon: navigationIcons.applications,
        },
        {
            title: "Placements",
            url: route('admin.placements'),
            icon: navigationIcons.placements,
        },
        {
            title: 'Unplaced Students',
            url: route('admin.unplaced-students'),
            icon: navigationIcons.unplacedStudents,
        },
        {
            title: "Student Records",
            url: route('admin.students'),
            icon: navigationIcons.students,
        },
    ],
    academicSetup: [
        {
            title: "Academic Sessions",
            url: route('admin.academic-semesters'),
            icon: navigationIcons.academicSessions,
        },
        {
            title: "Evaluations",
            url: route('admin.evaluations'),
            icon: navigationIcons.evaluations,
        },
    ],
    administration: [
        {
            title: "Manage Users",
            url: route('admin.manage-users'),
            icon: navigationIcons.manageUsers,
        },
    ],
    resources: [
        {
            title: "UI Reference",
            url: route('admin.ui-reference'),
            icon: navigationIcons.uiReference,
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
                    <NavMain items={data.overview} label="Superadmin Management" />
                </div>
                <NavMain items={data.placementManagement} label="Placement Management" />
                <NavMain items={data.academicSetup} label="Academic Setup" />
                <NavMain items={data.administration} label="Administration & Support" />
                <SidebarSeparator />
                <NavMain items={data.resources} label="Resources" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={auth.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
