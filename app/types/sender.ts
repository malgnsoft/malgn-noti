export type ApprovalStatus = '승인' | '심사중' | '반려' | '대기'

export interface SenderNumber {
  id: string
  type: string
  number: string
  status: ApprovalStatus
  requestedAt: string
  approvedAt: string
}

/** 등록 마법사가 발행하는 신규 발신 번호 (id는 페이지에서 부여) */
export type SenderRegisterResult = Omit<SenderNumber, 'id'>
