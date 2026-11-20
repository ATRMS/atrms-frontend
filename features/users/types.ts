/** Title options for officer profiles (epic user management). */
export const USER_TITLE_VALUES = [
  "Mr",
  "Mrs",
  "Miss",
  "Dr",
  "Prof",
  "Chief",
  "Alhaji",
  "Alhaja",
  "Engr",
  "Barr",
] as const

export type UserTitle = (typeof USER_TITLE_VALUES)[number]

/** Matches backend user lifecycle values (TASK-F303). */
export type UserAccountStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | "PENDING"

/** POST `/users` request body. */
export interface CreateUserPayload {
  email: string
  username: string
  firstName: string
  middleName?: string
  lastName: string
  title?: UserTitle
  phone?: string
  staffId?: string
  taxOfficeId?: string
  roleCode: string
}

/** Inner `data` from POST `/users` success envelope (`status` 201). */
export interface CreateUserResponseData {
  id: string
  email: string
  username: string
  temporaryPassword: string
}

/** PATCH `/users/:id` request body. */
export interface UpdateUserPayload {
  firstName: string
  middleName?: string
  lastName: string
  title?: UserTitle
  phone?: string
  staffId?: string
  taxOfficeId?: string
  roleCode: string
}

/** Row shape from GET `/users` list (paginated). */
export interface UserListItem {
  id: string
  email: string
  username: string
  title?: string | null
  firstName: string
  middleName?: string | null
  lastName: string
  phone?: string | null
  staffId?: string | null
  taxOfficeId?: string | null
  status: UserAccountStatus
  mustChangePassword?: boolean
  /** Role code from upstream (e.g. `ASSESSOR`). */
  role?: string | null
}

/** Single-user GET `/users/:id` — same core fields as list rows unless backend extends later. */
export type UserDetail = UserListItem

/** PATCH `/users/:id/status` body (lifecycle transitions). */
export interface PatchUserStatusPayload {
  status: UserAccountStatus
}

/** POST `/users/:id/transfers` body. */
export interface TransferUserPayload {
  toTaxOfficeId: string
  reason: string
  effectiveDate: string
}

/** Row from GET `/users/:id/transfers`. */
export interface UserTransferHistoryItem {
  id: string
  userId: string
  fromTaxOfficeId: string
  toTaxOfficeId: string
  reason: string
  effectiveDate: string
  transferredBy: string
  createdAt: string
}

/** Inner `data` from POST `/users/:id/reset-password`. */
export type ResetPasswordResponseData = Pick<
  CreateUserResponseData,
  "temporaryPassword"
>

/** Re-export for user forms / filters that depend on role metadata. */
export type { RoleOption } from "@/features/roles/types"

export interface TaxOfficeOption {
  id: string
  code: string
  name: string
  regionId: string
  address?: string | null
  phone?: string | null
  email?: string | null
  isActive: boolean
}
