/**
 * Permission strings from the auth API / JWT `permissions` claim (`resource:action`).
 * Sync with `GET …/permissions` (or equivalent) — order follows backend modules.
 */
export const PermissionCodes = {
  // ASSESSMENT
  assessmentApprove: "assessment:approve",
  assessmentCancel: "assessment:cancel",
  assessmentCreate: "assessment:create",
  assessmentRead: "assessment:read",
  assessmentSendNotice: "assessment:send-notice",
  assessmentUpdate: "assessment:update",

  // AUDIT
  auditExport: "audit:export",
  auditRead: "audit:read",

  // MASTER_DATA
  masterDataRead: "master-data:read",
  masterDataWrite: "master-data:write",

  // PAYMENT
  paymentApprove: "payment:approve",
  paymentCreate: "payment:create",
  paymentLodge: "payment:lodge",
  paymentRead: "payment:read",
  paymentReverse: "payment:reverse",

  // REPORT
  reportExport: "report:export",
  reportGenerate: "report:generate",
  reportRead: "report:read",

  // ROLE
  roleCreate: "role:create",
  roleDelete: "role:delete",
  roleRead: "role:read",
  roleUpdate: "role:update",

  // SYSTEM
  systemConfig: "system:config",
  systemProvisionTenant: "system:provision-tenant",

  // TAXPAYER
  taxpayerApproveTin: "taxpayer:approve-tin",
  taxpayerCreate: "taxpayer:create",
  taxpayerDelete: "taxpayer:delete",
  taxpayerRead: "taxpayer:read",
  taxpayerUpdate: "taxpayer:update",

  // USER
  userCreate: "user:create",
  userDelete: "user:delete",
  userRead: "user:read",
  userResetPassword: "user:reset-password",
  userUpdate: "user:update",
} as const

export type PermissionCode =
  (typeof PermissionCodes)[keyof typeof PermissionCodes]

/** All codes above — 34 permissions from the permissions catalog API. */
export const ALL_PERMISSION_CODES = Object.values(
  PermissionCodes
) as PermissionCode[]
