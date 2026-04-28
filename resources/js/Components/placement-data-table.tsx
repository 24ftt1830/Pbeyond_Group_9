import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/Components/ui/pagination';

export interface PlacementData {
    id: number;
    student_name: string;
    programme: string;
    company_name: string;
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
            <div className='overflow-hidden border border-gray-200'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Programme</TableHead>
                            <TableHead>Company Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.student_name}</TableCell>
                                    <TableCell>{item.programme}</TableCell>
                                    <TableCell>{item.company_name}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                                    No records found.
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
                                    className="cursor-pointer"
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
                                    className="cursor-pointer"
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