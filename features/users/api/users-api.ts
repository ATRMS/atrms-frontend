import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  CreateUserPayload,
  CreateUserResponseData,
  PatchUserStatusPayload,
  ResetPasswordResponseData,
  TransferUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserListItem,
  UserTransferHistoryItem,
} from "@/features/users/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type UsersListParams = ApiListParams & {
  roleId?: string
  taxOfficeId?: string
  status?: string
}

export async function fetchUsersList(
  params: UsersListParams
): Promise<PaginatedListResponse<UserListItem>> {
  const res = await apiClient.get<PaginatedListResponse<UserListItem>>(
    apiPaths.users.collection,
    { params }
  )
  return res.data
}

export async function fetchUserById(id: string): Promise<UserDetail> {
  const res = await apiClient.get<ApiResponse<UserDetail>>(
    apiPaths.users.detail(id)
  )

  return unwrapApiPayload(res.data)
}

/** Result of creating a user (unwrapped `data` from the 201 envelope). */
export type CreateUserApiResult = CreateUserResponseData

export async function createUser(
  payload: CreateUserPayload
): Promise<CreateUserResponseData> {
  const res = await apiClient.post<ApiResponse<CreateUserResponseData>>(
    apiPaths.users.collection,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<UserDetail> {
  const res = await apiClient.patch<ApiResponse<UserDetail>>(
    apiPaths.users.detail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function resetUserPassword(
  userId: string
): Promise<ResetPasswordResponseData> {
  const res = await apiClient.post<ApiResponse<ResetPasswordResponseData>>(
    apiPaths.users.resetPassword(userId)
  )

  return unwrapApiPayload(res.data)
}

export async function patchUserStatus(
  userId: string,
  payload: PatchUserStatusPayload
): Promise<UserDetail> {
  const res = await apiClient.patch<ApiResponse<UserDetail>>(
    apiPaths.users.status(userId),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function fetchUserTransfers(
  userId: string
): Promise<UserTransferHistoryItem[]> {
  const res = await apiClient.get<ApiResponse<UserTransferHistoryItem[]>>(
    apiPaths.users.transfers(userId)
  )

  return unwrapApiPayload(res.data)
}

export async function createUserTransfer(
  userId: string,
  payload: TransferUserPayload
): Promise<void> {
  await apiClient.post(apiPaths.users.transfers(userId), payload)
}
