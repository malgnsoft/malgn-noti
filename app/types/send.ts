/**
 * 발송(/send/*) 도메인 타입 — malgn-noti-api `src/routes/send.ts` 형상과 일치.
 */

export type SendPurpose = 'info' | 'auth' | 'ad'
export type SmsSendType = 'sms' | 'lms' | 'mms'

/** 발신번호 (GET /sender-phones — TB_SENDER_PHONE row) */
export type SenderPhoneApprovalState = '대기' | '심사중' | '승인' | '반려'

export interface SenderPhone {
  id: number
  companyId: number
  number: string
  type?: string | null
  approvalState: SenderPhoneApprovalState
  status: number
  rejectReason?: string | null
  requestedAt: string
  approvedAt?: string | null
  createdAt: string
  deletedAt?: string | null
}

/** POST /send/sms 수신자 항목 */
export interface SmsSendRecipient {
  name?: string
  phone: string
  vars?: Record<string, string>
}

/** POST /send/sms 요청 body (`smsBody`) */
export interface SmsSendRequest {
  senderPhoneId: number
  purpose: SendPurpose
  subject?: string
  body: string
  smsType?: SmsSendType
  hasAttachment: boolean
  recipients: SmsSendRecipient[]
}

/** POST /send/sms 201 응답 data */
export interface SmsSendResult {
  dispatchRequestId: number
  createdAt: string
  dispatchState: string
  channel: 'sms'
  smsType: SmsSendType
  recipientCount: number
  optoutFiltered: number
  unitPrice: number
  totalCredit: number
  idempotent: boolean
  note?: string
}
