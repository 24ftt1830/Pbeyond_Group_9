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

    // TEMPORARY ROLE SET
    const [activeRole, setActiveRole] = React.useState<UserRole>(
        (auth?.user?.role as UserRole) || 'user'
    )
    // Safeguard: If auth isn't loaded yet, show a basic loading state to prevent crash
    if (!auth?.user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    //const role = auth.user.role as UserRole

    const Sidebars: Record<UserRole, React.ComponentType> = {
        admin: AdminSidebar,
        company: CompanySidebar,
        user: UserSidebar,
    }

    const SelectedSidebar = Sidebars[activeRole] || UserSidebar

    return (
        <SidebarProvider>
            {/* We check if the component exists. 
                If SelectedSidebar is undefined, it renders null instead of breaking. 
            
            {SelectedSidebar ? <SelectedSidebar /> : <div className="w-64 bg-red-50 p-4">Sidebar missing for {role}</div>}
            */}
            <SelectedSidebar />

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">

                {/* PREVIEW TOOLBAR: to be removed once DB team is ready */}
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