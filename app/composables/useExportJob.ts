import type { ExportJob } from '~/types/api'

export function useExportJob() {
  const api = useApi()
  const toast = useToast()

  async function request(resourceType: string, params: Record<string, unknown> = {}) {
    const job = await api<ExportJob>('/exports', {
      method: 'POST',
      body: { resourceType, params }
    })
    toast.add({
      title: '다운로드를 요청했습니다',
      description: '준비가 완료되면 알림으로 안내드립니다.',
      icon: 'i-lucide-download',
      color: 'primary'
    })
    return job
  }

  async function get(id: string) {
    return api<ExportJob>(`/exports/${id}`)
  }

  return { request, get }
}
