import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  BankAccountCreatePayload,
  BankAccountListItem,
  BankAccountUpdatePayload,
} from "@/features/bank-accounts/types"
import type { ApiResponse } from "@/types/api"

export type BankAccountsListParams = {
  taxTypeId?: string
  revenueHeadId?: string
  isActive?: boolean
}

function normalizeListParams(
  params: BankAccountsListParams | undefined
): Record<string, unknown> {
  if (!params) return {}
  const q: Record<string, unknown> = {}
  if (params.taxTypeId) q.taxTypeId = params.taxTypeId
  if (params.revenueHeadId) q.revenueHeadId = params.revenueHeadId
  if (params.isActive !== undefined) q.isActive = params.isActive
  return q
}

export async function fetchBankAccountsList(
  params?: BankAccountsListParams
): Promise<ApiResponse<BankAccountListItem[]>> {
  const res = await apiClient.get<ApiResponse<BankAccountListItem[]>>(
    apiPaths.masterData.bankAccounts,
    { params: normalizeListParams(params) }
  )

  return res.data
}

export async function createBankAccount(
  payload: BankAccountCreatePayload
): Promise<string> {
  const res = await apiClient.post<ApiResponse<string>>(
    apiPaths.masterData.bankAccounts,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateBankAccount(
  id: string,
  payload: BankAccountUpdatePayload
): Promise<BankAccountListItem> {
  const res = await apiClient.put<ApiResponse<BankAccountListItem>>(
    apiPaths.masterData.bankAccountDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function activateBankAccount(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.bankAccountActivate(id))
}

export async function deactivateBankAccount(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.bankAccountDeactivate(id))
}
