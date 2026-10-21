import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"
import { Button } from "@/Components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialPageIndex?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialPageIndex = 0,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageIndex: initialPageIndex } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        {(() => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          const rowCount = table.getFilteredRowModel().rows.length;
          const firstRow = rowCount ? pageIndex * pageSize + 1 : 0;
          const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);
          return <p className="text-xs font-medium text-slate-500">Showing <span className="tabular-nums text-slate-700">{firstRow}–{lastRow}</span> of <span className="tabular-nums text-slate-700">{rowCount}</span></p>;
        })()}
        <div className="flex items-center gap-2 sm:justify-end">
          <span className="mr-1 text-xs tabular-nums text-slate-500">Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}</span>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-slate-200 bg-white px-3 shadow-sm hover:border-primary/30 hover:bg-primary/5" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft aria-hidden="true" className="size-4" />Previous
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-slate-200 bg-white px-3 shadow-sm hover:border-primary/30 hover:bg-primary/5" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next<ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
