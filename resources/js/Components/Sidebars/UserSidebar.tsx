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
import { usePage, Link } from '@inertiajs/react'
import { PageProps } from '@/types'
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    BookOpen,
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
            title: "Logbook",
            url: route('student.logbook'),
            icon: BookOpen,
        },
    ],
    navSecondary: [
        {
            title: "Written Report",
            url: route('student.final-report'),
            icon: FileText,
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
                        <SidebarTrigger className="bg-transparent" />
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
