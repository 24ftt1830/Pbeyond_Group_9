import * as React from "react"
import { usePage } from '@inertiajs/react'
import { PageProps, UserRole } from '@/types'

// Sidebar Components
import { AdminSidebar } from "@/Components/Sidebars/AdminSidebar"
import { CompanySidebar } from "@/Components/Sidebars/CompanySidebar"
import { UserSidebar } from "@/Components/Sidebars/UserSidebar"

// Shadcn UI Components
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar"
import { Separator } from "@/Components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<PageProps>().props

    // Safeguard: If auth isn't loaded yet, show a basic loading state to prevent crash
    if (!auth?.user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    const role = auth.user.role as UserRole

    // Mapping the components to the roles
    const Sidebars: Record<UserRole, React.ComponentType> = {
        admin: AdminSidebar,
        company: CompanySidebar,
        user: UserSidebar,
    }

    const SelectedSidebar = Sidebars[role]

    return (
        <SidebarProvider>
            {/* We check if the component exists. 
                If SelectedSidebar is undefined, it renders null instead of crashing. 
            */}
            {SelectedSidebar ? <SelectedSidebar /> : <div className="w-64 bg-red-50 p-4">Sidebar missing for {role}</div>}

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Platform
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="capitalize">
                                        {role} Dashboard
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}