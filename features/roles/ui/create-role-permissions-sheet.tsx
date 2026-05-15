"use client"

import { useState } from "react"

import type { CreateRoleDetailsValues } from "@/features/roles/schemas"
import { PermissionPickerPanels } from "@/features/roles/ui/permission-picker-panels"
import { useCreateRoleWithPermissionsMutation } from "@/features/roles/usecases/create-role-with-permissions.usecase"
import { usePermissionCatalogQuery } from "@/features/roles/usecases/permission-catalog.usecase"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

export type CreateRolePermissionsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Step 1 payload; sheet no-ops when null. */
  details: CreateRoleDetailsValues | null
  onBack: () => void
  onFinished: () => void
}

export function CreateRolePermissionsSheet({
  open,
  onOpenChange,
  details,
  onBack,
  onFinished,
}: CreateRolePermissionsSheetProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const catalogQuery = usePermissionCatalogQuery({ enabled: open })

  const createMutation = useCreateRoleWithPermissionsMutation()

  function handleOpenChange(next: boolean) {
    if (next) {
      setSelectedIds(new Set())
    }

    onOpenChange(next)
  }

  function handleBack() {
    onOpenChange(false)
    onBack()
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-4 overflow-y-auto data-[side=right]:sm:max-w-3xl"
      >
        <SheetHeader>
          <SheetTitle>Configure permissions</SheetTitle>
          <SheetDescription>
            Step 2 of 2 — choose modules on the left, then tick permissions.
            {details ? (
              <>
                {" "}
                New role:{" "}
                <span className="font-medium text-foreground">
                  {details.name}
                </span>{" "}
                <span className="font-mono text-muted-foreground">
                  ({details.code})
                </span>
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        {catalogQuery.isPending ? (
          <Skeleton className="min-h-[240px] w-full rounded-lg" />
        ) : catalogQuery.isError ? (
          <p className="text-sm text-destructive">
            Could not load permissions catalog.
          </p>
        ) : (
          <div className="px-4">
            <PermissionPickerPanels
              catalog={catalogQuery.data ?? []}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
            />
          </div>
        )}

        <SheetFooter className="mt-auto flex-row justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={createMutation.isPending}
          >
            ← Back
          </Button>
          <Button
            type="button"
            disabled={
              createMutation.isPending ||
              !details ||
              catalogQuery.isPending ||
              catalogQuery.isError
            }
            onClick={() => {
              if (!details) return

              createMutation.mutate(
                { draft: details, permissionIds: [...selectedIds] },
                {
                  onSuccess: () => {
                    onFinished()
                    handleOpenChange(false)
                  },
                }
              )
            }}
          >
            {createMutation.isPending ? "Creating…" : "Create role"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
