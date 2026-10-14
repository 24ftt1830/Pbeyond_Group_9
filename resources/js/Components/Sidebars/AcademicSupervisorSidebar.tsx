import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarTrigger,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/Components/ui/sidebar"
import { NavUser } from "@/Components/nav-user"
import { usePage, Link } from "@inertiajs/react"
import { PageProps } from "@/types"
import {
    House,
    GraduationCap,
    BookMarked,
} from "lucide-react"

export function AcademicSupervisorSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {

    const page = usePage<PageProps>()
    const { auth } = page.props
    const url = page.url

    const isLogbookPage = url.startsWith(
        "/academic-supervisor/logbook"
    )

    const isStudentsPage = url.startsWith(
        "/academic-supervisor/students"
    )

    const isDashboardPage =
        url === "/academic-supervisor/dashboard"

    return (
        <Sidebar collapsible="icon" {...props}>

            {/* Header */}
            <SidebarHeader>
                <div className="flex h-12 items-center justify-between px-4 pt-4">

                    <Link
                        href="/academic-supervisor/dashboard"
                        className="
                            flex
                            items-center
                            gap-2
                            overflow-hidden
                            group-data-[collapsible=icon]:hidden
                        "
                    >
                        <div className="flex items-center justify-center">
                            <img
                                src="/politeknik/pb-logo-black.png"
                                alt="PB Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                    </Link>

                    <div
                        className="
                            flex
                            items-center
                            group-data-[collapsible=icon]:w-full
                            group-data-[collapsible=icon]:justify-center
                        "
                    >
                        <SidebarTrigger className="bg-transparent" />
                    </div>

                </div>
            </SidebarHeader>


            {/* Navigation */}
            <SidebarContent className="gap-0">

                <div className="pt-2">

                    <p className="mb-2 px-5 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                        Academic Supervisor Portal
                    </p>

                    <SidebarMenu>

                        {/* Dashboard */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isDashboardPage}
                            >
                                <Link href="/academic-supervisor/dashboard">
                                    <House />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Students */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isStudentsPage}
                            >
                                <Link href="/academic-supervisor/students">
                                    <GraduationCap />
                                    <span>Students</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Logbook Review */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isLogbookPage}
                            >
                                <Link href="/academic-supervisor/logbook">
                                    <BookMarked />
                                    <span>Logbook Review</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>

                </div>

            </SidebarContent>


            {/* Account / Logout */}
            <SidebarFooter>
                <NavUser user={auth.user} />
            </SidebarFooter>

        </Sidebar>
    )
}
