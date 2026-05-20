// 페이지 스크롤을 보존하면서 body를 잠그는 공용 유틸.
// 모달이 중첩되어도 최초 lock 호출만 body 상태를 변경하도록 카운터로 관리.
//
// 동작 원리: body를 `position: fixed; top: -savedY` 로 만들어 시각적으로 제자리에 머무르게 한 뒤,
// 해제 시 원래 스크롤 위치로 복귀. html에 zoom(--ui-scale)이 걸려 있을 수 있어 top 값을 zoom으로 나눠
// 최종 시각 오프셋이 정확히 savedY가 되도록 보정한다.

let lockCount = 0
let savedY = 0

function getUiScale(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--ui-scale').trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export function lockScroll() {
  if (typeof window === 'undefined') return
  if (lockCount === 0) {
    savedY = window.scrollY || document.documentElement.scrollTop || 0
    const z = getUiScale()
    const b = document.body.style
    b.position = 'fixed'
    b.top = `-${savedY / z}px`
    b.left = '0'
    b.right = '0'
    b.width = '100%'
  }
  lockCount++
}

export function unlockScroll() {
  if (typeof window === 'undefined') return
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    const b = document.body.style
    b.position = ''
    b.top = ''
    b.left = ''
    b.right = ''
    b.width = ''
    window.scrollTo(0, savedY)
  }
}
