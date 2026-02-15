import { Sidebar, SidebarContent, SidebarHeader } from "@/Components/ui/sidebar"

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4 font-bold">Admin Portal</SidebarHeader>
            <SidebarContent>
                {/* Add your NavMain, etc. here */}
                <p className="p-4 text-xs">Admin Links go here</p>
            </SidebarContent>
        </Sidebar>
    )
}