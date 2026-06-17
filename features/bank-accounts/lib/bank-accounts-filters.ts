import type { DataTableFilterConfig } from "@/components/data-table/data-table-filters"
import type { BankAccountsListParams } from "@/features/bank-accounts/api/bank-accounts-api"
import { dataTableSelectFilterValue } from "@/components/data-table/data-table-filters"

const STATUS_FILTER_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const

export function bankAccountFilters(
  taxTypeOptions: { id: string; code: string; name: string }[]
): DataTableFilterConfig[] {
  return [
    {
      type: "select",
      paramKey: "taxTypeId",
      label: "Tax type",
      widthClass: "w-[220px]",
      options: [
        { value: "__all__", label: "All tax types" },
        ...taxTypeOptions.map((t) => ({
          value: t.id,
          label: `${t.code} — ${t.name}`,
        })),
      ],
    },
    {
      type: "select",
      paramKey: "isActive",
      label: "Status",
      widthClass: "w-[160px]",
      options: [...STATUS_FILTER_OPTIONS],
    },
  ]
}

export function bankAccountsListParamsFromFilters(
  filterValues: Record<string, string>
): BankAccountsListParams {
  const taxTypeId = dataTableSelectFilterValue(filterValues, "taxTypeId")
  const status = dataTableSelectFilterValue(filterValues, "isActive")

  let isActive: boolean | undefined
  if (status === "true") isActive = true
  else if (status === "false") isActive = false

  return {
    ...(taxTypeId ? { taxTypeId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  }
}
