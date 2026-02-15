import { Sidebar, SidebarContent, SidebarHeader } from "@/Components/ui/sidebar"

export function CompanySidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4 font-bold">Company Portal</SidebarHeader>
            <SidebarContent>
                {/* Add your NavMain, etc. here */}
                <p className="p-4 text-xs">Company Links go here</p>
            </SidebarContent>
        </Sidebar>
    )
}