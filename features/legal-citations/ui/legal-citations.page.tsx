"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"
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
import { useAuthStore } from "@/features/authentication/store/auth-store"
import { fetchCitations } from "@/features/legal-citations/api/legal-citations-api"
import type { Citation } from "@/features/legal-citations/types"
import { CitationFormDialog } from "@/features/legal-citations/ui/citation-form-dialog"
import { queryKeys } from "@/lib/query-keys"
export function LegalCitationsPage() {
  const router = useRouter()
  const canWrite = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataWrite)
  )
  const [open, setOpen] = useState(false)
  const columns = useMemo<ColumnDef<Citation>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <Button asChild variant="link" className="h-auto px-0 font-mono">
            <Link href={`/admin/legal-citations/${row.original.code}`}>
              {row.original.code}
            </Link>
          </Button>
        ),
      },
      {
        id: "title",
        header: "Title",
        cell: ({ row }) => row.original.inForce?.title ?? "Not set",
      },
      {
        id: "jurisdiction",
        header: "Jurisdiction",
        cell: ({ row }) => row.original.inForce?.jurisdiction ?? "—",
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "default" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  )
  const filters: DataTableFilterConfig[] = [
    { type: "search", paramKey: "documentType", placeholder: "Document type…" },
    {
      type: "date",
      paramKey: "asOf",
      label: "As of",
      boundary: "startOfDay",
    },
  ]
  return (
    <PermissionGate
      permission={PermissionCodes.masterDataRead}
      fallback={<PermissionDeniedFallback resourceLabel="legal citations" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Legal citations"
          description="Manage the approved legal wording printed on documents."
          action={
            canWrite ? (
              <Button onClick={() => setOpen(true)}>Add legal citation</Button>
            ) : null
          }
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.masterData.resourceLists("legal-citations")}
          queryFn={fetchCitations}
          filters={filters}
          emptyMessage="No legal citations match your filters."
        />
        <CitationFormDialog
          code={null}
          open={open}
          onOpenChange={setOpen}
          onSaved={(code) => router.push(`/admin/legal-citations/${code}`)}
        />
      </div>
    </PermissionGate>
  )
}
