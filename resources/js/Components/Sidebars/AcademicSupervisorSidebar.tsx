import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarFooter } from '@/Components/ui/sidebar';
import { NavMain } from '@/Components/nav-main';
import { NavUser } from '@/Components/nav-user';
import { usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { navigationIcons } from '@/lib/navigation-icons';

export function AcademicSupervisorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<PageProps>().props;
    const items = [
        { title: 'Dashboard', url: route('academic-supervisor.dashboard'), icon: navigationIcons.dashboard },
        { title: 'Students', url: route('academic-supervisor.students'), icon: navigationIcons.students },
        { title: 'Logbooks', url: route('academic-supervisor.logbook'), icon: navigationIcons.logbooks },
    ];

    return <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
            <div className="flex h-12 items-center justify-between px-4 pt-4">
                <Link href={route('academic-supervisor.dashboard')} className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                    <img src="/politeknik/pb-logo-black.png" alt="PB Logo" className="h-10 w-auto object-contain" />
                </Link>
                <div className="flex items-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
                    <SidebarTrigger className="hover:bg-sidebar-accent" />
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent className="sidebar-scroll-custom gap-0">
            <div className="pt-2"><NavMain items={items} label="PB Supervisor Portal" /></div>
        </SidebarContent>
        <SidebarFooter><NavUser user={auth.user} /></SidebarFooter>
    </Sidebar>;
}
