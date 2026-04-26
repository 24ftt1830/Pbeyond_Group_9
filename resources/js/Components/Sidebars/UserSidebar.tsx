import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarTrigger,
    SidebarSeparator,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/Components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { NavMain } from "@/Components/nav-main"
import { NavUser } from "@/Components/nav-user"
import { usePage, Link } from '@inertiajs/react'
import { PageProps } from '@/types'
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    CalendarDays,
    FileText,
    LifeBuoy,
    Flag,
    HelpCircle,
    ChevronDown,
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
    ],
    navSecondary: [
        {
            title: "Past Reports",
            url: route('student.past-reports'),
            icon: FileText,
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
                {/* Support Dropdown */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="sm" className="focus-visible:ring-0">
                                    <LifeBuoy className="size-4" /> 
                                    <span>Support</span>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem asChild>
                                    <Link href={route('student.report-issue')}>
                                        <Flag className="mr-2 size-4" />
                                        <span>Report Issue</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('student.faqs')}>
                                        <HelpCircle className="mr-2 size-4" />
                                        <span>FAQs</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* User Account */}
                <NavUser user={auth.user} />
            </SidebarFooter>
        </Sidebar>
    )
}