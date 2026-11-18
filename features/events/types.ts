export type Audience =
  | "MAKER"
  | "STEP_APPROVERS"
  | "TAXPAYER"
  | `ROLE:${string}`
export interface Binding {
  id: string
  eventType: string
  templateCode: string
  audience: Audience
  channel: "EMAIL" | "SMS"
  enabled: boolean
}
export interface EventType {
  type: string
  description: string
  topic: string
  version: number
  enabled: boolean
  bindings: Binding[]
}
export interface Catalogue {
  events: EventType[]
  backlog: { topic: string; pending: number; parked: number }[]
}
