import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/Components/ui/pagination';

export interface PlacementData {
    id: number;
    student_name: string;
    programme: string;
    company_name: string;
    // status removed
}

interface PlacementDataTableProps {
    data: PlacementData[];
}

const PlacementDataTable = ({ data }: PlacementDataTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(start, start + ITEMS_PER_PAGE);
    }, [data, currentPage]);

    return (
        <div className='w-full'>
            <div className='overflow-hidden rounded-md border border-gray-200 bg-white'>
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Student Name</TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Programme</TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Company Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-6 py-4 font-medium text-gray-900">{item.student_name}</TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600">{item.programme}</TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600">{item.company_name}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                    No recruited placements found.
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
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page} className="cursor-pointer">
                                    <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext 
                                    className={`cursor-pointer ${currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}`}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default PlacementDataTable;