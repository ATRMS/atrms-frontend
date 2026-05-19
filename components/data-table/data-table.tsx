"use client"

import { useCallback, useMemo } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeftIcon, ChevronRightIcon, FileSearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  DataTableFilters,
  mergeDataTableListParams,
  parseDataTableUrlState,
  serializeDataTableUrlState,
  type DataTableFilterConfig,
  type DataTableUrlState,
} from "@/components/data-table/data-table-filters"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ApiListParams, PaginatedListResponse } from "@/types/api"

export type {
  DataTableDateFilter,
  DataTableFilterConfig,
  DataTableNumberFilter,
  DataTableSearchFilter,
  DataTableSelectFilter,
  DataTableTextFilter,
} from "@/components/data-table/data-table-filters"

export type DataTableFetchParams = ApiListParams

export type DataTableQueryFn<TData> = (
  params: DataTableFetchParams
) => Promise<PaginatedListResponse<TData>>

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  /** TanStack Query key prefix; list fetch params are appended automatically. */
  queryKey: readonly unknown[]
  queryFn: DataTableQueryFn<TData>
  filters: DataTableFilterConfig[]
  defaultPageSize?: number
  emptyMessage?: string
}

export function DataTable<TData, TValue = unknown>({
  columns,
  queryFn,
  queryKey,
  defaultPageSize = 20,
  emptyMessage = "No records found.",
  filters,
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const urlState: DataTableUrlState = useMemo(
    () =>
      parseDataTableUrlState(
        new URLSearchParams(searchParams.toString()),
        filters,
        defaultPageSize
      ),
    [searchParams, filters, defaultPageSize]
  )

  const replaceUrlState = useCallback(
    (next: DataTableUrlState) => {
      const qs = serializeDataTableUrlState(next, filters, defaultPageSize)
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [defaultPageSize, pathname, router, filters]
  )

  const listParams: DataTableFetchParams = useMemo(
    () =>
      mergeDataTableListParams(
        urlState.page,
        urlState.size,
        urlState.filterValues,
        filters
      ),
    [filters, urlState.filterValues, urlState.page, urlState.size]
  )

  const fullQueryKey = useMemo(
    () => [...queryKey, listParams] as const,
    [queryKey, listParams]
  )

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => {
      const params = {
        ...listParams,
        page: Math.max(0, (listParams.page ?? 1) - 1),
      }
      return queryFn(params)
    },
    placeholderData: keepPreviousData,
  })

  const rows = data?.data ?? []
  const meta = data?.meta
  const total = meta?.total ?? 0

  const page = urlState.page
  const pageSize = urlState.size
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table intentionally returns non-memoizable table helpers.
  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableSorting: false,
    pageCount,
  })

  const handleFiltersPatch = useCallback(
    (patch: Record<string, string>) => {
      replaceUrlState({
        ...urlState,
        page: 1,
        filterValues: { ...urlState.filterValues, ...patch },
      })
    },
    [replaceUrlState, urlState]
  )

  return (
    <div className="flex flex-col gap-4">
      <DataTableFilters
        filters={filters}
        filterValues={urlState.filterValues}
        onFiltersPatch={handleFiltersPatch}
      />

      <div className="overflow-hidden rounded-lg border">
        <Table>
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
            {isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-destructive"
                >
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong."}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-3"
                    onClick={() => void refetch()}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : isFetching ? (
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                    <FileSearchIcon />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isError && meta && total > 0 ? (
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{from}</span>
            {"–"}
            <span className="font-medium text-foreground">{to}</span>
            {" of "}
            <span className="font-medium text-foreground">{total}</span>
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  replaceUrlState({
                    ...urlState,
                    size: Number(value),
                    page: 1,
                  })
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-18"
                  aria-label="Rows per page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TABLE_PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {meta.page + 1} of {pageCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() =>
                    replaceUrlState({ ...urlState, page: Math.max(1, page - 1) })
                  }
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() =>
                    replaceUrlState({
                      ...urlState,
                      page: Math.min(pageCount, page + 1),
                    })
                  }
                  disabled={page >= pageCount}
                  aria-label="Next page"
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
