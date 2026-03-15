import * as React from "react"
import { usePage, router } from '@inertiajs/react'
import { PageProps, UserRole } from '@/types'
import { Button } from "@/Components/ui/button"

// Sidebar Components
import { AdminSidebar } from "@/Components/Sidebars/AdminSidebar"
import { CompanySidebar } from "@/Components/Sidebars/CompanySidebar"
import { UserSidebar } from "@/Components/Sidebars/UserSidebar"

// Shadcn UI Components
import { SidebarInset, SidebarProvider } from "@/Components/ui/sidebar"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<PageProps>().props

    const isValidRole = (role: any): role is UserRole => {
        const normalized = String(role).toLowerCase();
        return ['admin', 'company', 'user'].includes(normalized);
    };

    const [activeRole, setActiveRole] = React.useState<UserRole>(
        isValidRole(auth?.user?.role) ? (auth.user.role.toLowerCase() as UserRole) : 'user'
    )

    if (!auth?.user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    const Sidebars: Record<string, React.ComponentType> = {
        admin: AdminSidebar,
        company: CompanySidebar,
        user: UserSidebar,
    }

    const SelectedSidebar = Sidebars[activeRole] || UserSidebar

    const handleRoleSwitch = (r: UserRole) => {
        const roleMap: Record<UserRole, string> = {
            admin: 'Admin',
            company: 'Company',
            user: 'Student' 
        };

        router.post(route('dev.switch-role', { role: roleMap[r] }), {}, {
            onSuccess: () => {
                setActiveRole(r);
                // Force a reload to pick up the new sidebar/dashboard content
                window.location.reload(); 
            }
        });
    };

    return (
        <SidebarProvider>
            <SelectedSidebar />

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border">
                        <span className="text-[10px] font-bold px-2 uppercase text-muted-foreground">Preview Role:</span>
                        {(['admin', 'company', 'user'] as UserRole[]).map((r) => (
                            <Button
                                key={r}
                                variant={activeRole === r ? "default" : "ghost"}
                                size="sm"
                                className="h-7 text-[10px] px-2"
                                onClick={() => handleRoleSwitch(r)}
                            >
                                {r.toUpperCase()}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => router.post(route('logout'))}
                    >
                        Logout
                    </Button>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}