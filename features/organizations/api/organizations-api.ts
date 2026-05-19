import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  OrganizationCreatePayload,
  OrganizationListItem,
  OrganizationUpdatePayload,
} from "@/features/organizations/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type OrganizationsListParams = ApiListParams & {
  isActive?: boolean | string
  taxOfficeId?: string
  businessLineId?: string
}

function normalizeOrganizationsRequestParams(
  params: OrganizationsListParams
): ApiListParams & {
  isActive?: boolean
  taxOfficeId?: string
  businessLineId?: string
} {
  const {
    isActive: raw,
    taxOfficeId: toRaw,
    businessLineId: blRaw,
    ...rest
  } = params

  let isActive: boolean | undefined
  if (typeof raw === "boolean") {
    isActive = raw
  } else if (raw === "true") {
    isActive = true
  } else if (raw === "false") {
    isActive = false
  }

  const taxOfficeId =
    typeof toRaw === "string" ? toRaw.trim() : undefined

  const businessLineId =
    typeof blRaw === "string" ? blRaw.trim() : undefined

  return {
    ...rest,
    ...(taxOfficeId ? { taxOfficeId } : {}),
    ...(businessLineId ? { businessLineId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  }
}

export async function fetchOrganizationsList(
  params: OrganizationsListParams
): Promise<PaginatedListResponse<OrganizationListItem>> {
  const res = await apiClient.get<
    PaginatedListResponse<OrganizationListItem>
  >(apiPaths.masterData.organizations, {
    params: normalizeOrganizationsRequestParams(params),
  })

  return res.data
}

export async function createOrganization(
  payload: OrganizationCreatePayload
): Promise<OrganizationListItem> {
  const res = await apiClient.post<ApiResponse<OrganizationListItem>>(
    apiPaths.masterData.organizations,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateOrganization(
  id: string,
  payload: OrganizationUpdatePayload
): Promise<OrganizationListItem> {
  const res = await apiClient.put<ApiResponse<OrganizationListItem>>(
    apiPaths.masterData.organizationDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function activateOrganization(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.organizationActivate(id))
}

export async function deactivateOrganization(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.organizationDeactivate(id))
}
