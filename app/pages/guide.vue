<script setup lang="ts">
useHead({ title: '디자인 가이드' })
const toast = useToast()

const sections = [
  { id: 'intro', label: '소개' },
  { id: 'principles', label: '01 디자인 원칙' },
  { id: 'colors', label: '02 컬러 시스템' },
  { id: 'typography', label: '03 타이포그래피' },
  { id: 'spacing', label: '04 간격' },
  { id: 'radius', label: '05 라운드 · 그림자' },
  { id: 'buttons', label: '06 버튼' },
  { id: 'pills', label: '07 Pill · 유틸' },
  { id: 'forms', label: '08 폼 입력' },
  { id: 'badges', label: '09 배지' },
  { id: 'cards', label: '10 카드' },
  { id: 'tables', label: '11 테이블' },
  { id: 'empty', label: '12 빈 상태' },
  { id: 'toast', label: '13 토스트' },
  { id: 'phones', label: '14 미리보기 폰' },
  { id: 'layout', label: '15 레이아웃' },
  { id: 'patterns', label: '16 발송 카드 골격' },
  { id: 'tone', label: '17 톤 · 마이크로카피' }
]

const active = ref('intro')

function onScroll() {
  for (const s of sections) {
    const el = document.getElementById(s.id)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.top <= 160 && r.bottom > 160) { active.value = s.id; break }
  }
}
function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
}
onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); onScroll() })
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const ink = [
  { t: '--ink-900', h: '#0a0a0a', u: 'Primary 텍스트 · 버튼 BG' },
  { t: '--ink-800', h: '#18181b', u: 'Hover(primary) · 강조' },
  { t: '--ink-700', h: '#27272a', u: '본문' },
  { t: '--ink-600', h: '#3f3f46', u: '보조 텍스트' },
  { t: '--ink-500', h: '#52525b', u: '3차 텍스트 · 라벨' },
  { t: '--ink-400', h: '#71717a', u: 'muted · placeholder' },
  { t: '--ink-300', h: '#a1a1aa', u: 'disabled · 축 라벨' },
  { t: '--ink-200', h: '#d4d4d8', u: 'hover border' },
  { t: '--ink-100', h: '#e4e4e7', u: 'progress · divider' },
  { t: '--ink-50', h: '#f4f4f5', u: 'subtle BG' },
  { t: '--paper', h: '#fafaf9', u: '앱 배경' },
  { t: '--line', h: '#ececec', u: 'hairline 1px' }
]
const accent = [
  { t: '--accent', h: '#00DC82', u: 'AI · Live · +delta · CTA' },
  { t: '--accent-soft', h: '#e6fbf2', u: 'pill / 배경' },
  { t: '--accent-ink', h: '#007a48', u: '라이트 위 액센트 텍스트' }
]
const status = [
  { t: 'success', h: '#00DC82', u: '완료 · 저장' },
  { t: 'warning', h: '#f59e0b', u: '점검 · 한도 임박' },
  { t: 'error', h: '#f43f5e', u: '삭제 · 실패' },
  { t: 'info', h: '#3b82f6', u: '일반 안내' }
]
const channels = [
  { t: 'SMS', h: '#3b82f6' }, { t: 'Kakao', h: '#fbbf24' }, { t: 'RCS', h: '#8b5cf6' },
  { t: 'Email', h: '#f59e0b' }, { t: 'Push', h: '#00DC82' }, { t: 'Flow', h: '#0a0a0a' }
]

const principles = [
  { t: 'Calm by default', d: '채도 높은 색은 상태(error/success)에만. 평상시 무채색.', icon: 'i-lucide-moon' },
  { t: 'Information first', d: '카드 그라데이션·장식 금지. 데이터에 시선이 먼저.', icon: 'i-lucide-table' },
  { t: 'Single accent', d: '#00DC82 한 가지. 페이지당 4–6회 이내.', icon: 'i-lucide-sparkles' },
  { t: 'Type over boxes', d: '박스 겹치기보다 폰트로 위계.', icon: 'i-lucide-type' },
  { t: 'Tabular numbers', d: '모든 수치는 JetBrains Mono + tabular-nums.', icon: 'i-lucide-hash' },
  { t: 'Hairline > shadows', d: '1px solid #ececec 기본. 그림자는 floating UI만.', icon: 'i-lucide-minus' },
  { t: 'AI is quiet', d: 'AI는 ✨ + 그린만. 보라·무지개 금지.', icon: 'i-lucide-bot' }
]

const typeScale = [
  { role: 'Display', size: 22, weight: 600, ls: '-0.01em', text: '맑은 메시징' },
  { role: 'H1 / 페이지', size: 22, weight: 600, ls: '-0.01em', text: 'SMS 발송' },
  { role: 'Section / 카드', size: 13, weight: 600, ls: '-0.005em', text: '발신 정보 설정' },
  { role: 'Body', size: 13, weight: 400, ls: '0', text: '주문하신 상품이 출고되었습니다. 운송장 1234.' },
  { role: 'Body large (AI)', size: 15, weight: 400, ls: '0', text: '오늘 트래픽은 정상 범위입니다.' },
  { role: 'Caption', size: 12, weight: 400, ls: '0', text: '필수 입력 항목입니다.' },
  { role: 'Micro (eyebrow)', size: 11, weight: 600, ls: '0.06em', text: '메시지 발송 · 문자메시지', mono: true },
  { role: 'KPI Number', size: 28, weight: 500, ls: '-0.02em', text: '128,472', mono: true }
]

const spacing = [4, 6, 8, 10, 12, 16, 20, 24, 32]
const radii = [
  { n: 'r-sm', v: '4px', u: 'kbd · 작은 요소', r: 4 },
  { n: 'r-md', v: '6px', u: '버튼 · 입력 · pill', r: 6 },
  { n: 'r-lg', v: '8px', u: '카드 · 모달', r: 8 },
  { n: 'r-full', v: '9999px', u: '아바타', r: 999 }
]
const shadows = [
  { n: 'soft', v: '0 1px 2px /.04', u: 'tooltip · segmented' },
  { n: 'popover', v: '0 4px 12px /.08', u: 'dropdown · toast' },
  { n: 'modal', v: '0 12px 32px /.12', u: '모달' }
]

const matrix = [
  ['발신 식별자', '발신번호', '프로필 검색', '브랜드+번호', '이메일', '토큰', '플로우'],
  ['템플릿', '선택', '필수', '선택', '선택', '선택', '플로우'],
  ['AI 다듬기', '✓', '—', '✓', '✓', '—', '—'],
  ['치환자', '템플릿시', '✓', '✓', '템플릿시', '—', '✓'],
  ['미리보기', 'iMessage', '카카오', 'RCS', '이메일', '잠금화면(AOS/iOS)', '선택 노드'],
  ['단가(C)', '9.9', '8.0', '12.0', '0.65', '0.0', '노드 합산']
]

const sendCards = [
  { n: '①', name: '템플릿 선택', role: '템플릿 사용유무 + 샘플 템플릿 선택 (AppSendFormCard)' },
  { n: '②', name: '수신자 설정', role: '직접 입력 · 주소록 · 별칭 클릭 수정 · 삭제 + 치환자 (AppRecipientCard)' },
  { n: '③', name: '메시지 설정', role: '발신 정보 · 발송 목적/유형 · 본문 + 우측 채널 미리보기 (AppSendFormCard)' },
  { n: '④', name: '발송 설정', role: '즉시 / 예약 발송 + datetime (AppSendOptionsCard)' },
  { n: '—', name: 'AppSendActionsBar', role: '초기화 + 발송하기(primary)' }
]

const tone = [
  ['빈 목록', '아직 발송 이력이 없습니다.', '데이터 없음'],
  ['신규 유도', '첫 발송 시작하기', '발송하기 (맥락 없음)'],
  ['일반 오류', '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'Error 500'],
  ['권한 부족', '이 작업을 수행할 권한이 없습니다.', 'Forbidden'],
  ['한도 초과', '이번 달 발송 한도(SMS 5,000건)를 초과했습니다.', 'Rate limit exceeded'],
  ['삭제 컨펌', '정말 삭제하시겠습니까? 되돌릴 수 없습니다.', 'Are you sure?']
]

const segDemo = ref('a')
</script>

<template>
  <div class="app-container page-body">
    <div class="guide-grid">
      <aside class="guide-nav">
        <div class="guide-nav-title">
          디자인 가이드
        </div>
        <nav>
          <div
            v-for="s in sections"
            :key="s.id"
            class="guide-nav-item"
            :class="{ on: active === s.id }"
            @click="scrollTo(s.id)"
          >
            {{ s.label }}
          </div>
        </nav>
        <div class="h-divider" />
        <p style="font-size: var(--fz-sm); color: var(--ink-500); line-height: 1.6">
          살아있는 컴포넌트로 만든 시스템입니다. 모든 예시는 실제 main.css를 사용합니다.
        </p>
        <NuxtLink to="/home" class="btn btn-soft btn-sm" style="margin-top: 12px; width: 100%">
          <UIcon name="i-lucide-arrow-left" class="text-[length:var(--fz-sm)]" /> 대시보드로
        </NuxtLink>
      </aside>

      <div style="min-width: 0">
        <!-- intro -->
        <section id="intro" class="g-hero">
          <div class="g-hero-eyebrow">
            맑은 메시징 디자인 가이드 · Relay-inspired v1.0
          </div>
          <h1 class="g-hero-h1">
            Less chrome,<br>more clarity.
          </h1>
          <p class="g-hero-p">
            무채색 ink 11단 + 단일 그린 액센트, 1px hairline, 저밀도. 토큰·컴포넌트·발송 아키텍처를 한 페이지에 정리한 살아있는 레퍼런스입니다.
          </p>
          <div class="g-hero-meta">
            <div>
              <div class="o">정본</div>
              <div class="v">doc/DESIGN.md</div>
            </div>
            <div class="bar" />
            <div>
              <div class="o">폰트</div>
              <div class="v">Inter · JetBrains Mono</div>
            </div>
            <div class="bar" />
            <div>
              <div class="o">액센트</div>
              <div class="v">#00DC82</div>
            </div>
          </div>
        </section>

        <!-- 01 principles -->
        <section id="principles" class="g-sec">
          <div class="g-eyebrow">
            § 1 · 01
          </div>
          <h2 class="g-h2">
            디자인 원칙
          </h2>
          <p class="g-desc">
            모든 화면에 일관 적용되는 7가지 원칙.
          </p>
          <div class="g-grid g-grid-3">
            <div v-for="p in principles" :key="p.t" class="card" style="padding: 20px">
              <div class="g-icon">
                <UIcon :name="p.icon" class="text-[length:var(--fz-3xl)]" />
              </div>
              <div style="font-size: var(--fz-lg); font-weight: 600; color: var(--ink-900); margin: 12px 0 6px">
                {{ p.t }}
              </div>
              <div style="font-size: var(--fz-md); color: var(--ink-600); line-height: 1.6">
                {{ p.d }}
              </div>
            </div>
          </div>
        </section>

        <!-- 02 colors -->
        <section id="colors" class="g-sec">
          <div class="g-eyebrow">
            § 2 · 02
          </div>
          <h2 class="g-h2">
            컬러 시스템
          </h2>
          <p class="g-desc">
            ink 무채색 11단으로 90%, accent·semantic은 강조에만. 색은 항상 CSS 변수.
          </p>
          <div class="g-block-t">
            Ink Scale (≈ Tailwind zinc)
          </div>
          <div class="g-swatches">
            <div v-for="c in ink" :key="c.t" class="g-swatch">
              <div class="sw" :style="{ background: c.h }" />
              <div class="g-swatch-meta">
                <div class="tk">
                  {{ c.t }}
                </div>
                <div class="hx">
                  {{ c.h }}
                </div>
                <div class="us">
                  {{ c.u }}
                </div>
              </div>
            </div>
          </div>
          <div class="g-block-t">
            Accent — Green
          </div>
          <div class="g-swatches">
            <div v-for="c in accent" :key="c.t" class="g-swatch">
              <div class="sw" :style="{ background: c.h }" />
              <div class="g-swatch-meta">
                <div class="tk">
                  {{ c.t }}
                </div>
                <div class="hx">
                  {{ c.h }}
                </div>
                <div class="us">
                  {{ c.u }}
                </div>
              </div>
            </div>
          </div>
          <div class="g-block-t">
            Semantic (Nuxt UI 토큰)
          </div>
          <div class="g-swatches">
            <div v-for="c in status" :key="c.t" class="g-swatch">
              <div class="sw" :style="{ background: c.h }" />
              <div class="g-swatch-meta">
                <div class="tk">
                  color="{{ c.t }}"
                </div>
                <div class="us">
                  {{ c.u }}
                </div>
              </div>
            </div>
          </div>
          <div class="g-block-t">
            Channel dots (점 표시 전용)
          </div>
          <div class="row" style="flex-wrap: wrap; gap: 16px">
            <span v-for="c in channels" :key="c.t" class="row" style="gap: 6px; font-size: var(--fz-sm); font-family: var(--font-mono)">
              <span style="width: 8px; height: 8px; border-radius: 50%" :style="{ background: c.h }" />{{ c.t }}
            </span>
          </div>
        </section>

        <!-- 03 typography -->
        <section id="typography" class="g-sec">
          <div class="g-eyebrow">
            § 3 · 03
          </div>
          <h2 class="g-h2">
            타이포그래피
          </h2>
          <p class="g-desc">
            Inter(UI) · JetBrains Mono(숫자/ID) · Pretendard(한국어 fallback).
          </p>
          <div class="card" style="padding: 0; overflow: hidden">
            <div
              v-for="(s, i) in typeScale"
              :key="i"
              class="g-type-row"
              :style="{ borderBottom: i < typeScale.length - 1 ? '1px solid var(--line)' : 'none' }"
            >
              <div>
                <div style="font-size: var(--fz-xs); font-weight: 600; color: var(--accent-ink); letter-spacing: 0.06em">
                  {{ s.role.toUpperCase() }}
                </div>
              </div>
              <div :style="{ fontSize: s.size + 'px', fontWeight: s.weight, letterSpacing: s.ls, color: 'var(--ink-900)', fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-sans)', lineHeight: 1.4 }">
                {{ s.text }}
              </div>
              <div style="font-family: var(--font-mono); font-size: var(--fz-xs); color: var(--ink-500)">
                {{ s.size }}px / {{ s.weight }}
              </div>
            </div>
          </div>
        </section>

        <!-- 04 spacing -->
        <section id="spacing" class="g-sec">
          <div class="g-eyebrow">
            § 4 · 04
          </div>
          <h2 class="g-h2">
            간격 스케일
          </h2>
          <p class="g-desc">
            4px 베이스. 카드 패딩 16–20, 카드 간 24, Shell 32.
          </p>
          <div class="card" style="padding: 24px">
            <div style="display: flex; flex-direction: column; gap: 12px">
              <div v-for="n in spacing" :key="n" style="display: grid; grid-template-columns: 56px 1fr; align-items: center; gap: 16px">
                <div style="font-family: var(--font-mono); font-size: var(--fz-sm); color: var(--ink-600)">
                  {{ n }}px
                </div>
                <div :style="{ height: '16px', width: n + 'px', background: 'var(--accent)', borderRadius: '3px' }" />
              </div>
            </div>
          </div>
        </section>

        <!-- 05 radius/shadow -->
        <section id="radius" class="g-sec">
          <div class="g-eyebrow">
            § 4 · 05
          </div>
          <h2 class="g-h2">
            라운드 · 그림자 · 보더
          </h2>
          <p class="g-desc">
            카드는 그림자 없이 1px hairline만. 그림자는 floating UI 전용.
          </p>
          <div class="g-block-t">
            Radius
          </div>
          <div class="g-grid g-grid-4">
            <div v-for="r in radii" :key="r.n" class="card" style="padding: 20px; text-align: center">
              <div class="g-radius-box" :style="{ borderRadius: r.r + 'px' }" />
              <div style="font-size: var(--fz-md); font-weight: 600; color: var(--ink-900)">
                {{ r.n }}
              </div>
              <div style="font-size: var(--fz-xs); color: var(--ink-500); font-family: var(--font-mono)">
                {{ r.v }}
              </div>
              <div style="font-size: var(--fz-xs); color: var(--ink-600); margin-top: 4px">
                {{ r.u }}
              </div>
            </div>
          </div>
          <div class="g-block-t">
            Shadow
          </div>
          <div class="g-grid g-grid-3">
            <div
              v-for="s in shadows"
              :key="s.n"
              :style="{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: '20px', boxShadow: `var(--shadow-${s.n})`, border: '1px solid var(--line)' }"
            >
              <div style="font-size: var(--fz-md); font-weight: 600; color: var(--ink-900)">
                {{ s.n }}
              </div>
              <div style="font-size: var(--fz-xs); color: var(--ink-500); font-family: var(--font-mono); margin: 4px 0 6px">
                {{ s.v }}
              </div>
              <div style="font-size: var(--fz-xs); color: var(--ink-600)">
                {{ s.u }}
              </div>
            </div>
          </div>
        </section>

        <!-- 06 buttons -->
        <section id="buttons" class="g-sec">
          <div class="g-eyebrow">
            § 6.1 · 06
          </div>
          <h2 class="g-h2">
            버튼
          </h2>
          <p class="g-desc">
            Primary=ink-900 · accent=그린(CTA ≤1) · neutral/outline=취소 · error=위험.
          </p>
          <div class="card" style="padding: 24px">
            <div class="row" style="flex-wrap: wrap; gap: 8px; margin-bottom: 16px">
              <button class="btn btn-primary">
                발송하기
              </button>
              <button class="btn btn-accent">
                <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-lg)]" /> AI 생성
              </button>
              <button class="btn btn-soft">
                직접 입력
              </button>
              <button class="btn btn-neutral">
                초기화
              </button>
              <button class="btn btn-outline-dark">
                자세히
              </button>
              <button class="btn btn-error">
                삭제
              </button>
              <button class="btn btn-error-solid">
                영구 삭제
              </button>
              <button class="btn btn-ghost">
                건너뛰기
              </button>
            </div>
            <div class="row" style="align-items: center; gap: 8px">
              <button class="btn btn-primary btn-sm">
                Small 28
              </button>
              <button class="btn btn-primary">
                Default 32
              </button>
              <button class="btn btn-primary btn-lg">
                Large 36
              </button>
              <button class="btn btn-primary btn-icon" aria-label="추가">
                <UIcon name="i-lucide-plus" class="text-[length:var(--fz-lg)]" />
              </button>
            </div>
          </div>
        </section>

        <!-- 07 pills -->
        <section id="pills" class="g-sec">
          <div class="g-eyebrow">
            § 5.1 · 07
          </div>
          <h2 class="g-h2">
            Pill · 유틸 액션
          </h2>
          <p class="g-desc">
            GNB 우측 상시 노출. r-md 6px.
          </p>
          <div class="card" style="padding: 24px">
            <div class="row" style="flex-wrap: wrap; gap: 12px; align-items: center">
              <button class="pill pill-inquire">
                문의
              </button>
              <button class="pill pill-charge">
                충전
              </button>
              <button class="pill pill-signup">
                회원가입
              </button>
              <button class="pill-user">
                <span class="avatar">관</span>
                <span>관리자</span>
                <UIcon name="i-lucide-chevron-down" class="text-[length:var(--fz-2xs)]" />
              </button>
            </div>
          </div>
        </section>

        <!-- 08 forms -->
        <section id="forms" class="g-sec">
          <div class="g-eyebrow">
            § 6.3 · 08
          </div>
          <h2 class="g-h2">
            폼 입력
          </h2>
          <p class="g-desc">
            paper BG, focus 시 white + ink-300 border. 에러는 인풋 아래 빨간 텍스트.
          </p>
          <div class="card" style="padding: 24px">
            <div class="g-grid g-grid-2" style="gap: 16px">
              <AppFormRow label="기본">
                <input class="input" placeholder="placeholder">
              </AppFormRow>
              <AppFormRow label="채워진">
                <input class="input" value="010-1234-5678">
              </AppFormRow>
              <AppFormRow label="비활성">
                <input class="input" placeholder="비활성" disabled>
              </AppFormRow>
              <AppFormRow label="읽기 전용">
                <input class="input readonly" value="고정값" readonly>
              </AppFormRow>
              <AppFormRow label="Select">
                <select class="select">
                  <option>1588-1234 (대표)</option><option>02-555-1234</option>
                </select>
              </AppFormRow>
              <AppFormRow label="에러">
                <input class="input" value="잘못된 값" style="border-color: var(--danger)">
                <div style="font-size: var(--fz-sm); color: var(--danger-ink); margin-top: 4px">
                  올바른 형식이 아닙니다.
                </div>
              </AppFormRow>
            </div>
            <div style="margin-top: 16px">
              <AppFormRow label="Textarea">
                <textarea class="textarea" rows="3" placeholder="본문을 입력하세요…" />
              </AppFormRow>
            </div>
            <div class="g-grid g-grid-2" style="gap: 24px; margin-top: 16px">
              <div>
                <div class="g-mini-t">
                  Radio
                </div>
                <AppRadioGroup
                  v-model="segDemo"
                  :options="[{ value: 'a', label: '정보성' }, { value: 'b', label: '광고성' }, { value: 'c', label: '인증' }]"
                />
              </div>
              <div>
                <div class="g-mini-t">
                  Checkbox · Segmented
                </div>
                <div class="row" style="gap: 16px; margin-bottom: 12px">
                  <label class="checkbox"><input type="checkbox" checked> 약관 동의</label>
                  <label class="checkbox"><input type="checkbox"> 마케팅 수신</label>
                </div>
                <AppSegmented
                  v-model="segDemo"
                  :options="[{ value: 'a', label: '오늘' }, { value: 'b', label: '7일' }, { value: 'c', label: '30일' }]"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 09 badges -->
        <section id="badges" class="g-sec">
          <div class="g-eyebrow">
            § 6.6 · 09
          </div>
          <h2 class="g-h2">
            배지 · 태그
          </h2>
          <p class="g-desc">
            6 tone · dot prop으로 색 점 prefix.
          </p>
          <div class="card" style="padding: 24px">
            <div class="row" style="flex-wrap: wrap; gap: 8px">
              <AppBadge tone="success" dot>
                발송 완료
              </AppBadge>
              <AppBadge tone="warning" dot>
                일부 실패
              </AppBadge>
              <AppBadge tone="error" dot>
                발송 실패
              </AppBadge>
              <AppBadge tone="primary">
                SMS
              </AppBadge>
              <AppBadge tone="warning">
                알림톡
              </AppBadge>
              <AppBadge tone="sky">
                RCS
              </AppBadge>
              <AppBadge tone="neutral">
                이메일
              </AppBadge>
              <AppBadge tone="sky">
                VIP 고객
              </AppBadge>
              <AppBadge tone="neutral">
                <UIcon name="i-lucide-lock" class="text-[length:var(--fz-2xs)]" /> 템플릿 잠금
              </AppBadge>
            </div>
          </div>
        </section>

        <!-- 10 cards -->
        <section id="cards" class="g-sec">
          <div class="g-eyebrow">
            § 6.2 · 10
          </div>
          <h2 class="g-h2">
            카드
          </h2>
          <p class="g-desc">
            흰 BG · 1px line · r-lg. 그림자·그라데이션 없음.
          </p>
          <div class="g-grid g-grid-2">
            <AppSendFormCard step="1" title="발신 정보" required hint="3개 등록됨">
              <AppFormRow label="발신번호" required>
                <select class="select" style="max-width: 240px">
                  <option>1588-1234</option>
                </select>
              </AppFormRow>
            </AppSendFormCard>
            <AppSendFormCard
              step="2"
              title="수신자"
              required
              locked
              locked-hint="발신 프로필과 템플릿을 먼저 선택해 주세요."
            />
          </div>
        </section>

        <!-- 11 tables -->
        <section id="tables" class="g-sec">
          <div class="g-eyebrow">
            § 6.5 · 11
          </div>
          <h2 class="g-h2">
            테이블
          </h2>
          <p class="g-desc">
            mono UPPERCASE 헤더 · row hover paper · 선택 accent-soft.
          </p>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>채널</th><th>제목</th><th>수신자</th><th>상태</th><th>발송 시각</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="ch-pill sms">SMS</span></td>
                  <td style="color: var(--ink-900)">
                    [몰리몰리] 주문이 출고되었습니다.
                  </td>
                  <td class="cell-mono">
                    142
                  </td>
                  <td><AppBadge tone="success" dot>완료</AppBadge></td>
                  <td class="cell-mono">
                    오늘 14:23
                  </td>
                </tr>
                <tr class="selected">
                  <td><span class="ch-pill kakao">KAKAO</span></td>
                  <td style="color: var(--ink-900)">
                    회원가입 환영 메시지 (자동)
                  </td>
                  <td class="cell-mono">
                    38
                  </td>
                  <td><AppBadge tone="success" dot>완료</AppBadge></td>
                  <td class="cell-mono">
                    오늘 11:05
                  </td>
                </tr>
                <tr>
                  <td><span class="ch-pill email">EMAIL</span></td>
                  <td style="color: var(--ink-900)">
                    5월 뉴스레터 — 신상품 12종
                  </td>
                  <td class="cell-mono">
                    1,024
                  </td>
                  <td><AppBadge tone="warning" dot>일부 실패</AppBadge></td>
                  <td class="cell-mono">
                    어제 18:00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 12 empty -->
        <section id="empty" class="g-sec">
          <div class="g-eyebrow">
            § 6.7 · 12
          </div>
          <h2 class="g-h2">
            빈 상태
          </h2>
          <p class="g-desc">
            아이콘 박스 + 메시지 + 1차 액션.
          </p>
          <div class="g-grid g-grid-2">
            <div class="card">
              <AppEmptyState icon="i-lucide-inbox" title="아직 발송 이력이 없습니다." desc="첫 메시지를 발송해 보세요.">
                <template #action>
                  <button class="btn btn-primary btn-sm">
                    <UIcon name="i-lucide-send" class="text-[length:var(--fz-sm)]" /> 첫 발송 시작하기
                  </button>
                </template>
              </AppEmptyState>
            </div>
            <div class="card">
              <AppEmptyState icon="i-lucide-users" title="수신자를 선택해 주세요." desc="직접 입력하거나 주소록에서 선택할 수 있습니다.">
                <template #action>
                  <button class="btn btn-primary btn-sm">
                    <UIcon name="i-lucide-contact-round" class="text-[length:var(--fz-sm)]" /> 주소록 열기
                  </button>
                </template>
              </AppEmptyState>
            </div>
          </div>
        </section>

        <!-- 13 toast -->
        <section id="toast" class="g-sec">
          <div class="g-eyebrow">
            § 6.7 · 13
          </div>
          <h2 class="g-h2">
            토스트 알림
          </h2>
          <p class="g-desc">
            Nuxt UI useToast().add({…}). 우측 하단, 자동 dismiss.
          </p>
          <div class="card" style="padding: 24px">
            <div class="row" style="flex-wrap: wrap; gap: 8px">
              <button class="btn btn-outline btn-sm" @click="toast.add({ title: '발송이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })">
                성공
              </button>
              <button class="btn btn-outline btn-sm" @click="toast.add({ title: '발송 한도의 90%에 도달했습니다.', color: 'warning', icon: 'i-lucide-triangle-alert' })">
                경고
              </button>
              <button class="btn btn-outline btn-sm" @click="toast.add({ title: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', color: 'error', icon: 'i-lucide-octagon-alert' })">
                에러
              </button>
              <button class="btn btn-outline btn-sm" @click="toast.add({ title: '예약 시각이 변경되었습니다.', color: 'info', icon: 'i-lucide-info' })">
                정보
              </button>
            </div>
          </div>
        </section>

        <!-- 14 phones -->
        <section id="phones" class="g-sec">
          <div class="g-eyebrow">
            § 6.8 · 14
          </div>
          <h2 class="g-h2">
            미리보기 폰
          </h2>
          <p class="g-desc">
            채널마다 다른 shell. 280×520 기준.
          </p>
          <div class="g-phones">
            <div>
              <div class="g-phone-cap">
                SMS · iMessage
              </div>
              <AppPhonePreview sender-name="1588-1234" message="[몰리몰리] 주문이 정상 접수되었습니다.&#10;&#10;주문번호: ORD-20260518-0042" />
            </div>
            <div>
              <div class="g-phone-cap">
                알림톡
              </div>
              <AppKakaoPreview profile-name="(주)몰리몰리" body="안녕하세요 #{이름}님,&#10;&#10;주문이 정상 접수되었습니다." :buttons="[{ type: 'web', label: '주문 상세 보기' }]" />
            </div>
            <div>
              <div class="g-phone-cap">
                RCS
              </div>
              <AppRcsPreview brand-name="몰리몰리" body="VIP 등급으로 승급되셨습니다!" image :buttons="[{ type: 'web', label: '혜택 확인하기' }]" />
            </div>
            <div>
              <div class="g-phone-cap">
                이메일
              </div>
              <AppEmailPreview from="noreply@malgnsoft.com" subject="[몰리몰리] 5월 특별 혜택" body="최대 40% 할인 이벤트가 진행 중입니다." />
            </div>
            <div>
              <div class="g-phone-cap">
                PUSH
              </div>
              <AppPushPreview app-name="몰리몰리" title="타임세일 시작!" body="VIP 전용 타임세일이 시작되었어요." />
            </div>
          </div>
        </section>

        <!-- 15 layout -->
        <section id="layout" class="g-sec">
          <div class="g-eyebrow">
            § 5 · 15
          </div>
          <h2 class="g-h2">
            레이아웃
          </h2>
          <p class="g-desc">
            1400px 컨테이너 · 320px 보조 컬럼 · 56px 토pbar.
          </p>
          <div class="card" style="padding: 24px; background: var(--paper)">
            <div style="display: grid; grid-template-columns: 1fr 320px; gap: 24px">
              <div class="g-ph-box">
                메인 (1fr)
              </div>
              <div class="g-ph-box">
                보조 (320px)
              </div>
            </div>
            <div style="font-size: var(--fz-sm); color: var(--ink-500); margin-top: 12px">
              1024px 미만에서 1단 전환, 보조 영역이 위로.
            </div>
          </div>
          <div class="g-block-t">
            페이지 헤더 패턴
          </div>
          <div class="card" style="padding: 24px">
            <div class="page-header" style="margin: 0">
              <div class="crumb">
                메시지 발송 · 문자메시지
              </div>
              <h1>SMS 발송</h1>
              <p>SMS · LMS · MMS 단발 발송. 한 건당 9.9 C부터.</p>
            </div>
          </div>
        </section>

        <!-- 16 5-card -->
        <section id="patterns" class="g-sec">
          <div class="g-eyebrow">
            § 12 · 16
          </div>
          <h2 class="g-h2">
            발송 페이지 카드 골격
          </h2>
          <p class="g-desc">
            모든 발송 페이지(SMS/알림톡/RCS/이메일/PUSH/Flow) 공통 구조 — 템플릿 선택 · 수신자 설정 · 메시지 설정 · 발송 설정의 3+1 카드.
          </p>
          <div class="g-grid g-grid-2">
            <div
              v-for="(c, i) in sendCards"
              :key="i"
              class="card"
              style="padding: 18px"
            >
              <div class="row" style="margin-bottom: 8px; gap: 8px">
                <span class="g-card-num">{{ c.n }}</span>
                <code style="font-size: var(--fz-md); font-weight: 600; color: var(--ink-900)">{{ c.name }}</code>
              </div>
              <div style="font-size: var(--fz-md); color: var(--ink-600); line-height: 1.6">
                {{ c.role }}
              </div>
            </div>
          </div>
          <div class="g-block-t">
            채널별 차이 매트릭스
          </div>
          <div class="table-wrap" style="overflow-x: auto">
            <table class="table" style="min-width: 700px">
              <thead>
                <tr>
                  <th>속성</th><th>SMS</th><th>알림톡</th><th>RCS</th><th>이메일</th><th>PUSH</th><th>Flow</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in matrix" :key="i">
                  <td v-for="(cell, j) in row" :key="j" :style="{ fontWeight: j === 0 ? 600 : 400, color: j === 0 ? 'var(--ink-900)' : 'var(--ink-700)' }">
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 17 tone -->
        <section id="tone" class="g-sec">
          <div class="g-eyebrow">
            § 10 · 17
          </div>
          <h2 class="g-h2">
            톤 · 마이크로카피
          </h2>
          <p class="g-desc">
            존댓말 기본. 사실 + 즉시 가능한 액션. 한국어 우선.
          </p>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 20%">
                    상황
                  </th><th>좋은 문장</th><th>피할 문장</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in tone" :key="i">
                  <td style="font-weight: 600; color: var(--ink-900)">
                    {{ r[0] }}
                  </td>
                  <td style="color: var(--accent-ink)">
                    ✓ {{ r[1] }}
                  </td>
                  <td style="color: var(--ink-400)">
                    ✗ {{ r[2] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  align-items: start;
}
@media (max-width: 1023px) {
  .guide-grid { grid-template-columns: 1fr; gap: 16px; }
  .guide-nav { display: none; }
}
.guide-nav { position: sticky; top: 72px; align-self: start; }
.guide-nav-title {
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-400);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-family: var(--font-mono);
}
.guide-nav-item {
  padding: 6px 10px;
  font-size: var(--fz-md);
  border-radius: var(--r-sm);
  cursor: pointer;
  color: var(--ink-600);
  border-left: 2px solid transparent;
  transition: all 0.12s;
}
.guide-nav-item:hover { color: var(--ink-900); background: var(--ink-50); }
.guide-nav-item.on {
  color: var(--accent-ink);
  background: var(--accent-soft);
  font-weight: 600;
  border-left-color: var(--accent);
}

.g-hero {
  background: var(--ink-900);
  border: 1px solid var(--ink-800);
  border-radius: var(--r-lg);
  padding: 44px 36px;
  color: var(--white);
  margin-bottom: 48px;
}
.g-hero-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.g-hero-h1 { font-size: calc(36px * var(--fz-scale)); font-weight: 600; margin: 0; letter-spacing: -0.02em; line-height: 1.2; }
.g-hero-p { font-size: var(--fz-lg); line-height: 1.7; color: rgba(255, 255, 255, 0.7); margin: 16px 0 0; max-width: 520px; }
.g-hero-meta { display: flex; gap: 24px; margin-top: 28px; font-size: var(--fz-md); }
.g-hero-meta .o { color: rgba(255, 255, 255, 0.5); font-family: var(--font-mono); font-size: var(--fz-xs); }
.g-hero-meta .v { font-weight: 600; margin-top: 4px; }
.g-hero-meta .bar { width: 1px; background: rgba(255, 255, 255, 0.15); }

.g-sec { margin-bottom: 56px; scroll-margin-top: 80px; }
.g-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--accent-ink);
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}
.g-h2 { font-size: var(--fz-4xl); font-weight: 600; color: var(--ink-900); margin: 0; letter-spacing: -0.01em; }
.g-desc { font-size: var(--fz-md); color: var(--ink-500); margin: 8px 0 20px; line-height: 1.6; }
.g-block-t { font-size: var(--fz-sm); font-weight: 600; color: var(--ink-700); margin: 24px 0 10px; }
.g-mini-t { font-size: var(--fz-sm); font-weight: 600; color: var(--ink-600); margin-bottom: 10px; }

.g-grid { display: grid; gap: 16px; }
.g-grid-2 { grid-template-columns: repeat(2, 1fr); }
.g-grid-3 { grid-template-columns: repeat(3, 1fr); }
.g-grid-4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 1023px) {
  .g-grid-3, .g-grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .g-grid-2, .g-grid-3, .g-grid-4 { grid-template-columns: 1fr; }
}

.g-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  background: var(--accent-soft);
  color: var(--accent-ink);
  display: grid;
  place-items: center;
}

.g-swatches {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 1023px) { .g-swatches { grid-template-columns: repeat(2, 1fr); } }
.g-swatch {
  border-radius: var(--r-md);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--white);
}
.g-swatch .sw { height: 56px; }
.g-swatch-meta { padding: 10px 12px; }
.g-swatch-meta .tk { font-family: var(--font-mono); font-size: var(--fz-xs); font-weight: 600; color: var(--ink-800); }
.g-swatch-meta .hx { font-family: var(--font-mono); font-size: var(--fz-xs); color: var(--ink-500); margin-top: 2px; }
.g-swatch-meta .us { font-size: var(--fz-xs); color: var(--ink-500); margin-top: 4px; line-height: 1.4; }

.g-type-row {
  display: grid;
  grid-template-columns: 130px 1fr 110px;
  align-items: center;
  padding: 16px 20px;
  gap: 20px;
}
@media (max-width: 1023px) { .g-type-row { grid-template-columns: 1fr; gap: 6px; } }

.g-radius-box {
  width: 72px;
  height: 72px;
  background: var(--accent-soft);
  border: 1.5px solid var(--accent);
  margin: 0 auto 12px;
}

.g-phones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  justify-items: center;
}
.g-phone-cap {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  margin-bottom: 10px;
  text-align: center;
}

.g-ph-box {
  background: var(--white);
  border: 1.5px dashed var(--ink-200);
  border-radius: var(--r-md);
  padding: 40px;
  text-align: center;
  color: var(--ink-500);
  font-size: var(--fz-md);
}
.g-card-num {
  width: 26px;
  height: 26px;
  border-radius: var(--r-sm);
  background: var(--ink-900);
  color: var(--white);
  font-size: var(--fz-md);
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.g-card-num.opt { background: var(--ink-100); color: var(--ink-500); }
</style>
