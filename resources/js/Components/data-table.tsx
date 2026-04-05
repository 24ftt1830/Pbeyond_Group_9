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
      // Ensure this route exists in your web.php
      router.post(route('admin.manage-users.unassign', id));
    }
  };

  return (
    <div className='w-full'>
      <div className='overflow-hidden rounded-md border bg-white'>
        <Table className="table-fixed w-full"> 
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col) => (
                <TableHead 
                  key={col.key} 
                  className={`font-bold text-slate-700 ${
                    col.key === 'actions' ? 'w-[60px] text-right' : 'w-auto text-left'
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item.id || index} className="hover:bg-slate-50/50">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3">
                      {col.key === 'actions' ? (
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 focus-visible:ring-0">
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                              
                              {/* EDIT ACTION (Common for both) */}
                              <DropdownMenuItem 
                                onClick={() => item.onEdit()}
                                className="cursor-pointer"
                              >
                                <UserRoundPen className="mr-2 h-4 w-4 text-slate-500" /> Edit Details
                              </DropdownMenuItem>

                              {/* REPRESENTATIVE SPECIFIC: ASSIGN */}
                              {item.role === 'Company' && !item.assigned_company_id && (
                                <DropdownMenuItem 
                                  onClick={() => item.onAssign()}
                                  className="cursor-pointer text-blue-600 focus:text-blue-700 font-medium"
                                >
                                  <Link className="mr-2 h-4 w-4" /> Assign Company
                                </DropdownMenuItem>
                              )}

                              {/* REPRESENTATIVE SPECIFIC: UNASSIGN */}
                              {item.role === 'Company' && item.assigned_company_id && (
                                <DropdownMenuItem 
                                  onClick={() => handleUnassign(item.id)}
                                  className="cursor-pointer"
                                >
                                  <Link2Off className="mr-2 h-4 w-4 text-slate-500" /> Unassign Company
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              
                              {/* DELETE ACTION (Destructive Color) */}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive focus:bg-destructive focus:text-white cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <span className="truncate block text-slate-600">
                          {item[col.key] || '—'}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
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