"use client"

import type { ColumnDef } from "@tanstack/react-table"

import type { TinRequestListItem } from "@/features/tin-requests/types"
import {
  formatTinRequestDate,
  TinRequestStatusBadge,
  TinRequestTaxpayerTypeBadge,
  UuidPreview,
} from "@/features/tin-requests/lib/tin-request-display"
import { TinRequestRowActions } from "@/features/tin-requests/ui/tin-request-row-actions"

export const tinRequestsColumns: ColumnDef<TinRequestListItem>[] = [
  {
    accessorKey: "requesterRef",
    header: "Requester ref",
    cell: ({ row }) =>
      row.original.requesterRef ? (
        <span className="font-mono text-sm">{row.original.requesterRef}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "taxpayerType",
    header: "Taxpayer type",
    cell: ({ row }) => (
      <TinRequestTaxpayerTypeBadge type={row.original.taxpayerType} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <TinRequestStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "generatedTin",
    header: "Generated TIN",
    cell: ({ row }) =>
      row.original.generatedTin ? (
        <span className="font-mono text-sm">{row.original.generatedTin}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "requestedBy",
    header: "Requested by",
    cell: ({ row }) => <UuidPreview id={row.original.requestedBy} />,
  },
  {
    accessorKey: "requestedAt",
    header: "Requested date",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatTinRequestDate(row.original.requestedAt)}
      </span>
    ),
  },
  {
    accessorKey: "processedBy",
    header: "Processed by",
    cell: ({ row }) =>
      row.original.processedBy ? (
        <UuidPreview id={row.original.processedBy} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <TinRequestRowActions row={row.original} />,
  },
]
