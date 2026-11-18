export type VersionStatus = "PROPOSED" | "RETURNED" | "APPROVED" | "REJECTED"
export type WorkflowAction = "submit" | "finalize" | "return" | "reject"
export interface InboxItem {
  instanceId: string
  workflowCode: string
  workflowName: string
  entityType: string
  entityId: string
  entityReference: string
  state: "PENDING"
  level: number
  dueAt: string | null
  overdue: boolean
  makerId: string
  makerName: string
  submittedAt: string
}
export interface WorkflowHistoryItem {
  actorName: string
  action: string
  fromState: string
  toState: string
  level: number
  remarks: string | null
  actedAt: string
}
export interface WorkflowInstance {
  id: string
  history: WorkflowHistoryItem[]
}
