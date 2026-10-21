import { Link } from '@inertiajs/react';
import { User } from '@/types';
import {
  ChevronsUpDown,
  LogOut,
} from "lucide-react"
import { navigationIcons } from '@/lib/navigation-icons';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/Components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/Components/ui/sidebar"

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();

  const profileRouteMap: Record<string, string> = {
    Admin: 'admin.profile',
    Student: 'student.profile',
    Company: 'company.profile',
    'Academic Supervisor': 'academic-supervisor.profile',
    'Industry Supervisor': 'industry-supervisor.profile',
  };

  const profileRoute = profileRouteMap[user.role] ?? 'profile.edit';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus-visible:ring-0"
            >
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={(user.name || user.username || user.email)} />
                <AvatarFallback className="rounded-lg">
                  {(user.name || user.username || user.email).substring(0, 2).toUpperCase() ?? ''}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">{(user.name || user.username || user.email)}</span>
                <span className="text-xs truncate">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={(user.name || user.username || user.email)} />
                  <AvatarFallback className="rounded-lg">
                    {(user.name || user.username || user.email).substring(0, 2).toUpperCase() ?? ''}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">{(user.name || user.username || user.email)}</span>
                  <span className="text-xs truncate">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={route(profileRoute)}>
                  <navigationIcons.profile className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={route('profile.edit')}><navigationIcons.accountSettings className="size-4" strokeWidth={1.75} aria-hidden="true" />Account settings</Link></DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="flex items-center w-full text-destructive"
              >
                <LogOut className="size-4 text-destructive" strokeWidth={1.75} aria-hidden="true" />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
