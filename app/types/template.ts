export interface KakaoTpl {
  id: string
  name: string
  type: 'basic' | 'extra' | 'auth'
  body: string
  extra?: string
  buttons: { type: string, label: string }[]
}

export interface EmailTpl {
  id: number
  name: string
  subject: string
  from: string
  heading: string
  body: string
  buttonLabel?: string
}

export interface RcsTpl {
  id: number
  name: string
  purpose?: 'info' | 'auth' | 'ad'
  msgType?: 'sms' | 'lms' | 'mms'
  deliveryType?: 'standalone' | 'conversation'
  fallback?: 'sms' | 'integrated'
  body?: string
  hasImage?: boolean
  buttons?: { type: string, label: string }[]
  expiry?: '40s' | '3m' | '1h' | '24h'
}
