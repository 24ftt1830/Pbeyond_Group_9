import { Sidebar, SidebarContent, SidebarHeader } from "@/Components/ui/sidebar"

export function UserSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4 font-bold">User Portal</SidebarHeader>
            <SidebarContent>
                {/* Add your NavMain, etc. here */}
                <p className="p-4 text-xs">User Links go here</p>
            </SidebarContent>
        </Sidebar>
    )
}