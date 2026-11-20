export type ChannelType =
  | "BANK_BRANCH"
  | "PSP"
  | "POS"
  | "ONLINE"
  | "USSD"
  | "DIRECT_LODGEMENT"
export interface PaymentChannel {
  id: string
  code: string
  name: string
  channelType: ChannelType
  provider: string | null
  settlementAccountId: string
  isActive: boolean
}
