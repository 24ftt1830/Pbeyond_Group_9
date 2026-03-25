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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Building2, MapPin, Tag, Users, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface CompanyData {
  company_id: number;
  company_name: string;      
  office_address: string;    
  total_quota: number;
  filled: number;
  available: number;
  industry_sector?: string;  
  status?: string;
}

interface CompanyDataTableProps {
  data: CompanyData[];
}

const CompanyDataTable = ({ data }: CompanyDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className='w-full'>
      <div className='overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm'>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Company Name</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Location</TableHead>
              <TableHead className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Quota</TableHead>
              <TableHead className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Filled</TableHead>
              <TableHead className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Available</TableHead>
              <TableHead className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow
                  key={item.company_id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedCompany(item)}
                >
                  <TableCell className="px-6 py-4 font-semibold text-gray-900">{item.company_name}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 text-sm">{item.office_address}</TableCell>
                  <TableCell className="text-center px-6 py-4 text-gray-600">{item.total_quota}</TableCell>
                  <TableCell className="text-center px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.filled >= item.total_quota ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                      {item.filled}
                    </span>
                  </TableCell>
                  <TableCell className="text-center px-6 py-4 font-mono font-medium text-slate-600">{item.available}</TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight ${item.available === 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {item.available === 0 ? 'Full' : 'Available'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No matching companies found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl [&>button]:text-white [&>button]:opacity-80 [&>button:hover]:opacity-100">
          {selectedCompany && (
            <>
              <div className="bg-slate-900 p-8 text-white relative">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Company Profile</h2>
                <DialogTitle className="text-2xl font-black text-white">{selectedCompany.company_name}</DialogTitle>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5"><MapPin size={12} /> Location</label>
                    <p className="text-sm font-bold text-slate-700">{selectedCompany.office_address}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5"><Tag size={12} /> Industry</label>
                    <p className="text-sm font-bold text-slate-700">{selectedCompany.industry_sector || 'N/A'}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5"><Users size={12} /> Quota Distribution</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total</p>
                      <p className="text-2xl font-black text-slate-900">{selectedCompany.total_quota}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                      <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Filled</p>
                      <p className="text-2xl font-black text-blue-700">{selectedCompany.filled}</p>
                    </div>
                    <div className={selectedCompany.available > 0 ? "bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center" : "bg-red-50 p-4 rounded-xl border border-red-100 text-center"}>
                      <p className={`text-[10px] uppercase font-bold mb-1 ${selectedCompany.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>Left</p>
                      <p className={`text-2xl font-black ${selectedCompany.available > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{selectedCompany.available}</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl flex items-center justify-center gap-3 border transition-all ${selectedCompany.available === 0 ? 'bg-red-50 border-red-100 text-red-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                  {selectedCompany.available === 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  <span className="text-xs font-black uppercase tracking-widest">{selectedCompany.available === 0 ? 'Capacity Reached' : 'Accepting Placements'}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious className={`cursor-pointer ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`} onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} className="cursor-pointer">
                  <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)}>{page}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext className={`cursor-pointer ${currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}`} onClick={() => handlePageChange(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default CompanyDataTable;