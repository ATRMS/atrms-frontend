"use client"

import { useMemo, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchTinRequestsList } from "@/features/tin-requests/api/tin-requests-api"
import { tinRequestsColumns } from "@/features/tin-requests/columns/tin-requests.columns"
import { SubmitTinRequestDialog } from "@/features/tin-requests/ui/submit-tin-request-dialog"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

const TAXPAYER_TYPE_FILTER_OPTIONS = [
  { value: "__all__", label: "All types" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "CORPORATE", label: "Corporate" },
] as const

export function TinRequestsPage() {
  const [submitOpen, setSubmitOpen] = useState(false)

  const filters = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        type: "select",
        paramKey: "status",
        label: "Status",
        placeholder: "Status",
        widthClass: "w-[180px]",
        emptyValue: "__all__",
        options: [...STATUS_FILTER_OPTIONS],
      },
      {
        type: "select",
        paramKey: "taxpayerType",
        label: "Taxpayer type",
        placeholder: "Taxpayer type",
        widthClass: "w-[180px]",
        emptyValue: "__all__",
        options: [...TAXPAYER_TYPE_FILTER_OPTIONS],
      },
    ],
    []
  )

  return (
    <PermissionGate
      permission={PermissionCodes.taxpayerRead}
      fallback={<PermissionDeniedFallback resourceLabel="TIN requests" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="TIN requests"
          description="Submit, approve, or reject taxpayer identification requests before registration."
          action={
            <PermissionGate permission={PermissionCodes.taxpayerCreate}>
              <Button type="button" onClick={() => setSubmitOpen(true)}>
                Submit TIN request
              </Button>
            </PermissionGate>
          }
        />

        <DataTable
          columns={tinRequestsColumns}
          queryKey={queryKeys.taxpayers.tinRequestsLists()}
          queryFn={fetchTinRequestsList}
          filters={filters}
          emptyMessage="No TIN requests match your filters."
        />

        <PermissionGate permission={PermissionCodes.taxpayerCreate}>
          <SubmitTinRequestDialog
            open={submitOpen}
            onOpenChange={setSubmitOpen}
          />
        </PermissionGate>
      </div>
    </PermissionGate>
  )
}
