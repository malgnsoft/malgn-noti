<script setup lang="ts">
// 카드 헤더 강조 비교 목업 (네비 비노출 · 방향 확정 후 폐기)
useHead({ title: '카드 헤더 강조 비교' })

const variants = [
  { id: 'v0', tag: '현재 적용됨', tone: 'neutral',
    name: 'V0 · 현행 (번호 제거 + 타이틀 15px/700)',
    note: '지금 라이브 상태. 비교 기준선.' },
  { id: 'a', tag: '추천', tone: 'success',
    name: 'A · 모노 eyebrow 라벨',
    note: '타이틀 위 mono·accent-ink eyebrow로 단계감 복원. 장식 없음, 시스템 정합 최상.' },
  { id: 'b', tag: '권장', tone: 'success',
    name: 'B · accent 좌측 바',
    note: '헤더 왼쪽 3px 그린 룰. single-accent 원칙과 부합. 활성 단계만 적용도 가능.' },
  { id: 'ab', tag: '추천 조합', tone: 'success',
    name: 'A + B · eyebrow + accent 바',
    note: '단계감 + 시선 유도 동시. 균형 가장 좋음.' },
  { id: 'd', tag: '대안', tone: 'warning',
    name: 'D · 활성 단계 dot',
    note: '현재 입력할 카드만 타이틀 앞 accent 점. 진행적 disclosure와 시너지.' },
  { id: 'f', tag: '권장', tone: 'success',
    name: 'F · 헤더↔바디 경계선 accent',
    note: '헤더와 바디 사이 구분선을 회색 1px → 그린 2px 유색 라인으로. 카드 전체가 단계로 묶여 보임.' },
  { id: 'c', tag: '구조 변경', tone: 'warning',
    name: 'C · 섹션 헤더를 카드 밖으로',
    note: '카드 위 H2(18px)+eyebrow, 카드 본문은 비움. 위계 최강이나 레이아웃 재배치 폭 큼.' },
  { id: 'e', tag: '약함', tone: 'error',
    name: 'E · 헤더 배경 톤',
    note: '헤더에 --paper 톤. 가장 약한 강조. "장식 최소"와 경계.' }
]
</script>

<template>
  <div class="app-container page-body">
    <header style="margin-bottom: 28px">
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-400); letter-spacing: 0.06em; text-transform: uppercase">
        DEV · 디자인 비교
      </div>
      <h1 style="font-size: 22px; font-weight: 700; color: var(--ink-900); margin: 6px 0 0">
        카드 헤더 강조 — 8개 변형 비교
      </h1>
      <p style="font-size: 13px; color: var(--ink-500); margin: 8px 0 0; max-width: 640px; display: block">
        같은 "발신 정보" 카드를 강조 방식만 바꿔 그렸습니다. 실제 main.css 토큰 사용.
        1개(또는 조합) 골라 알려 주시면 발송 6종 전체에 적용합니다.
      </p>
    </header>

    <div style="display: flex; flex-direction: column; gap: 22px">
      <section v-for="v in variants" :key="v.id">
        <div class="mk-bar">
          <span class="mk-name">{{ v.name }}</span>
          <AppBadge :tone="(v.tone as any)">{{ v.tag }}</AppBadge>
          <span class="mk-note">{{ v.note }}</span>
        </div>

        <!-- C: 섹션 헤더를 카드 밖으로 -->
        <template v-if="v.id === 'c'">
          <div class="c-eyebrow">
            STEP 1 · 발신
          </div>
          <h2 class="c-h2">
            발신 정보 <span class="required">*</span>
          </h2>
          <div class="card">
            <div class="card-body">
              <div class="form-row">
                <label>발신번호 <span class="required">*</span></label>
                <div class="field">
                  <select class="select" style="max-width: 280px"><option>1588-1234 (몰리몰리 대표)</option></select>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 나머지: 카드 헤더 변형 -->
        <div v-else class="card">
          <div
            class="card-header"
            :class="{
              'h-bar': v.id === 'b' || v.id === 'ab',
              'h-tint': v.id === 'e',
              'h-accent-divider': v.id === 'f',
            }"
          >
            <div style="display: flex; flex-direction: column; gap: 4px">
              <div v-if="v.id === 'a' || v.id === 'ab'" class="eyebrow">
                STEP 1 · 발신
              </div>
              <div class="title" style="display: flex; align-items: center; gap: 6px">
                <span v-if="v.id === 'd'" class="step-dot" />
                발신 정보 <span class="required">*</span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="form-row">
              <label>발신번호 <span class="required">*</span></label>
              <div class="field">
                <select class="select" style="max-width: 280px"><option>1588-1234 (몰리몰리 대표)</option></select>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mk-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
.mk-name { font-size: 13px; font-weight: 600; color: var(--ink-900); }
.mk-note { font-size: 12px; color: var(--ink-500); }

/* A: eyebrow */
.eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-ink);
}

/* B: accent 좌측 바 */
.h-bar {
  border-left: 3px solid var(--accent);
  padding-left: 17px; /* 20 - 3 보정 */
}

/* D: 활성 단계 dot */
.step-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

/* F: 헤더↔바디 경계선 accent */
.h-accent-divider { border-bottom: 2px solid var(--accent); }

/* E: 헤더 톤 */
.h-tint { background: var(--paper); }

/* C: 카드 밖 섹션 헤더 */
.c-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-ink);
  margin-bottom: 6px;
}
.c-h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink-900);
  letter-spacing: -0.01em;
  margin: 0 0 12px;
}
</style>
