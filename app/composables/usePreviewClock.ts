/**
 * 미리보기(폰/잠금화면) 컴포넌트용 현재 시각.
 * SSR/CSR hydration 불일치를 피하기 위해 onMounted(클라이언트)에서만 값을 채운다.
 */
export function usePreviewClock() {
  const time = ref('9:41')
  const dateLabel = ref('6월 6일 월요일')

  onMounted(() => {
    const d = new Date()
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
    time.value = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    dateLabel.value = `${d.getMonth() + 1}월 ${d.getDate()}일 ${weekday}요일`
  })

  return { time, dateLabel }
}
