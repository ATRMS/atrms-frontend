"use client"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchParameters } from "@/features/parameters/api/parameters-api"
import type { Parameter, ParameterValue } from "@/features/parameters/types"
import { queryKeys } from "@/lib/query-keys"
export function formatParameterValue(
  value: ParameterValue | undefined,
  type: Parameter["valueType"]
): string {
  if (value === undefined) return "Not set"
  if (type === "RATE") return `${Number(value) * 100}%`
  if (Array.isArray(value)) return `${value.length} bands`
  return String(value)
}
export function ParametersPage() {
  const columns = useMemo<ColumnDef<Parameter>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <Button asChild variant="link" className="h-auto px-0 font-mono">
            <Link href={`/admin/parameters/${row.original.code}`}>
              {row.original.code}
            </Link>
          </Button>
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "valueType", header: "Type" },
      {
        id: "inForce",
        header: "In force",
        cell: ({ row }) =>
          formatParameterValue(
            row.original.inForce?.value,
            row.original.valueType
          ),
      },
      {
        id: "since",
        header: "Since",
        cell: ({ row }) => row.original.inForce?.effectiveFrom ?? "—",
      },
      {
        accessorKey: "requiredFor",
        header: "Needed by",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.requiredFor.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        ),
      },
    ],
    []
  )
  const filters: DataTableFilterConfig[] = [
    {
      type: "select",
      paramKey: "notSet",
      label: "Value",
      placeholder: "Value",
      emptyValue: "__all__",
      options: [
        { value: "__all__", label: "All" },
        { value: "true", label: "Not set" },
      ],
    },
  ]
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={
        <PermissionDeniedFallback resourceLabel="statutory parameters" />
      }
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Statutory parameters"
          description="Review and propose dated values established by law."
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.resourceLists("parameters")}
          queryFn={fetchParameters}
          filters={filters}
          emptyMessage="No statutory parameters match your filters."
        />
      </div>
    </PermissionGate>
  )
}
