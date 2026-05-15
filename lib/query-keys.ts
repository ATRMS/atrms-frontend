import type { ApiListParams } from "@/types/api"

/**
 * Hierarchical TanStack Query keys — factories keep prefixes stable so partial
 * invalidation matches intent (`admin.all` vs `users.lists()`, etc.).
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */
export const queryKeys = {
  admin: {
    all: ["admin"] as const,
    /**
     * Small reference lists for admin selects (filters, forms).
     * Add segments as master-data dropdowns grow.
     */
    referenceSelectOptions: {
      all: () => [...queryKeys.admin.all, "reference-select-options"] as const,
      roles: () =>
        [...queryKeys.admin.referenceSelectOptions.all(), "roles"] as const,
      taxOffices: () =>
        [
          ...queryKeys.admin.referenceSelectOptions.all(),
          "tax-offices",
        ] as const,
    },
  },

  roles: {
    all: ["roles"] as const,
    list: () => [...queryKeys.roles.all, "list"] as const,
    permissions: (roleId: string) =>
      [...queryKeys.roles.all, "permissions", roleId] as const,
  },

  permissions: {
    catalog: () => ["permissions", "catalog"] as const,
  },

  users: {
    /** Every query scoped under users (broad invalidation). */
    all: ["users"] as const,

    /** All paginated user lists; `DataTable` appends `listParams` after this prefix. */
    lists: () => [...queryKeys.users.all, "list"] as const,

    /** One cached users list for a given API param object. */
    list: (params: ApiListParams) =>
      [...queryKeys.users.lists(), params] as const,

    detail: (id: string) =>
      [...queryKeys.users.all, "detail", id] as const,

    transfers: (id: string) =>
      [...queryKeys.users.all, "transfers", id] as const,
  },
} as const
