export type SignOffArea = "PARAMETERS" | "CITATIONS"
export interface SignOff {
  id: string
  area: SignOffArea
  signerName: string
  signerTitle: string
  signedOn: string
  notes: string | null
  recordedAt: string
  recordedBy: string
}
export interface SignOffStatus {
  area: SignOffArea
  signed: boolean
  latest: SignOff | null
}
export interface GoLiveCheck {
  date: string
  ready: boolean
  modules: { module: string; ready: boolean; missing: string[] }[]
  signOffs: SignOffStatus[]
}
