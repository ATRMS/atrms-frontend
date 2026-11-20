import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type { InboxItem, WorkflowInstance } from "@/features/workflow/types"
import type {
  ApiResponse,
  PaginatedListResponse,
  PageParams,
} from "@/types/api"

export async function fetchWorkflowInbox(
  params: PageParams
): Promise<PaginatedListResponse<InboxItem>> {
  return (
    await apiClient.get<PaginatedListResponse<InboxItem>>(
      apiPaths.workflow.inbox,
      { params }
    )
  ).data
}
export async function fetchWorkflowInstance(
  id: string
): Promise<WorkflowInstance> {
  return unwrapApiPayload(
    (
      await apiClient.get<ApiResponse<WorkflowInstance>>(
        apiPaths.workflow.instance(id)
      )
    ).data
  )
}
export async function runWorkflowAction(
  path: string,
  remarks?: string
): Promise<void> {
  await apiClient.post(path, remarks ? { remarks } : {})
}
