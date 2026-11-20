"use client"

/* eslint-disable react-hooks/set-state-in-effect -- Popover open resets search input; async options hydrate trigger label from TanStack Query cache */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronDownIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"

export type AsyncCommandSelectOption = {
  value: string
  label: string
}

export type AsyncCommandSelectProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  "aria-invalid"?: boolean
  /** Debounce applied to the search string before `loadOptions` runs. */
  debounceMs?: number
  /** Prepended to `[debouncedSearch]` for TanStack Query cache identity. */
  queryKeyPrefix: readonly unknown[]
  loadOptions: (search: string) => Promise<AsyncCommandSelectOption[]>
  emptyText?: string
  loadingText?: string
  errorText?: string
  /** Optional trigger label when `value` is known but options have not loaded yet. */
  displayLabel?: string
}

export function AsyncCommandSelect({
  id,
  value,
  onValueChange,
  placeholder = "Select…",
  disabled,
  "aria-invalid": ariaInvalid,
  debounceMs = 300,
  queryKeyPrefix,
  loadOptions,
  emptyText = "No results.",
  loadingText = "Loading…",
  errorText = "Could not load options.",
  displayLabel,
}: AsyncCommandSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, debounceMs)

  const [pickedLabel, setPickedLabel] = useState<string | undefined>(undefined)

  const listQuery = useQuery({
    queryKey: [...queryKeyPrefix, debouncedSearch] as const,
    queryFn: () => loadOptions(debouncedSearch),
    placeholderData: keepPreviousData,
    enabled: open,
    staleTime: 30_000,
  })

  const options = useMemo(() => listQuery.data ?? [], [listQuery.data])

  const resolvedFromOptions = useMemo(
    () => options.find((o) => o.value === value)?.label,
    [options, value]
  )

  useEffect(() => {
    if (!open) return
    setSearch("")
  }, [open])

  useEffect(() => {
    if (!value) {
      setPickedLabel(undefined)
      return
    }
    const hit = options.find((o) => o.value === value)
    if (hit) setPickedLabel(hit.label)
  }, [value, options])

  const triggerLabel = displayLabel ?? pickedLabel ?? resolvedFromOptions

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          role="combobox"
          className={cn(
            "h-8 w-full justify-between rounded-lg border-input bg-transparent px-2.5 py-2 font-normal shadow-none hover:bg-transparent dark:bg-input/30 dark:hover:bg-input/50",
            !triggerLabel && "text-muted-foreground"
          )}
        >
          <span className="truncate">{triggerLabel ?? placeholder}</span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-[240px] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {listQuery.isError ? (
              <CommandEmpty>{errorText}</CommandEmpty>
            ) : listQuery.isFetching && options.length === 0 ? (
              <CommandEmpty>{loadingText}</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={`${opt.label} ${opt.value}`}
                      keywords={[opt.label, opt.value]}
                      data-checked={value === opt.value}
                      onSelect={() => {
                        onValueChange(opt.value)
                        setPickedLabel(opt.label)
                        setOpen(false)
                      }}
                    >
                      <span className="truncate">{opt.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
