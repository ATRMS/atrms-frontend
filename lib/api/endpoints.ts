/**
 * Upstream REST paths relative to the API base URL (see `lib/config/env`).
 * Add route segments here—avoid scattering URL fragments across callers.
 */
export const apiPaths = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    changePassword: "/auth/change-password",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  languages: "/languages",
  users: {
    collection: "/users",
    detail: (id: string) => `/users/${encodeURIComponent(id)}` as const,
    resetPassword: (id: string) =>
      `/users/${encodeURIComponent(id)}/reset-password` as const,
    status: (id: string) => `/users/${encodeURIComponent(id)}/status` as const,
    transfers: (id: string) =>
      `/users/${encodeURIComponent(id)}/transfers` as const,
    language: "/users/me/language",
  },
  roles: {
    collection: "/roles",
    detail: (id: string) => `/roles/${encodeURIComponent(id)}` as const,
    permissions: (id: string) =>
      `/roles/${encodeURIComponent(id)}/permissions` as const,
  },
  permissions: {
    collection: "/permissions",
  },
  system: {
    settings: "/system/settings",
    testMail: "/system/settings/test-mail",
    testSms: "/system/settings/test-sms",
  },
  notificationTemplates: {
    collection: "/system/notification-templates",
    detail: (id: string) =>
      `/system/notification-templates/${encodeURIComponent(id)}` as const,
    status: (id: string) =>
      `/system/notification-templates/${encodeURIComponent(id)}/status` as const,
    preview: (id: string) =>
      `/system/notification-templates/${encodeURIComponent(id)}/preview` as const,
  },
  auditLogs: {
    collection: "/audit-logs",
    detail: (id: string) => `/audit-logs/${encodeURIComponent(id)}` as const,
  },
  public: {
    branding: "/public/branding",
  },
  reports: {
    available: "/reports",
  },
  workflow: {
    inbox: "/workflow/inbox",
    instance: (id: string) =>
      `/workflow/instances/${encodeURIComponent(id)}` as const,
  },
  taxpayers: {
    tinRequests: "/tin-requests",
    tinRequestApprove: (id: string) =>
      `/tin-requests/${encodeURIComponent(id)}/approve` as const,
    tinRequestReject: (id: string) =>
      `/tin-requests/${encodeURIComponent(id)}/reject` as const,
    collection: "/taxpayers",
    lookup: "/taxpayers/lookup",
    detail: (id: string) =>
      `/taxpayers/individuals/${encodeURIComponent(id)}` as const,
    corporateDetail: (id: string) =>
      `/taxpayers/corporates/${encodeURIComponent(id)}` as const,
    /** Canonical taxpayer resource (e.g. DELETE per epic). */
    resource: (id: string) => `/taxpayers/${encodeURIComponent(id)}` as const,
    status: (id: string) =>
      `/taxpayers/${encodeURIComponent(id)}/status` as const,
  },
  masterData: {
    lookups: "/master-data/lookups",
    authorityProfile: "/master-data/authority-profile",
    authorityBranding: (asset: string) =>
      `/master-data/authority-profile/branding/${encodeURIComponent(asset)}` as const,
    sectors: "/master-data/sectors",
    sectorDetail: (id: string) =>
      `/master-data/sectors/${encodeURIComponent(id)}` as const,
    sectorActivate: (id: string) =>
      `/master-data/sectors/${encodeURIComponent(id)}/activate` as const,
    sectorDeactivate: (id: string) =>
      `/master-data/sectors/${encodeURIComponent(id)}/deactivate` as const,
    stateAgencies: "/master-data/state-agencies",
    stateAgencyDetail: (id: string) =>
      `/master-data/state-agencies/${encodeURIComponent(id)}` as const,
    stateAgencyActivate: (id: string) =>
      `/master-data/state-agencies/${encodeURIComponent(id)}/activate` as const,
    stateAgencyDeactivate: (id: string) =>
      `/master-data/state-agencies/${encodeURIComponent(id)}/deactivate` as const,
    lgas: "/master-data/lgas",
    lgaDetail: (id: string) =>
      `/master-data/lgas/${encodeURIComponent(id)}` as const,
    lgaActivate: (id: string) =>
      `/master-data/lgas/${encodeURIComponent(id)}/activate` as const,
    lgaDeactivate: (id: string) =>
      `/master-data/lgas/${encodeURIComponent(id)}/deactivate` as const,
    revenueHeads: "/master-data/revenue-heads",
    revenueHeadDetail: (id: string) =>
      `/master-data/revenue-heads/${encodeURIComponent(id)}` as const,
    revenueHeadRates: (id: string) =>
      `/master-data/revenue-heads/${encodeURIComponent(id)}/rates` as const,
    revenueHeadRate: (id: string) =>
      `/master-data/revenue-heads/${encodeURIComponent(id)}/rate` as const,
    revenueHeadRateVersion: (id: string, version: number) =>
      `/master-data/revenue-heads/${encodeURIComponent(id)}/rates/${version}` as const,
    parameters: "/master-data/parameters",
    parameterDetail: (code: string) =>
      `/master-data/parameters/${encodeURIComponent(code)}` as const,
    parameterVersions: (code: string) =>
      `/master-data/parameters/${encodeURIComponent(code)}/versions` as const,
    parameterVersion: (code: string, version: number) =>
      `/master-data/parameters/${encodeURIComponent(code)}/versions/${version}` as const,
    goLiveCheck: "/master-data/go-live-check",
    goLiveSignoffs: "/master-data/go-live-signoffs",
    legalCitations: "/master-data/legal-citations",
    legalCitationDetail: (code: string) =>
      `/master-data/legal-citations/${encodeURIComponent(code)}` as const,
    legalCitationVersions: (code: string) =>
      `/master-data/legal-citations/${encodeURIComponent(code)}/versions` as const,
    legalCitationVersion: (code: string, version: number) =>
      `/master-data/legal-citations/${encodeURIComponent(code)}/versions/${version}` as const,
    paymentChannels: "/master-data/payment-channels",
    paymentChannelDetail: (id: string) =>
      `/master-data/payment-channels/${encodeURIComponent(id)}` as const,
    paymentChannelActivate: (id: string) =>
      `/master-data/payment-channels/${encodeURIComponent(id)}/activate` as const,
    paymentChannelDeactivate: (id: string) =>
      `/master-data/payment-channels/${encodeURIComponent(id)}/deactivate` as const,
    numberFormats: "/master-data/number-formats",
    numberFormatDetail: (code: string) =>
      `/master-data/number-formats/${encodeURIComponent(code)}` as const,
    events: "/master-data/events",
    eventDetail: (type: string) =>
      `/master-data/events/${encodeURIComponent(type)}` as const,
    eventBindings: (type: string) =>
      `/master-data/events/${encodeURIComponent(type)}/bindings` as const,
    eventBinding: (type: string, id: string) =>
      `/master-data/events/${encodeURIComponent(type)}/bindings/${encodeURIComponent(id)}` as const,
    reports: "/master-data/reports",
    reportDetail: (code: string) =>
      `/master-data/reports/${encodeURIComponent(code)}` as const,
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
    regionActivate: (id: string) =>
      `/master-data/regions/${encodeURIComponent(id)}/activate` as const,
    regionDeactivate: (id: string) =>
      `/master-data/regions/${encodeURIComponent(id)}/deactivate` as const,
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
    professions: "/master-data/professions",
    professionDetail: (id: string) =>
      `/master-data/professions/${encodeURIComponent(id)}` as const,
    professionActivate: (id: string) =>
      `/master-data/professions/${encodeURIComponent(id)}/activate` as const,
    professionDeactivate: (id: string) =>
      `/master-data/professions/${encodeURIComponent(id)}/deactivate` as const,
  },
} as const
