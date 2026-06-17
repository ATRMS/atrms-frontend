"use client"

import type { ReactNode } from "react"
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type TableOptions,
  useReactTable,
} from "@tanstack/react-table"

import {
  DataTableFilters,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table-filters"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type BasicDataTableProps<TData, TValue = unknown> = {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  isPending?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyMessage?: string
  errorMessage?: string
  pendingSkeletonClassName?: string
  className?: string
  /** Passed through to TanStack Table (after core options). */
  tableOptions?: Omit<
    TableOptions<TData>,
    "data" | "columns" | "getCoreRowModel"
  >
  /** Optional filter toolbar (local state via `useBasicDataTableFilters`). */
  filters?: DataTableFilterConfig[]
  filterValues?: Record<string, string>
  onFiltersPatch?: (patch: Record<string, string>) => void
}

export function BasicDataTable<TData, TValue = unknown>({
  data,
  columns,
  isPending = false,
  isError = false,
  onRetry,
  emptyMessage = "No records found.",
  errorMessage = "Could not load data.",
  pendingSkeletonClassName = "h-[280px] w-full rounded-lg",
  className,
  tableOptions,
  filters,
  filterValues,
  onFiltersPatch,
}: BasicDataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns unstable function refs by design
  const table = useReactTable({
    ...tableOptions,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const showFilters =
    filters &&
    filters.length > 0 &&
    filterValues &&
    onFiltersPatch

  const filterBar = showFilters ? (
    <DataTableFilters
      filters={filters}
      filterValues={filterValues}
      onFiltersPatch={onFiltersPatch}
    />
  ) : null

  const colSpan = columns.length

  let tableBody: ReactNode

  if (isPending) {
    tableBody = <Skeleton className={pendingSkeletonClassName} />
  } else if (isError) {
    tableBody = (
      <p className="text-sm text-destructive">
        {errorMessage}{" "}
        {onRetry ? (
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() => void onRetry()}
          >
            Retry
          </Button>
        ) : null}
      </p>
    )
  } else {
    tableBody = (
      <Table className={cn(className)}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={colSpan}
              className="text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
      </Table>
    )
  }

  if (!showFilters) {
    return tableBody
  }

  return (
    <div className="flex flex-col gap-4">
      {filterBar}
      {tableBody}
    </div>
  )
}
