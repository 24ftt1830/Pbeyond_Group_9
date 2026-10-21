import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarTrigger,
    SidebarFooter,
} from "@/Components/ui/sidebar"
import { NavMain } from "@/Components/nav-main"
import { NavUser } from "@/Components/nav-user"
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'
import { Link } from '@inertiajs/react';
import { navigationIcons } from '@/lib/navigation-icons';

const data = {
    navPrimary: [
        {
            title: "Dashboard",
            url: route('company.dashboard'),
            icon: navigationIcons.dashboard,
        },
        {
            title: "Quotas",
            url: route('company.quotas'),
            icon: navigationIcons.quotas,
        },
        {
            title: "Applications",
            url: route('company.applications'),
            icon: navigationIcons.applications,
        },
        {
            title: "Interns",
            url: route('company.interns'),
            icon: navigationIcons.students,
        },
        {
            title: "Representatives",
            url: route('company.representatives'),
            icon: navigationIcons.representatives,
        },
        {
            title: "Manage Users",
            url: route('company.manage-users'),
            icon: navigationIcons.manageUsers,
        },
    ]
}

export function CompanySidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<PageProps>().props

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex h-12 items-center justify-between px-4 pt-4">
                    <Link
                        href={route('company.dashboard')}
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

            <SidebarContent className="sidebar-scroll-custom gap-0">
                    <div className="pt-2">
                        <NavMain items={data.navPrimary} label="Company Portal" />
                    </div>
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={auth.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
