"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import type { ColumnDef } from "@tanstack/react-table"

import type { TaxOfficeListItem } from "@/features/tax-offices/types"
import { TaxOfficeStatusBadge } from "@/features/tax-offices/lib/tax-office-display"
import { TaxOfficeRowActions } from "@/features/tax-offices/ui/tax-office-row-actions"
import { regionsReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

function TaxOfficeRegionCell({ regionId }: { regionId: string }) {
  const { data: regions = [] } = useQuery(regionsReferenceQueryOptions())

  const resolved = useMemo(() => {
    const r = regions.find((x) => x.id === regionId)
    if (r) return { kind: "named" as const, label: `${r.code} · ${r.name}` }
    return { kind: "id" as const, label: regionId }
  }, [regionId, regions])

  if (resolved.kind === "named") {
    return <span className="text-sm">{resolved.label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">
      {resolved.label}
    </span>
  )
}

export const taxOfficesColumns: ColumnDef<TaxOfficeListItem>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "regionId",
    header: "Region",
    cell: ({ row }) => <TaxOfficeRegionCell regionId={row.original.regionId} />,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="max-w-[220px] truncate text-sm">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <TaxOfficeStatusBadge isActive={row.original.isActive} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <TaxOfficeRowActions taxOffice={row.original} />,
  },
]
