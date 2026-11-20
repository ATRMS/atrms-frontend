"use client"

import { ChevronRightIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import {
  formatPermissionModuleLabel,
  groupPermissionsByModule,
  sortedModuleKeys,
} from "@/features/roles/lib/group-permissions-by-module"
import { usePermissionCatalogQuery } from "@/features/roles/usecases/permission-catalog.usecase"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
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

const MODULE_FILTER_ALL = "all"

export function PermissionsPage() {
  const catalogQuery = usePermissionCatalogQuery()
  const [moduleFilter, setModuleFilter] = useState(MODULE_FILTER_ALL)

  const byModule = useMemo(
    () => groupPermissionsByModule(catalogQuery.data ?? []),
    [catalogQuery.data]
  )

  const modules = useMemo(() => sortedModuleKeys(byModule), [byModule])

  const visibleModules = useMemo(() => {
    if (moduleFilter === MODULE_FILTER_ALL) return modules

    return modules.filter((m) => m === moduleFilter)
  }, [modules, moduleFilter])

  return (
    <PermissionGate
      permission={PermissionCodes.roleRead}
      fallback={<PermissionDeniedFallback resourceLabel="permissions" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Permissions"
          description="Reference list of system permission codes by module. Permissions are seeded by the system and cannot be edited here."
        />

        {catalogQuery.isPending ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full max-w-xs" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : catalogQuery.isError ? (
          <p className="text-sm text-destructive">
            Could not load permissions.{" "}
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => void catalogQuery.refetch()}
            >
              Retry
            </Button>
          </p>
        ) : modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No permissions returned from the catalog.
          </p>
        ) : (
          <>
            <div className="flex max-w-xs flex-col gap-2">
              <Label htmlFor="permissions-module-filter">Module</Label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger
                  id="permissions-module-filter"
                  className="w-full"
                >
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MODULE_FILTER_ALL}>All modules</SelectItem>
                  {modules.map((key) => (
                    <SelectItem key={key} value={key}>
                      {formatPermissionModuleLabel(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {visibleModules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No module matches this filter.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleModules.map((moduleKey) => {
                  const items = byModule.get(moduleKey) ?? []

                  return (
                    <Collapsible
                      key={moduleKey}
                      defaultOpen
                      className="group rounded-lg border bg-card"
                    >
                      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/40 data-[state=open]:border-b">
                        <ChevronRightIcon
                          aria-hidden
                          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
                        />
                        <span>{formatPermissionModuleLabel(moduleKey)}</span>
                        <span className="font-normal text-muted-foreground">
                          ({items.length})
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-[min(40%,22rem)]">
                                Permission code
                              </TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="align-top font-mono text-xs">
                                  {item.code}
                                </TableCell>
                                <TableCell className="align-top text-muted-foreground">
                                  {item.name.trim() || "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </PermissionGate>
  )
}
