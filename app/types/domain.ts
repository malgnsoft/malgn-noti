export type Channel = 'sms' | 'rcs' | 'kakao' | 'email' | 'push'
export type DispatchKind = Channel | 'flow'

export const CHANNEL_LABELS: Record<Channel, string> = {
  sms: 'SMS/LMS/MMS',
  rcs: 'RCS',
  kakao: '알림톡/친구톡',
  email: '이메일',
  push: 'PUSH'
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  tenantId: string
  role: 'owner' | 'admin' | 'member'
}

export interface Tenant {
  id: string
  name: string
  creditBalance: number
}

export type DispatchStatus =
  | 'pending'
  | 'queued'
  | 'sending'
  | 'delivered'
  | 'failed'
  | 'canceled'
