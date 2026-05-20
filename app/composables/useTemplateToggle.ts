import type { Ref } from 'vue'

export interface TemplateToggleOptions<T> {
  /** '템플릿 사용유무' 상태 ('off' | 'on') */
  state: Ref<'off' | 'on'>
  /** 현재(off 모드) 메시지 설정 스냅샷을 캡처 */
  capture: () => T
  /** 스냅샷으로 메시지 설정을 복원 */
  restore: (snapshot: T) => void
  /** 메시지 설정 + 선택된 템플릿을 초기화 (수신자·치환자·발송설정은 제외) */
  reset: () => void
  /** 토글 직후 호출 (토스트 등) */
  onToggle?: (to: 'off' | 'on') => void
}

/**
 * 발송 페이지의 "템플릿 사용유무" 토글 동작.
 *
 * - off → on (사용): 현재(off 모드) 메시지 설정을 보관하고, 메시지 설정 + 템플릿을 초기화한다.
 * - on → off (사용 안 함): 템플릿을 해제하고, 보관해 둔 off 모드 메시지 설정을 복원한다.
 *
 * 수신자 목록·치환자 값은 이 토글에서 절대 건드리지 않는다(페이지에서 항상 유지).
 * 치환자 입력 칸의 표시/숨김은 페이지의 computed(예: showSubst)가 담당한다.
 */
export function useTemplateToggle<T>(opts: TemplateToggleOptions<T>) {
  // off 모드에서 직접 작성한 메시지 설정 보관함
  const offSnapshot = shallowRef<T | null>(null)
  const suppressed = ref(false)

  watch(opts.state, (to) => {
    if (suppressed.value) return
    if (to === 'on') {
      // 사용: off 모드 내용을 보관하고 메시지 설정 + 템플릿 초기화
      offSnapshot.value = opts.capture()
      opts.reset()
    }
    else {
      // 사용 안 함: 템플릿 해제 후 보관해 둔 off 모드 내용 복원
      opts.reset()
      if (offSnapshot.value !== null) opts.restore(offSnapshot.value)
    }
    opts.onToggle?.(to)
  }, { flush: 'sync' })

  /** watch를 트리거하지 않고 상태만 바꾼다 (전체 초기화 등에서 사용). */
  function setSilently(to: 'off' | 'on') {
    suppressed.value = true
    opts.state.value = to
    suppressed.value = false
  }

  return { setSilently }
}
