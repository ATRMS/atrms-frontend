"use client"

import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type TableOptions,
  useReactTable,
} from "@tanstack/react-table"

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
}: BasicDataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns unstable function refs by design
  const table = useReactTable({
    ...tableOptions,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isPending) {
    return <Skeleton className={pendingSkeletonClassName} />
  }

  if (isError) {
    return (
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
  }

  const colSpan = columns.length

  return (
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
