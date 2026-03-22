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
    CircleDashed,
    FileUser,
    CircleUser,
    MessagesSquare,
    MessageCircleQuestionMark,
    Info,
    CalendarDays,
} from "lucide-react";

const data = {
    navPrimary: [
        {
            title: "Dashboard",
            url: route('company.dashboard'),
            icon: LayoutDashboard,
        },
        {
            title: "Quotas",
            url: route('company.quotas'),
            icon: CircleDashed,
        },
        {
            title: "Applicants",
            url: route('company.applicants'),
            icon: FileUser,
        },
        {
            title: "Interns",
            url: route('company.interns'),
            icon: Users,
        },
        {
            title: "Representatives",
            url: route('company.representatives'),
            icon: CircleUser,
        },
        {
            title: "Interviews",
            url: route('company.interviews'),
            icon: MessagesSquare,
        },
    ],
    navSecondary: [
        {
            title: "Contact Support",
            url: route('company.contact-support'),
            icon: MessageCircleQuestionMark,
        },
        {
            title: "FAQs",
            url: route('company.faqs'),
            icon: Info,
        },
        {
            title: "Calendar",
            url: route('company.calendar'),
            icon: CalendarDays,
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
                        <NavMain items={data.navPrimary} label="Management" />
                    </div>
                <SidebarSeparator className="mx-2 my-2" />
                    <NavMain items={data.navSecondary} label="Resources" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={auth.user} />
            </SidebarFooter>
        </Sidebar>
    )
}