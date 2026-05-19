"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import type { ColumnDef } from "@tanstack/react-table"

import type { OrganizationListItem } from "@/features/organizations/types"
import { OrganizationStatusBadge } from "@/features/organizations/lib/organization-display"
import { OrganizationRowActions } from "@/features/organizations/ui/organization-row-actions"
import { businessLinesReferenceQueryOptions, taxOfficesReferenceSelectQueryOptions } from "@/lib/query/admin-reference-select-queries"

function TaxOfficeNameCell({ taxOfficeId }: { taxOfficeId: string }) {
  const { data: offices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )

  const label = useMemo(() => {
    const o = offices.find((x) => x.id === taxOfficeId)
    if (o) return `${o.code} — ${o.name}`
    return taxOfficeId
  }, [taxOfficeId, offices])

  const resolved = offices.some((x) => x.id === taxOfficeId)

  if (resolved) {
    return <span className="text-sm">{label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
  )
}

function BusinessLineNameCell({
  businessLineId,
}: {
  businessLineId: string
}) {
  const { data: lines = [] } = useQuery(businessLinesReferenceQueryOptions())

  const label = useMemo(() => {
    const l = lines.find((x) => x.id === businessLineId)
    if (l) return `${l.code} — ${l.name}`
    return businessLineId
  }, [businessLineId, lines])

  const resolved = lines.some((x) => x.id === businessLineId)

  if (resolved) {
    return <span className="text-sm">{label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
  )
}

export const organizationsColumns: ColumnDef<OrganizationListItem>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "regNumber",
    header: "CAC reg. no.",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.regNumber ?? (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "taxOfficeId",
    header: "Tax office",
    cell: ({ row }) => (
      <TaxOfficeNameCell taxOfficeId={row.original.taxOfficeId} />
    ),
  },
  {
    accessorKey: "businessLineId",
    header: "Business line",
    cell: ({ row }) => (
      <BusinessLineNameCell businessLineId={row.original.businessLineId} />
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <OrganizationStatusBadge isActive={row.original.isActive} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <OrganizationRowActions organization={row.original} />
    ),
  },
]
