import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

interface Column {
  header: string;
  key: string;
}

interface UserTableProps {
  data: any[];
  columns: Column[];
}

const UserTable = ({ data = [], columns = [] }: UserTableProps) => {
  return (
    <div className='w-full'>
      <div className='overflow-hidden rounded-md border bg-white'>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="font-bold text-slate-700">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {item[col.key] || '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* table logic to be implemented later */}
      {data.length > 10 && (
        <Pagination className='mt-4 cursor-pointer'>
          <PaginationContent>
            <PaginationItem><PaginationPrevious /></PaginationItem>
            <PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default UserTable