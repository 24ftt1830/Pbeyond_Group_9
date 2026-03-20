import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/Components/ui/pagination';

export interface CompanyData {
  id: number;
  name: string;
  total_quota: number;
  filled: number;
  available: number;
  category?: string;
}

interface CompanyDataTableProps {
  data: CompanyData[];
}

const CompanyDataTable = ({ data }: CompanyDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className='w-full'>
      <div className='overflow-hidden rounded-md border border-gray-200 bg-white'>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Company Name
              </TableHead>
              <TableHead className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Quota
              </TableHead>
              <TableHead className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Filled
              </TableHead>
              <TableHead className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Available
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 py-4 font-semibold text-gray-900">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-center px-6 py-4">
                    {item.total_quota}
                  </TableCell>
                  <TableCell className="text-center px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.filled >= item.total_quota 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.filled}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4 font-mono font-medium text-emerald-600">
                    {item.available}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No matching companies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  className={`cursor-pointer ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => handlePageChange(currentPage - 1)} 
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} className="cursor-pointer">
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  className={`cursor-pointer ${currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => handlePageChange(currentPage + 1)} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="font-medium text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, data.length)}</span> of{" "}
            <span className="font-medium text-slate-700">{data.length}</span> results
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyDataTable;