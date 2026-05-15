"use client"

import { useEffect, useMemo, useState, type InputHTMLAttributes } from "react"
import { endOfDay, format, isValid, parseISO, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { useDebounce } from "@/hooks/useDebounce"
import type { ApiListParams } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export const DATA_TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export type DataTableSelectFilter = {
  type: "select"
  paramKey: string
  label?: string
  placeholder?: string
  widthClass?: string
  options: { value: string; label: string }[]
  emptyValue?: string
}

export type DataTableTextFilter = {
  type: "text"
  paramKey: string
  label?: string
  placeholder?: string
  widthClass?: string
  /** Debounce before syncing into the URL (ms). */
  debounceMs?: number
}

export type DataTableNumberFilter = {
  type: "number"
  paramKey: string
  label?: string
  placeholder?: string
  widthClass?: string
  debounceMs?: number
}

export type DataTableDateFilter = {
  type: "date"
  paramKey: string
  label?: string
  placeholder?: string
  widthClass?: string
  boundary: "startOfDay" | "endOfDay"
}

export type DataTableFilterConfig =
  | DataTableSelectFilter
  | DataTableTextFilter
  | DataTableNumberFilter
  | DataTableDateFilter

export type DataTableUrlState = {
  page: number
  size: number
  filterValues: Record<string, string>
}

export function parseDataTableUrlState(
  sp: URLSearchParams,
  filters: DataTableFilterConfig[],
  defaultPageSize: number
): DataTableUrlState {
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1)
  const sizeRaw = Number.parseInt(
    sp.get("size") ?? String(defaultPageSize),
    10
  )
  const size = DATA_TABLE_PAGE_SIZE_OPTIONS.includes(
    sizeRaw as (typeof DATA_TABLE_PAGE_SIZE_OPTIONS)[number]
  )
    ? sizeRaw
    : defaultPageSize

  const filterValues: Record<string, string> = {}
  for (const f of filters) {
    if (f.type === "select") {
      const empty = f.emptyValue ?? "__all__"
      filterValues[f.paramKey] = sp.get(f.paramKey) ?? empty
    } else {
      filterValues[f.paramKey] = sp.get(f.paramKey) ?? ""
    }
  }

  return { page, size, filterValues }
}

export function serializeDataTableUrlState(
  state: DataTableUrlState,
  filters: DataTableFilterConfig[],
  defaultPageSize: number
): string {
  const p = new URLSearchParams()

  if (state.page > 1) p.set("page", String(state.page))
  if (state.size !== defaultPageSize) p.set("size", String(state.size))

  for (const f of filters) {
    const v = state.filterValues[f.paramKey] ?? ""
    if (f.type === "select") {
      const empty = f.emptyValue ?? "__all__"
      if (v && v !== empty) p.set(f.paramKey, v)
    } else if (v.trim()) {
      p.set(f.paramKey, v.trim())
    }
  }

  return p.toString()
}

export function mergeDataTableListParams(
  page: number,
  size: number,
  filterValues: Record<string, string>,
  filters: DataTableFilterConfig[]
): ApiListParams {
  const params: ApiListParams = { page, size }

  for (const f of filters) {
    const raw = filterValues[f.paramKey]
    if (f.type === "select") {
      const empty = f.emptyValue ?? "__all__"
      const v = raw ?? empty
      if (v && v !== empty) params[f.paramKey] = v
    } else if (f.type === "number") {
      const v = raw?.trim() ?? ""
      if (!v) continue
      const n = Number(v)
      if (Number.isFinite(n)) params[f.paramKey] = n
    } else if (f.type === "text" || f.type === "date") {
      const v = raw?.trim() ?? ""
      if (v) params[f.paramKey] = v
    }
  }

  return params
}

export type DataTableFiltersProps = {
  filters: DataTableFilterConfig[]
  filterValues: Record<string, string>
  onFiltersPatch: (patch: Record<string, string>) => void
}

function parseIsoToDate(value: string): Date | undefined {
  if (!value.trim()) return undefined
  const d = parseISO(value)
  return isValid(d) ? d : undefined
}

function FilterDateInput({
  id,
  value,
  boundary,
  placeholder,
  widthClass,
  onChange,
}: {
  id: string
  value: string
  boundary: "startOfDay" | "endOfDay"
  placeholder: string
  widthClass?: string
  onChange: (iso: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = parseIsoToDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 justify-start px-3 text-left font-normal",
            widthClass ?? "w-[180px]",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4 opacity-60" />
          <span className="truncate">
            {selected ? format(selected, "PP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onChange("")
              return
            }
            const iso =
              boundary === "startOfDay"
                ? startOfDay(date).toISOString()
                : endOfDay(date).toISOString()
            onChange(iso)
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function DebouncedTextFilter({
  paramKey,
  value,
  placeholder,
  label,
  widthClass,
  debounceMs,
  inputMode,
  type,
  onFiltersPatch,
}: {
  paramKey: string
  value: string
  placeholder?: string
  label?: string
  widthClass?: string
  debounceMs: number
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"]
  type: "text" | "number"
  onFiltersPatch: DataTableFiltersProps["onFiltersPatch"]
}) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDraft(value)
    })
    return () => cancelAnimationFrame(id)
  }, [value])

  const debounced = useDebounce(draft, debounceMs)

  useEffect(() => {
    if (debounced !== draft) return
    if (debounced === value) return

    if (type === "number") {
      const trimmed = debounced.trim()
      if (trimmed === "") {
        onFiltersPatch({ [paramKey]: "" })
        return
      }
      const n = Number(trimmed)
      if (!Number.isFinite(n)) return
      onFiltersPatch({ [paramKey]: trimmed })
      return
    }

    onFiltersPatch({ [paramKey]: debounced })
  }, [
    debounced,
    draft,
    value,
    type,
    paramKey,
    onFiltersPatch,
  ])

  const inputType = type === "number" ? "number" : "search"

  return (
    <Input
      id={`dt-filter-${paramKey}`}
      type={inputType}
      inputMode={inputMode}
      autoComplete="off"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={placeholder ?? label}
      className={cn(widthClass ?? "sm:max-w-xs")}
      aria-label={label ?? placeholder ?? paramKey}
    />
  )
}

export function DataTableFilters({
  filters,
  filterValues,
  onFiltersPatch,
}: DataTableFiltersProps) {
  const patchOne = useMemo(
    () => (paramKey: string, next: string) => {
      onFiltersPatch({ [paramKey]: next })
    },
    [onFiltersPatch]
  )

  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const aria = f.label ?? f.placeholder ?? f.paramKey

        if (f.type === "select") {
          const empty = f.emptyValue ?? "__all__"
          const value = filterValues[f.paramKey] ?? empty

          return (
            <Select
              key={f.paramKey}
              value={value}
              onValueChange={(next) => patchOne(f.paramKey, next)}
            >
              <SelectTrigger
                className={f.widthClass ?? "w-[160px]"}
                aria-label={aria}
              >
                <SelectValue placeholder={f.placeholder ?? f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {f.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )
        }

        if (f.type === "text") {
          return (
            <DebouncedTextFilter
              key={f.paramKey}
              paramKey={f.paramKey}
              type="text"
              value={filterValues[f.paramKey] ?? ""}
              placeholder={f.placeholder}
              label={f.label}
              widthClass={f.widthClass}
              debounceMs={f.debounceMs ?? 300}
              onFiltersPatch={onFiltersPatch}
            />
          )
        }

        if (f.type === "number") {
          return (
            <DebouncedTextFilter
              key={f.paramKey}
              paramKey={f.paramKey}
              type="number"
              inputMode="numeric"
              value={filterValues[f.paramKey] ?? ""}
              placeholder={f.placeholder}
              label={f.label}
              widthClass={f.widthClass ?? "w-[120px]"}
              debounceMs={f.debounceMs ?? 400}
              onFiltersPatch={onFiltersPatch}
            />
          )
        }

        return (
          <FilterDateInput
            key={f.paramKey}
            id={`dt-filter-${f.paramKey}`}
            boundary={f.boundary}
            value={filterValues[f.paramKey] ?? ""}
            placeholder={f.placeholder ?? f.label ?? "Pick a date"}
            widthClass={f.widthClass}
            onChange={(iso) => patchOne(f.paramKey, iso)}
          />
        )
      })}
    </div>
  )
}
