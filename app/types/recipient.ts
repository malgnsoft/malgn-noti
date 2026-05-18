export interface Recipient {
  id: number | string
  name?: string
  phone?: string
  email?: string
  token?: string
  vars?: Record<string, string>
}
