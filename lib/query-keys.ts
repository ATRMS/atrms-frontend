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
    },
  },

  masterData: {
    all: ["master-data"] as const,
    businessLinesRoot: () =>
      [...queryKeys.masterData.all, "business-lines"] as const,
    businessLinesLists: () =>
      [...queryKeys.masterData.businessLinesRoot(), "list"] as const,
    businessLinesRef: () =>
      [...queryKeys.masterData.businessLinesRoot(), "ref"] as const,
    taxTypesRoot: () => [...queryKeys.masterData.all, "tax-types"] as const,
    taxTypesLists: () =>
      [...queryKeys.masterData.taxTypesRoot(), "list"] as const,
    /** Reference list for resolving tax type labels (includes inactive rows). */
    taxTypesRef: () => [...queryKeys.masterData.taxTypesRoot(), "ref"] as const,
    regionsRoot: () => [...queryKeys.masterData.all, "regions"] as const,
    regionsLists: () =>
      [...queryKeys.masterData.regionsRoot(), "list"] as const,
    regionsRef: () => [...queryKeys.masterData.regionsRoot(), "ref"] as const,
    taxOfficesRoot: () => [...queryKeys.masterData.all, "tax-offices"] as const,
    taxOfficesLists: () =>
      [...queryKeys.masterData.taxOfficesRoot(), "list"] as const,
    taxOfficesRef: () =>
      [...queryKeys.masterData.taxOfficesRoot(), "ref"] as const,
    taxOfficesActiveRef: () =>
      [...queryKeys.masterData.taxOfficesRoot(), "ref-active"] as const,
    revenueTargetsRoot: () =>
      [...queryKeys.masterData.all, "revenue-targets"] as const,
    revenueTargetsLists: () =>
      [...queryKeys.masterData.revenueTargetsRoot(), "list"] as const,
    currenciesRoot: () => [...queryKeys.masterData.all, "currencies"] as const,
    currenciesLists: () =>
      [...queryKeys.masterData.currenciesRoot(), "list"] as const,
    currenciesRef: () =>
      [...queryKeys.masterData.currenciesRoot(), "ref"] as const,
    taxTypesActiveRef: () =>
      [...queryKeys.masterData.taxTypesRoot(), "ref-active"] as const,
    bankAccountsRoot: () =>
      [...queryKeys.masterData.all, "bank-accounts"] as const,
    bankAccountsLists: () =>
      [...queryKeys.masterData.bankAccountsRoot(), "list"] as const,
    organizationsRoot: () =>
      [...queryKeys.masterData.all, "organizations"] as const,
    organizationsLists: () =>
      [...queryKeys.masterData.organizationsRoot(), "list"] as const,
    /** Active organizations only (dropdowns, taxpayer profiles). */
    organizationsActiveRef: () =>
      [...queryKeys.masterData.organizationsRoot(), "ref-active"] as const,
    professionsRoot: () =>
      [...queryKeys.masterData.all, "professions"] as const,
    professionsLists: () =>
      [...queryKeys.masterData.professionsRoot(), "list"] as const,
    /** Active professions only (dropdowns, taxpayer profiles). */
    professionsActiveRef: () =>
      [...queryKeys.masterData.professionsRoot(), "ref-active"] as const,
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

  taxpayers: {
    all: ["taxpayers"] as const,
    tinRequestsRoot: () =>
      [...queryKeys.taxpayers.all, "tin-requests"] as const,
    tinRequestsLists: () =>
      [...queryKeys.taxpayers.tinRequestsRoot(), "list"] as const,
    individualsLists: () =>
      [...queryKeys.taxpayers.all, "individuals", "list"] as const,
    corporatesLists: () =>
      [...queryKeys.taxpayers.all, "corporates", "list"] as const,
    unifiedLists: () =>
      [...queryKeys.taxpayers.all, "unified", "list"] as const,
    taxpayerLookup: (tin: string) =>
      [...queryKeys.taxpayers.all, "lookup", tin] as const,
    taxpayerDetail: (id: string) =>
      [...queryKeys.taxpayers.all, "detail", id] as const,
    corporateTaxpayerDetail: (id: string) =>
      [...queryKeys.taxpayers.all, "corporate", "detail", id] as const,
  },

  users: {
    /** Every query scoped under users (broad invalidation). */
    all: ["users"] as const,

    /** All paginated user lists; `DataTable` appends `listParams` after this prefix. */
    lists: () => [...queryKeys.users.all, "list"] as const,

    /** One cached users list for a given API param object. */
    list: (params: ApiListParams) =>
      [...queryKeys.users.lists(), params] as const,

    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,

    transfers: (id: string) =>
      [...queryKeys.users.all, "transfers", id] as const,
  },
} as const
