export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type ExportJobStatus = 'pending' | 'running' | 'ready' | 'failed' | 'expired'

export interface ExportJob {
  id: string
  status: ExportJobStatus
  resourceType: string
  requestedAt: string
  readyAt?: string
  downloadUrl?: string
}
