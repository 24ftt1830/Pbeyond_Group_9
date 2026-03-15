import * as React from "react"
import { usePage } from '@inertiajs/react'
import { PageProps, UserRole } from '@/types'
import { Button } from "@/Components/ui/button"

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
} from "@/components/ui/breadcrumb"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<PageProps>().props

    // Helper to validate the role from DB
    const isValidRole = (role: any): role is UserRole => {
        return ['admin', 'company', 'user'].includes(role);
    };

    // TEMPORARY ROLE SET: Defaults to 'user' if DB role is null/invalid
    const [activeRole, setActiveRole] = React.useState<UserRole>(
        isValidRole(auth?.user?.role) ? auth.user.role : 'user'
    )

    if (!auth?.user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    const Sidebars: Record<UserRole, React.ComponentType> = {
        admin: AdminSidebar,
        company: CompanySidebar,
        user: UserSidebar,
    }

    // Always fallback to UserSidebar if the role somehow doesn't match
    const SelectedSidebar = Sidebars[activeRole] || UserSidebar

    return (
        <SidebarProvider>
            <SelectedSidebar />

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border">
                        <span className="text-[10px] font-bold px-2 uppercase text-muted-foreground">Preview Role:</span>
                        {(['admin', 'company', 'user'] as UserRole[]).map((r) => (
                            <Button 
                                key={r}
                                variant={activeRole === r ? "default" : "ghost"} 
                                size="sm" 
                                className="h-7 text-[10px] px-2"
                                onClick={() => setActiveRole(r)}
                            >
                                {r}
                            </Button>
                        ))}
                    </div>
                </header>
                
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}