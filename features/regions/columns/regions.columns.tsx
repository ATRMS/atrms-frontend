"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import type { ColumnDef } from "@tanstack/react-table"

import type { RegionListItem } from "@/features/regions/types"
import { RegionTypeBadge } from "@/features/regions/lib/region-display"
import { RegionRowActions } from "@/features/regions/ui/region-row-actions"
import { regionsReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

function RegionParentCell({ parentId }: { parentId: string | null }) {
  const { data: regions = [] } = useQuery(regionsReferenceQueryOptions())

  const resolved = useMemo(() => {
    if (!parentId) return { kind: "none" as const }
    const p = regions.find((r) => r.id === parentId)
    if (p) return { kind: "named" as const, label: `${p.code} · ${p.name}` }
    return { kind: "id" as const, label: parentId }
  }, [parentId, regions])

  if (resolved.kind === "none") {
    return <span className="text-muted-foreground">—</span>
  }

  if (resolved.kind === "named") {
    return <span className="text-sm">{resolved.label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{resolved.label}</span>
  )
}

export const regionsColumns: ColumnDef<RegionListItem>[] = [
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <RegionTypeBadge type={row.original.type} />,
  },
  {
    accessorKey: "parentId",
    header: "Parent region",
    cell: ({ row }) => <RegionParentCell parentId={row.original.parentId} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RegionRowActions region={row.original} />,
  },
]
