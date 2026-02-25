import * as React from "react"
import {
    BookOpen,
    Bot,
    Command,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings2,
    SquareTerminal,
} from "lucide-react"

// Inertia & Types
import { usePage, Link } from '@inertiajs/react';
import { PageProps, UserRole } from '@/types'; 

// Components
import { NavMain } from "@/Components/nav-main"
import { NavProjects } from "@/Components/nav-projects"
import { NavSecondary } from "@/Components/nav-secondary"
import { NavUser } from "@/Components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

// Static data for secondary and project sections
const data = {
    navSecondary: [
        { title: "Support", url: "#", icon: LifeBuoy },
        { title: "Feedback", url: "#", icon: Send },
    ],
    projects: [
        { name: "Design Engineering", url: "#", icon: Frame },
        { name: "Sales & Marketing", url: "#", icon: PieChart },
        { name: "Travel", url: "#", icon: Map },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<PageProps>().props;

    /**
     * Fix for the 'any' type error: 
     * We explicitly type the keys of this object as UserRole 
     * so TypeScript knows auth.user.role is a valid index.
     */
    const roleNavigation: Record<UserRole, { title: string; url: string; icon: any; items?: any[] }[]> = {
        user: [
            { title: "My Profile", url: route('profile.edit'), icon: Settings2 },
        ],
        admin: [
            { title: "Application Status", url: route('admin.stats'), icon: SquareTerminal },
            { title: "Users", url: route('admin.users'), icon: Bot },
        ],
        company: [
            { title: "Organization", url: route('company.organization'), icon: BookOpen },
        ],
    };

    // Safely access the navigation based on role
    const navMainItems = roleNavigation[auth.user.role] || [];

    return (
        <Sidebar
            className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Acme Inc</span>
                                    <span className="truncate text-xs capitalize">{auth.user.role}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* NavMain now receives the role-specific items. 
                  If you want to keep the original shadcn 'Playground' items, 
                  you would merge them here.
                */}
                <NavMain items={navMainItems} />
                
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>

            <SidebarFooter>
                {/* Passing the real auth user to NavUser */}
                <NavUser user={auth.user} />
            </SidebarFooter>
        </Sidebar>
    )
}