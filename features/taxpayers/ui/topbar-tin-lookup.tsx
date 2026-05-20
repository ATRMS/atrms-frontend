"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2Icon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchTaxpayerLookupByTin } from "@/features/taxpayers/api/taxpayers-registry-api"
import { taxpayerRegistryProfileHref } from "@/features/taxpayers/columns/all-taxpayers.columns"
import { RegistryTaxpayerTypeBadge } from "@/features/taxpayers/lib/registry-taxpayer-display"
import { TaxpayerStatusBadge } from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import { PermissionGate } from "@/components/layout/permission-gate"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { useDebounce } from "@/hooks/useDebounce"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

function TopbarTinLookup() {
  const [open, setOpen] = useState(false)
  const [tin, setTin] = useState("")
  const debounced = useDebounce(tin, 350)
  const trimmed = debounced.trim()

  const { data, isFetching, isError, error, isSuccess } = useQuery({
    queryKey: queryKeys.taxpayers.taxpayerLookup(trimmed),
    queryFn: () => fetchTaxpayerLookupByTin(trimmed),
    enabled: open && trimmed.length >= 2,
    staleTime: 60_000,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            "relative flex w-full max-w-sm min-w-48 items-center gap-2 rounded-md border border-input bg-background px-2 shadow-xs",
            open && "ring-2 ring-ring"
          )}
        >
          <SearchIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search by TIN…"
            value={tin}
            onChange={(e) => {
              setTin(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
            aria-label="Search taxpayer by TIN"
            autoComplete="off"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="end"
        className="w-[min(100vw-2rem,20rem)]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {trimmed.length < 2 ? (
          <p className="text-xs text-muted-foreground">
            Enter at least 2 characters to look up a TIN.
          </p>
        ) : isFetching ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Searching…
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            {(error as Error)?.message ?? "Lookup failed."}
          </p>
        ) : isSuccess && data ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-medium">{data.tin}</span>
              <RegistryTaxpayerTypeBadge taxpayerType={data.taxpayerType} />
              <TaxpayerStatusBadge status={data.status} />
            </div>
            <p className="text-sm font-medium leading-snug">
              {data.displayName}
            </p>
            <Link
              href={taxpayerRegistryProfileHref(data)}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setOpen(false)}
            >
              View profile →
            </Link>
          </div>
        ) : isSuccess && data === null ? (
          <p className="text-sm text-muted-foreground">
            No taxpayer found for this TIN.
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export function TopbarTinLookupGate() {
  return (
    <PermissionGate permission={PermissionCodes.taxpayerRead}>
      <TopbarTinLookup />
    </PermissionGate>
  )
}
