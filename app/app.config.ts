export default defineAppConfig({
  ui: {
    // Relay-inspired 디자인 시스템 (design_handoff_malgn_noti 정본)
    // - ink 무채색 11단 ≈ Tailwind `zinc` → neutral
    // - Primary CTA = ink-900(near-black) → primary 도 zinc 계열
    //   그린 액센트(#00DC82)는 "절제 사용" 원칙상 Nuxt UI primary 가 아니라
    //   .btn-accent / bg-accent / var(--accent) 로 명시 적용한다.
    colors: {
      primary: 'zinc',
      neutral: 'zinc'
    }
  }
})
