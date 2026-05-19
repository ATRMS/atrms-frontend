/**
 * Upstream REST paths relative to the API base URL (see `lib/config/env`).
 * Add route segments here—avoid scattering URL fragments across callers.
 */
export const apiPaths = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  users: {
    collection: "/users",
    detail: (id: string) =>
      `/users/${encodeURIComponent(id)}` as const,
    resetPassword: (id: string) =>
      `/users/${encodeURIComponent(id)}/reset-password` as const,
    status: (id: string) =>
      `/users/${encodeURIComponent(id)}/status` as const,
    transfers: (id: string) =>
      `/users/${encodeURIComponent(id)}/transfers` as const,
  },
  roles: {
    collection: "/roles",
    detail: (id: string) =>
      `/roles/${encodeURIComponent(id)}` as const,
    permissions: (id: string) =>
      `/roles/${encodeURIComponent(id)}/permissions` as const,
  },
  permissions: {
    collection: "/permissions",
  },
  masterData: {
    taxOffices: "/master-data/tax-offices",
    taxOfficeDetail: (id: string) =>
      `/master-data/tax-offices/${encodeURIComponent(id)}` as const,
    taxOfficeActivate: (id: string) =>
      `/master-data/tax-offices/${encodeURIComponent(id)}/activate` as const,
    taxOfficeDeactivate: (id: string) =>
      `/master-data/tax-offices/${encodeURIComponent(id)}/deactivate` as const,
    businessLines: "/master-data/business-lines",
    businessLineDetail: (id: string) =>
      `/master-data/business-lines/${encodeURIComponent(id)}` as const,
    businessLineActivate: (id: string) =>
      `/master-data/business-lines/${encodeURIComponent(id)}/activate` as const,
    businessLineDeactivate: (id: string) =>
      `/master-data/business-lines/${encodeURIComponent(id)}/deactivate` as const,
    taxTypes: "/master-data/tax-types",
    taxTypeDetail: (id: string) =>
      `/master-data/tax-types/${encodeURIComponent(id)}` as const,
    taxTypeActivate: (id: string) =>
      `/master-data/tax-types/${encodeURIComponent(id)}/activate` as const,
    taxTypeDeactivate: (id: string) =>
      `/master-data/tax-types/${encodeURIComponent(id)}/deactivate` as const,
    regions: "/master-data/regions",
    regionDetail: (id: string) =>
      `/master-data/regions/${encodeURIComponent(id)}` as const,
    revenueTargets: "/master-data/revenue-targets",
    revenueTargetDetail: (id: string) =>
      `/master-data/revenue-targets/${encodeURIComponent(id)}` as const,
    currencies: "/master-data/currencies",
    currencyDetail: (id: string) =>
      `/master-data/currencies/${encodeURIComponent(id)}` as const,
    currencySetDefault: (id: string) =>
      `/master-data/currencies/${encodeURIComponent(id)}/set-default` as const,
    bankAccounts: "/master-data/bank-accounts",
    bankAccountDetail: (id: string) =>
      `/master-data/bank-accounts/${encodeURIComponent(id)}` as const,
    bankAccountActivate: (id: string) =>
      `/master-data/bank-accounts/${encodeURIComponent(id)}/activate` as const,
    bankAccountDeactivate: (id: string) =>
      `/master-data/bank-accounts/${encodeURIComponent(id)}/deactivate` as const,
    organizations: "/master-data/organizations",
    organizationDetail: (id: string) =>
      `/master-data/organizations/${encodeURIComponent(id)}` as const,
    organizationActivate: (id: string) =>
      `/master-data/organizations/${encodeURIComponent(id)}/activate` as const,
    organizationDeactivate: (id: string) =>
      `/master-data/organizations/${encodeURIComponent(id)}/deactivate` as const,
    professions: "/master-data/professions",
    professionDetail: (id: string) =>
      `/master-data/professions/${encodeURIComponent(id)}` as const,
    professionActivate: (id: string) =>
      `/master-data/professions/${encodeURIComponent(id)}/activate` as const,
    professionDeactivate: (id: string) =>
      `/master-data/professions/${encodeURIComponent(id)}/deactivate` as const,
  },
} as const
