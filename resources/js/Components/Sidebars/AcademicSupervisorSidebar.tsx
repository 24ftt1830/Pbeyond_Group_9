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
import { NavUser } from "@/Components/nav-user"
import { usePage, Link } from "@inertiajs/react"
import { PageProps } from "@/types"
import {
    LayoutDashboard,
    BookOpen,
    LifeBuoy,
    Flag,
    HelpCircle,
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

    const isDashboardPage = url ===
        "/academic-supervisor/dashboard"

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

                    <SidebarMenu>

                        {/* Dashboard */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isDashboardPage}
                            >
                                <Link href="/academic-supervisor/dashboard">
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
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
                                    <BookOpen />
                                    <span>Logbook Review</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>

                </div>

                <SidebarSeparator />


                {/* Support */}
                <SidebarMenu className="mt-auto">

                    <SidebarMenuItem>

                        <DropdownMenu>

                            <DropdownMenuTrigger asChild>

                                <SidebarMenuButton
                                    size="sm"
                                    className="focus-visible:ring-0"
                                >
                                    <LifeBuoy className="size-4" />
                                    <span>Support</span>
                                </SidebarMenuButton>

                            </DropdownMenuTrigger>


                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >

                                <DropdownMenuItem asChild>
                                    <Link href={route("student.report-issue")}>
                                        <Flag className="mr-2 size-4" />
                                        <span>Report Issue</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href={route("student.faqs")}>
                                        <HelpCircle className="mr-2 size-4" />
                                        <span>FAQs</span>
                                    </Link>
                                </DropdownMenuItem>

                            </DropdownMenuContent>

                        </DropdownMenu>

                    </SidebarMenuItem>

                </SidebarMenu>

            </SidebarContent>


            {/* Account / Logout */}
            <SidebarFooter>
                <NavUser user={auth.user} />
            </SidebarFooter>

        </Sidebar>
    )
}