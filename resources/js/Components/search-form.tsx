import { Search } from "lucide-react"

import { Label } from "@/Components/ui/label"
import { SidebarInput } from "@/Components/ui/sidebar"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Type to search..."
          className="h-8 pl-7"
        />
        <Search className="absolute -translate-y-1/2 opacity-50 pointer-events-none select-none left-2 top-1/2 size-4" />
      </div>
    </form>
  )
}
