"use client"

import { LockIcon } from "lucide-react"

import type { ColumnDef } from "@tanstack/react-table"

import type { NotificationTemplateListItem } from "@/features/notification-templates/types"
import {
  NotificationChannelBadge,
  NotificationTemplateStatusBadge,
} from "@/features/notification-templates/lib/template-display"
import { NotificationTemplateRowActions } from "@/features/notification-templates/ui/notification-template-row-actions"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const notificationTemplatesColumns: ColumnDef<NotificationTemplateListItem>[] =
  [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }) => (
        <NotificationChannelBadge channel={row.original.channel} />
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => {
        const subject = row.original.subject?.trim()
        if (!subject) {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <span className="block max-w-[200px] truncate" title={subject}>
            {subject}
          </span>
        )
      },
    },
    {
      accessorKey: "isSystem",
      header: "System",
      cell: ({ row }) =>
        row.original.isSystem ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex text-muted-foreground">
                <LockIcon className="size-4" aria-label="System template" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              System templates cannot be deactivated
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <NotificationTemplateStatusBadge isActive={row.original.isActive} />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <NotificationTemplateRowActions row={row.original} />,
    },
  ]
