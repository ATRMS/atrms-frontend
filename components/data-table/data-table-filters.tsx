"use client"

import { useEffect, useMemo, useState, type InputHTMLAttributes } from "react"
import { endOfDay, format, isValid, parseISO, startOfDay } from "date-fns"
import { CalendarIcon, SearchIcon } from "lucide-react"

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

export type DataTableSearchFilter = {
  type: "search"
  /**
   * Query param forwarded to list APIs that support search (see `PageParams.search`).
   * Defaults to `"search"`.
   */
  paramKey?: string
  label?: string
  placeholder?: string
  widthClass?: string
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
  | DataTableSearchFilter
  | DataTableNumberFilter
  | DataTableDateFilter

/** Resolved URL/API param name for a filter row (search defaults to `search`). */
export function dataTableFilterParamKey(f: DataTableFilterConfig): string {
  if (f.type === "search") return f.paramKey ?? "search"
  return f.paramKey
}

export type DataTableUrlState = {
  page: number
  size: number
  filterValues: Record<string, string>
}

/** Default filter values for client-state lists (no URL sync). */
export function createDataTableFilterDefaults(
  filters: DataTableFilterConfig[]
): Record<string, string> {
  const filterValues: Record<string, string> = {}
  for (const f of filters) {
    if (f.type === "select") {
      filterValues[f.paramKey] = f.emptyValue ?? "__all__"
    } else {
      filterValues[dataTableFilterParamKey(f)] = ""
    }
  }
  return filterValues
}

/** Read filter values from the URL (no page/size). */
export function parseBasicDataTableFilterUrlState(
  sp: URLSearchParams,
  filters: DataTableFilterConfig[]
): Record<string, string> {
  return parseDataTableUrlState(sp, filters, DATA_TABLE_PAGE_SIZE_OPTIONS[0])
    .filterValues
}

/** Write filter values to the URL (omits default page/size). */
export function serializeBasicDataTableFilterUrlState(
  filterValues: Record<string, string>,
  filters: DataTableFilterConfig[]
): string {
  return serializeDataTableUrlState(
    {
      page: 1,
      size: DATA_TABLE_PAGE_SIZE_OPTIONS[0],
      filterValues,
    },
    filters,
    DATA_TABLE_PAGE_SIZE_OPTIONS[0]
  )
}

/** Resolved select value when building API params (`undefined` = no filter). */
export function dataTableSelectFilterValue(
  filterValues: Record<string, string>,
  paramKey: string,
  emptyValue = "__all__"
): string | undefined {
  const v = filterValues[paramKey] ?? emptyValue
  return v && v !== emptyValue ? v : undefined
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
      const pk = dataTableFilterParamKey(f)
      filterValues[pk] = sp.get(pk) ?? ""
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
    const pk = dataTableFilterParamKey(f)
    const v = state.filterValues[pk] ?? ""
    if (f.type === "select") {
      const empty = f.emptyValue ?? "__all__"
      if (v && v !== empty) p.set(f.paramKey, v)
    } else if (v.trim()) {
      p.set(pk, v.trim())
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
    const pk = dataTableFilterParamKey(f)
    const raw = filterValues[pk]
    if (f.type === "select") {
      const empty = f.emptyValue ?? "__all__"
      const v = raw ?? empty
      if (v && v !== empty) params[f.paramKey] = v
    } else if (f.type === "number") {
      const v = raw?.trim() ?? ""
      if (!v) continue
      const n = Number(v)
      if (Number.isFinite(n)) params[pk] = n
    } else if (
      f.type === "text" ||
      f.type === "search" ||
      f.type === "date"
    ) {
      const v = raw?.trim() ?? ""
      if (v) params[pk] = v
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
  inputClassName,
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
  inputClassName?: string
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
      className={cn(widthClass ?? "sm:max-w-xs", inputClassName)}
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

  const DEBOUNCE_MS = 500

  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const aria = f.label ?? f.placeholder ?? dataTableFilterParamKey(f)

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
                className={cn(f.widthClass ?? "w-[160px]", "py-1")}
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
          const pk = dataTableFilterParamKey(f)
          return (
            <DebouncedTextFilter
              key={pk}
              paramKey={pk}
              type="text"
              value={filterValues[pk] ?? ""}
              placeholder={f.placeholder}
              label={f.label}
              widthClass={f.widthClass}
              debounceMs={f.debounceMs ?? DEBOUNCE_MS}
              onFiltersPatch={onFiltersPatch}
            />
          )
        }

        if (f.type === "search") {
          const pk = dataTableFilterParamKey(f)
          return (
            <div key={pk} className="relative min-w-[300px]">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <DebouncedTextFilter
                paramKey={pk}
                type="text"
                value={filterValues[pk] ?? ""}
                placeholder={f.placeholder ?? "Search…"}
                label={f.label ?? "Search"}
                inputClassName="h-9 w-full pl-9"
                debounceMs={f.debounceMs ?? DEBOUNCE_MS}
                onFiltersPatch={onFiltersPatch}
              />
            </div>
          )
        }

        if (f.type === "number") {
          const pk = dataTableFilterParamKey(f)
          return (
            <DebouncedTextFilter
              key={pk}
              paramKey={pk}
              type="number"
              inputMode="numeric"
              value={filterValues[pk] ?? ""}
              placeholder={f.placeholder}
              label={f.label}
              widthClass={f.widthClass ?? "w-[120px]"}
              debounceMs={f.debounceMs ?? 400}
              onFiltersPatch={onFiltersPatch}
            />
          )
        }

        if (f.type === "date") {
          const pk = dataTableFilterParamKey(f)
          return (
            <FilterDateInput
              key={pk}
              id={`dt-filter-${pk}`}
              boundary={f.boundary}
              value={filterValues[pk] ?? ""}
              placeholder={f.placeholder ?? f.label ?? "Pick a date"}
              widthClass={f.widthClass}
              onChange={(iso) => patchOne(pk, iso)}
            />
          )
        }

        return null
      })}
    </div>
  )
}
