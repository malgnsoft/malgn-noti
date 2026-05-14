import type { DispatchKind } from './domain'

// =============================================================================
// 발송 페이지 아키텍처 — DESIGN.md §14 참조
// =============================================================================

export type SenderKind =
  | { kind: 'phone-select' }                                    // SMS
  | { kind: 'profile-search' }                                  // 알림톡
  | { kind: 'brand-and-number' }                                // RCS
  | { kind: 'email-input'; readonlyWhenTemplated: boolean }     // 이메일
  | { kind: 'flow-select' }                                     // Flow

export type FieldId =
  | 'sender' | 'purpose' | 'sendType'
  | 'subject' | 'body' | 'ai' | 'attach'
  | 'buttons' | 'extra' | 'links'

export type CounterUnit = 'byte' | 'char'

export interface AttachRule {
  kind: 'image-only' | 'any'
  maxCount: number
  perFileBytes?: number
  totalBytes?: number
  resolution?: { maxW: number; maxH: number }
  allowedExts?: string[]
  bannedExts?: string[]
  maxFilenameLength?: number
}

export interface BodyVariant {
  fields: FieldId[]
  subject?: { counter: { unit: CounterUnit; max: number } }
  body?: { counter?: { unit: CounterUnit; max: number } }
  attach?: AttachRule
}

export type BodyVariantBy =
  | { kind: 'sms-type'; control: 'radio'; options: ('sms' | 'lms' | 'mms')[] }
  | { kind: 'kakao-message-type'; control: 'template-baked' }
  | {
      kind: 'rcs-3-stage'
      stages: [
        { label: 'messageType'; options: string[] },
        { label: 'deliveryType'; options: string[] },
        { label: 'fallbackType'; options: string[] },
      ]
    }

export interface ChannelMeta {
  id: DispatchKind
  label: string

  sender?: SenderKind                                            // PUSH는 없음
  template: { mode: 'optional' | 'required' }
  purpose: { mode: 'none' | '2-radio' | '3-radio' | 'static' | 'template-baked' }

  body: {
    variantBy?: BodyVariantBy
    variants: Record<string, BodyVariant>
    htmlStyle?: boolean
  }

  ai?: boolean

  // 치환자 패널은 template.mode='used' 또는 'required'일 때만 활성
  substitution?: 'individual-and-common'

  // 점진적 disclosure — prerequisites 충족 전 후속 카드는 안내로 대체
  prerequisites?: {
    recipient?: ('sender' | 'template')[]
    message?: ('sender' | 'template')[]
  }

  templateLockedFields?: FieldId[]
  templateBodyEdit?: 'readonly' | 'variable-only' | 'editable'

  payload?: {
    buttons?: { mode: 'readonly' | 'editable'; types: string[] }
    rcsExpiry?: boolean
    pushExtras?: ('media' | 'androidMedia' | 'iosMedia' | 'androidLargeIcon' | 'group')[]
    inputMode?: 'basic-or-json'
  }

  preview: 'imessage' | 'kakao' | 'rcs' | 'email-iframe' | 'android-and-ios' | 'none'

  adNotice?: 'sms-080' | 'email-unsubscribe-3opt'
  pricePerUnit: number

  recipientForm: {
    fields: ('alias' | 'phone' | 'email' | 'token' | 'pushType' | 'substitution')[]
    addressBook: {
      keyColumn: 'phone' | 'email' | 'token'
      rightPanel?: 'edit' | 'preview'
    }
  }
}

// =============================================================================
// 6채널 메타 정의
// =============================================================================

export const SMS_META: ChannelMeta = {
  id: 'sms',
  label: '문자메시지',
  sender: { kind: 'phone-select' },
  template: { mode: 'optional' },
  purpose: { mode: '3-radio' },
  body: {
    variantBy: { kind: 'sms-type', control: 'radio', options: ['sms', 'lms', 'mms'] },
    variants: {
      sms: {
        fields: ['body'],
        body: { counter: { unit: 'byte', max: 90 } },
      },
      lms: {
        fields: ['subject', 'body'],
        subject: { counter: { unit: 'byte', max: 40 } },
        body: { counter: { unit: 'byte', max: 2000 } },
      },
      mms: {
        fields: ['subject', 'body', 'attach'],
        subject: { counter: { unit: 'byte', max: 40 } },
        body: { counter: { unit: 'byte', max: 2000 } },
        attach: {
          kind: 'image-only',
          maxCount: 3,
          perFileBytes: 300_000,
          totalBytes: 800_000,
          resolution: { maxW: 1000, maxH: 1000 },
          allowedExts: ['jpg', 'jpeg'],
          maxFilenameLength: 45,
        },
      },
    },
  },
  ai: true,
  substitution: 'individual-and-common',
  templateLockedFields: ['sender', 'purpose', 'sendType', 'ai'],
  preview: 'imessage',
  adNotice: 'sms-080',
  pricePerUnit: 9.9,
  recipientForm: {
    fields: ['phone', 'alias', 'substitution'],
    addressBook: { keyColumn: 'phone' },
  },
}

export const KAKAO_META: ChannelMeta = {
  id: 'kakao',
  label: '알림톡',
  sender: { kind: 'profile-search' },
  template: { mode: 'required' },
  purpose: { mode: 'template-baked' },
  body: {
    variantBy: { kind: 'kakao-message-type', control: 'template-baked' },
    variants: {
      basic: { fields: ['body'] },
      extra: { fields: ['body', 'extra', 'links', 'buttons'] },
    },
  },
  substitution: 'individual-and-common',
  prerequisites: {
    recipient: ['sender', 'template'],
    message: ['sender', 'template'],
  },
  templateLockedFields: ['sender', 'purpose', 'sendType', 'attach', 'ai'],
  templateBodyEdit: 'variable-only',
  payload: {
    buttons: { mode: 'readonly', types: ['web', 'app', 'phone', 'message'] },
  },
  preview: 'kakao',
  pricePerUnit: 8.0,
  recipientForm: {
    fields: ['phone', 'alias', 'substitution'],
    addressBook: { keyColumn: 'phone', rightPanel: 'edit' },
  },
}

export const RCS_META: ChannelMeta = {
  id: 'rcs',
  label: 'RCS',
  sender: { kind: 'brand-and-number' },
  template: { mode: 'optional' },
  purpose: { mode: '3-radio' },
  body: {
    variantBy: {
      kind: 'rcs-3-stage',
      stages: [
        { label: 'messageType', options: ['SMS', 'MMS'] },
        { label: 'deliveryType', options: ['standalone'] },
        { label: 'fallbackType', options: ['SMS', 'unified-SMS'] },
      ],
    },
    variants: {
      default: {
        fields: ['body', 'buttons'],
        body: { counter: { unit: 'char', max: 100 } },
      },
    },
  },
  ai: true,
  substitution: 'individual-and-common',
  templateLockedFields: ['sender', 'purpose', 'sendType', 'ai'],
  templateBodyEdit: 'readonly',
  payload: {
    buttons: {
      mode: 'editable',
      types: ['chat', 'copy', 'call', 'mapShow', 'mapSearch', 'locationShare', 'url', 'calendar'],
    },
    rcsExpiry: true,
  },
  preview: 'rcs',
  pricePerUnit: 12.0,
  recipientForm: {
    fields: ['phone', 'alias', 'substitution'],
    addressBook: { keyColumn: 'phone', rightPanel: 'edit' },
  },
}

export const EMAIL_META: ChannelMeta = {
  id: 'email',
  label: '이메일',
  sender: { kind: 'email-input', readonlyWhenTemplated: true },
  template: { mode: 'optional' },
  purpose: { mode: '3-radio' },
  body: {
    variants: {
      default: {
        fields: ['subject', 'body', 'attach'],
        subject: { counter: { unit: 'char', max: 1000 } },
        attach: {
          kind: 'any',
          maxCount: 10,
          totalBytes: 30 * 1024 * 1024,
          bannedExts: ['.js', '.exe', '.bat', '.cmd', '.com', '.cpl', '.scr', '.vbs', '.wsr'],
          maxFilenameLength: 45,
        },
      },
    },
    htmlStyle: true,
  },
  ai: true,
  // §14.8 TBD-3 — 이메일 치환자 활성 여부 미확인, 잠정 활성
  substitution: 'individual-and-common',
  templateLockedFields: ['sender', 'purpose', 'subject', 'ai'],
  templateBodyEdit: 'readonly',
  preview: 'email-iframe',
  adNotice: 'email-unsubscribe-3opt',
  pricePerUnit: 0.65,
  recipientForm: {
    fields: ['email', 'alias'],
    addressBook: { keyColumn: 'email' },
  },
}

export const PUSH_META: ChannelMeta = {
  id: 'push',
  label: 'PUSH',
  // sender 없음 — PUSH는 토큰 기반, 발신 식별자는 발신 정보 메뉴에서 별도 관리(§14.8 TBD-6)
  template: { mode: 'optional' },
  purpose: { mode: '2-radio' },
  body: {
    variants: {
      default: {
        fields: ['subject', 'body'],
        subject: { counter: { unit: 'char', max: 60 } },
      },
    },
    htmlStyle: true,
  },
  // §14.8 TBD-3 — PUSH 치환자 활성 여부 미확인
  payload: {
    inputMode: 'basic-or-json',
    pushExtras: ['media', 'androidMedia', 'iosMedia', 'androidLargeIcon', 'group'],
    buttons: {
      mode: 'editable',
      types: ['reply', 'openApp', 'openUrl', 'close'],
    },
  },
  preview: 'android-and-ios',
  pricePerUnit: 0.0,
  recipientForm: {
    fields: ['token', 'alias', 'pushType'],
    addressBook: { keyColumn: 'token', rightPanel: 'preview' },
  },
}

export const FLOW_META: ChannelMeta = {
  id: 'flow',
  label: '복합(플로우)',
  sender: { kind: 'flow-select' },
  template: { mode: 'optional' },                    // 플로우 자체가 템플릿 역할
  purpose: { mode: 'static' },                       // 노드별 readonly
  body: {
    // Flow의 본문은 선택 노드의 ChannelMeta를 임베드 — 자체 variants는 형식만
    variants: {
      default: { fields: ['body'] },
    },
  },
  substitution: 'individual-and-common',
  prerequisites: {
    recipient: ['sender'],
    message: ['sender'],
  },
  preview: 'none',                                   // 노드별 폰 프리뷰 재사용
  pricePerUnit: 0,                                   // 노드 합산
  recipientForm: {
    fields: ['phone', 'alias', 'substitution'],
    addressBook: { keyColumn: 'phone' },
  },
}

export const CHANNEL_METAS: Record<DispatchKind, ChannelMeta> = {
  sms: SMS_META,
  kakao: KAKAO_META,
  rcs: RCS_META,
  email: EMAIL_META,
  push: PUSH_META,
  flow: FLOW_META,
}
