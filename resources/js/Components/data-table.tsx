import { router } from '@inertiajs/react'
import { EllipsisVertical, Link2Off, Trash2, UserRoundPen, Link } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/Components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/Components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Button } from '@/Components/ui/button'

interface Column {
  header: string;
  key: string;
}

interface UserTableProps {
  data: any[];
  columns: Column[];
}

const UserTable = ({ data = [], columns = [] }: UserTableProps) => {

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to permanently delete this user?')) {
      router.delete(route('admin.manage-users.destroy', id));
    }
  };

  const handleUnassign = (id: number) => {
    if (confirm('Remove this user from their assigned company?')) {
      router.post(route('admin.manage-users.unassign', id));
    }
  };

  return (
    <div className='w-full'>
      <div className='w-full'>
        <Table className="border-separate border-spacing-0"> 
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col, index) => (
                <TableHead
                  key={col.key}
                  className={`text-xs font-medium text-slate-700 bg-[#f9f9f9]
            ${col.key === 'actions' ? 'w-[60px] text-right' : 'text-left'}
            ${index === 0 ? 'rounded-l-lg' : ''} 
            ${index === columns.length - 1 ? 'rounded-r-lg' : ''}
          `}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item.id || index} className="border-b border-slate-100 hover:bg-slate-50/50">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3 text-sm text-slate-700">

                      {/* Identity Column Logic */}
                      {col.key === 'user_identity' ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {item.role === 'Student' ? (item.student?.full_name || '—') : item.username}
                          </span>
                          <span className="text-xs text-slate-500">
                            {item.email}
                          </span>
                        </div>
                      ) : col.key === 'programme_name' ? (
                        <span className="text-slate-600">
                          {item.student?.programme?.programme_name || '—'}
                        </span>
                      ) : col.key === 'actions' ? (
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 focus-visible:ring-0">
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              {/* Header */}
                              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {/* Management Group */}
                              <DropdownMenuItem onClick={() => item.onEdit()} className="gap-2 cursor-pointer">
                                <UserRoundPen className="h-4 w-4 text-muted-foreground" />
                                <span>Edit Details</span>
                              </DropdownMenuItem>

                              {item.role === 'Company' && !item.company_id && (
                                <DropdownMenuItem onClick={() => item.onAssign()} className="gap-2 cursor-pointer">
                                  <Link className="h-4 w-4 text-muted-foreground" />
                                  <span>Assign Company</span>
                                </DropdownMenuItem>
                              )}

                              {item.role === 'Company' && item.assigned_company_id && (
                                <DropdownMenuItem onClick={() => handleUnassign(item.id)} className="gap-2 cursor-pointer">
                                  <Link2Off className="h-4 w-4 text-muted-foreground" />
                                  <span>Unassign Company</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {/* Destructive Group */}
                              <DropdownMenuItem
                                onClick={() => handleDelete(item.id)}
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete User</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        item[col.key] || '—'
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  No users found in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 10 && (
        <Pagination className='mt-4'>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default UserTable;