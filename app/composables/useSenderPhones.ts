import type { SenderPhone } from '~/types/send'

/**
 * 발신번호 목록 로더 — GET /sender-phones (useApi).
 * 발송 폼의 발신번호 드롭다운 소스. 승인(`승인`)만 선택 가능.
 */
export function useSenderPhones() {
  const api = useApi()
  const phones = ref<SenderPhone[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    pending.value = true
    error.value = null
    try {
      const res = await api<{ data: SenderPhone[] }>('/sender-phones', {
        query: { limit: 100 },
      })
      phones.value = res.data
    }
    catch {
      error.value = '발신번호를 불러오지 못했습니다.'
      phones.value = []
    }
    finally {
      pending.value = false
    }
  }

  /** 발송 가능한(승인된) 발신번호만 */
  const approved = computed(() => phones.value.filter(p => p.approvalState === '승인'))

  return { phones, approved, pending, error, load }
}
