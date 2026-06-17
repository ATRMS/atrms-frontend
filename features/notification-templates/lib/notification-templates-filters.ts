import type { DataTableFilterConfig } from "@/components/data-table/data-table-filters"

export const notificationTemplateFilters: DataTableFilterConfig[] = [
  {
    type: "select",
    paramKey: "channel",
    label: "Channel",
    widthClass: "w-[160px]",
    options: [
      { value: "__all__", label: "All channels" },
      { value: "EMAIL", label: "Email" },
      { value: "SMS", label: "SMS" },
    ],
  },
]
