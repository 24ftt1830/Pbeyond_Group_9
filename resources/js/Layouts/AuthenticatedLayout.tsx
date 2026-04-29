import * as React from "react"
import { usePage, router } from '@inertiajs/react'
import { PageProps, UserRole } from '@/types'
import { CommandMenu } from "@/Components/ui/command-menu"
import { Toaster } from "@/Components/ui/sonner";

import { AdminSidebar } from "@/Components/Sidebars/AdminSidebar"
import { CompanySidebar } from "@/Components/Sidebars/CompanySidebar"
import { UserSidebar } from "@/Components/Sidebars/UserSidebar"

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

            <SidebarInset className="min-w-0 h-screen flex flex-col">
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-10">
                        <CommandMenu />
                    {/*
                    hello dear juniors, before you start coding, uncomment the <div> section below to enable role preview buttons.
                    you don't have to login/out multiple times to test diff views. just switch the toggles

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
                    
                    // LOGOUT BUTTON
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => router.post(route('logout'))}
                    >
                        Logout
                    </Button>*/}
                </header>

                <div className="main-scroll flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto overflow-x-hidden">
                    {children}
                    <Toaster />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}