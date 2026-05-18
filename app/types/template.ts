export interface KakaoTpl {
  id: string
  name: string
  type: 'basic' | 'extra' | 'auth'
  body: string
  extra?: string
  buttons: { type: string, label: string }[]
}
