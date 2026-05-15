"use client"

import { useMemo, useState } from "react"

import type { PermissionCatalogItem } from "@/features/roles/types"
import {
  groupPermissionsByModule,
  sortedModuleKeys,
} from "@/features/roles/lib/group-permissions-by-module"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PermissionPickerPanelsProps = {
  catalog: PermissionCatalogItem[]
  selectedIds: Set<string>
  onSelectedIdsChange: (next: Set<string>) => void
  readOnly?: boolean
  className?: string
}

export function PermissionPickerPanels({
  catalog,
  selectedIds,
  onSelectedIdsChange,
  readOnly = false,
  className,
}: PermissionPickerPanelsProps) {
  const byModule = useMemo(() => groupPermissionsByModule(catalog), [catalog])
  const modules = useMemo(() => sortedModuleKeys(byModule), [byModule])

  const [pickedModule, setPickedModule] = useState<string | null>(null)

  const activeModule = useMemo(() => {
    if (!modules.length) return ""

    if (pickedModule && modules.includes(pickedModule)) {
      return pickedModule
    }

    return modules[0]
  }, [modules, pickedModule])

  const activePerms = byModule.get(activeModule) ?? []

  const summary = useMemo(() => {
    let moduleCount = 0

    for (const m of modules) {
      const list = byModule.get(m) ?? []

      if (list.some((p) => selectedIds.has(p.id))) {
        moduleCount += 1
      }
    }

    return { permissionCount: selectedIds.size, moduleCount }
  }, [byModule, modules, selectedIds])

  function toggle(id: string, checked: boolean) {
    if (readOnly) return

    const next = new Set(selectedIds)

    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }

    onSelectedIdsChange(next)
  }

  function selectAllInModule(mod: string) {
    if (readOnly) return

    const next = new Set(selectedIds)
    const list = byModule.get(mod) ?? []

    for (const p of list) {
      next.add(p.id)
    }

    onSelectedIdsChange(next)
  }

  function clearModule(mod: string) {
    if (readOnly) return

    const next = new Set(selectedIds)
    const list = byModule.get(mod) ?? []

    for (const p of list) {
      next.delete(p.id)
    }

    onSelectedIdsChange(next)
  }

  function moduleLabel(mod: string) {
    return mod.replaceAll("_", " ")
  }

  if (!catalog.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No permissions available to configure.
      </p>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid min-h-[min(24rem,60vh)] gap-4 md:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-2 md:max-h-[min(24rem,60vh)] md:overflow-y-auto">
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
            Module
          </p>
          {modules.map((mod) => {
            const list = byModule.get(mod) ?? []
            const sel = list.filter((p) => selectedIds.has(p.id)).length

            return (
              <button
                key={mod}
                type="button"
                onClick={() => setPickedModule(mod)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  activeModule === mod
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate">{moduleLabel(mod)}</span>
                <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                  {sel}/{list.length}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex min-h-0 flex-col gap-3 rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <h3 className="text-sm font-medium">{moduleLabel(activeModule)}</h3>
            {!readOnly ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => selectAllInModule(activeModule)}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => clearModule(activeModule)}
                >
                  Clear all
                </Button>
              </div>
            ) : null}
          </div>

          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto md:max-h-[min(20rem,50vh)]">
            {activePerms.map((p) => (
              <li key={p.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-sm",
                    readOnly && "cursor-default opacity-90"
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                    checked={selectedIds.has(p.id)}
                    disabled={readOnly}
                    onChange={(e) => toggle(p.id, e.target.checked)}
                  />
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                      {p.code}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {summary.permissionCount}
        </span>{" "}
        permission{summary.permissionCount === 1 ? "" : "s"} selected across{" "}
        <span className="font-medium text-foreground">
          {summary.moduleCount}
        </span>{" "}
        module{summary.moduleCount === 1 ? "" : "s"}
      </p>
    </div>
  )
}
