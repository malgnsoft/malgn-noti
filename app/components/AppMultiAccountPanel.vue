<script setup lang="ts">
interface Notice {
  text: string
  sub?: string[]
}

/* 본인 인증 안내 문구 */
const NOTICES: Notice[] = [
  { text: '전기통신사업법 관련 고시 준수 및 어뷰징 방지 강화를 위해 본인 인증 후 서비스를 이용할 수 있습니다.' },
  { text: '회원 가입 시 입력한 회원 정보(이름, 휴대폰 번호)와 본인 인증 입력 정보가 일치해야 합니다.' },
  {
    text: '사업자 회원이 생성한 조직/프로젝트에 초대된 맑은메시지 계정 또는 사업자 회원이 생성한 조직에 초대된 멀티계정 계정은 서비스 이용을 위해 본인 인증을 진행해야 합니다.',
    sub: ['초대된 맑은메시지 계정, 멀티계정 계정은 본인 인증 승인 시 회원 유형이 사업자로 구분됩니다.'],
  },
  { text: '맑은메시지 개인 계정이 생성한 조직/프로젝트에서는 본인 인증 및 서비스 이용이 불가합니다.' },
]

/* 인증 방법 안내 표 */
const METHOD_ROWS = [
  { title: '사업자 대표', desc: '사업자 대표 소유의 휴대폰 본인 인증', docs: '사업자등록증, 재직증명서' },
  { title: '임직원(업무 담당 직원)', desc: '임직원 소유의 휴대폰 본인 인증', docs: '사업자등록증, 재직증명서' },
]

interface VerifyRecord {
  memberType: string
  name: string
  docs: string
  status: '승인' | '승인 대기' | '반려'
  requestedAt: string
  verifiedAt: string
}

/* 본인 인증 내역 (목업 — 백엔드 연동 시 교체) */
const records = ref<VerifyRecord[]>([
  {
    memberType: '사업자 멀티계정',
    name: '김덕조',
    docs: '사업자등록증, 재직증명서',
    status: '승인',
    requestedAt: '2026-04-13 16:41',
    verifiedAt: '2026-04-13 18:52',
  },
])

const statusClass: Record<VerifyRecord['status'], string> = {
  '승인': 'badge-success',
  '승인 대기': 'badge-neutral',
  '반려': 'badge-error',
}

/* 휴대폰 본인 인증 모달 */
const verifyOpen = ref(false)
function onVerified() {
  const now = new Date()
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} `
    + `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  records.value = [
    {
      memberType: '사업자 멀티계정',
      name: '신규 인증 요청',
      docs: '사업자등록증, 재직증명서',
      status: '승인 대기',
      requestedAt: fmt(now),
      verifiedAt: '-',
    },
    ...records.value,
  ]
  verifyOpen.value = false
}
</script>

<template>
  <div class="mu-panel">
    <!-- 본인 인증 안내 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>본인 인증 안내</h3>
        <button type="button" class="btn btn-primary btn-sm" @click="verifyOpen = true">
          <UIcon name="i-lucide-smartphone" class="text-[length:var(--fz-sm)]" />
          휴대폰 본인 인증(필요 서류 첨부)
        </button>
      </div>

      <ul class="mu-notice">
        <li v-for="(n, i) in NOTICES" :key="i">
          <span class="mu-bullet">{{ n.text }}</span>
          <ul v-if="n.sub" class="mu-notice-sub">
            <li v-for="(s, j) in n.sub" :key="j">{{ s }}</li>
          </ul>
        </li>
      </ul>

      <table class="table mu-table">
        <thead>
          <tr>
            <th style="width: 18%">구분</th>
            <th style="width: 52%">인증 방법</th>
            <th style="width: 30%">필요 서류</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, i) in METHOD_ROWS" :key="m.title">
            <td v-if="i === 0" :rowspan="METHOD_ROWS.length" class="mu-group">
              사업자 회원
            </td>
            <td class="mu-method">
              <span class="mu-method-title">{{ m.title }}</span>
              <span class="mu-method-desc">{{ m.desc }}</span>
            </td>
            <td class="mu-docs">{{ m.docs }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 본인 인증 내역 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>본인 인증 내역</h3>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>회원 유형</th>
            <th>회원 이름(임직원 이름)</th>
            <th>제출 서류</th>
            <th style="width: 92px">상태</th>
            <th style="width: 140px">인증 요청 일시</th>
            <th style="width: 140px">인증 일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in records" :key="i">
            <td>{{ r.memberType }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.docs }}</td>
            <td><span class="badge" :class="statusClass[r.status]">{{ r.status }}</span></td>
            <td class="mu-date">{{ r.requestedAt }}</td>
            <td class="mu-date">{{ r.verifiedAt }}</td>
          </tr>
          <tr v-if="!records.length">
            <td colspan="6" class="mu-empty">본인 인증 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <AppPhoneVerifyDialog
      :open="verifyOpen"
      @close="verifyOpen = false"
      @verified="onVerified"
    />
  </div>
</template>

<style scoped>
.ms-sec + .ms-sec { margin-top: 40px; }
.ms-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.ms-head .btn { margin-left: auto; }

/* 안내 문구 */
.mu-notice {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mu-notice > li {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.6;
}
.mu-bullet {
  display: block;
  position: relative;
  padding-left: 14px;
}
.mu-bullet::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 9px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--ink-400);
}
.mu-notice-sub {
  list-style: none;
  margin: 4px 0 0;
  padding: 0 0 0 14px;
}
.mu-notice-sub li {
  position: relative;
  padding-left: 14px;
  font-size: var(--fz-xs);
  color: var(--ink-500);
}
.mu-notice-sub li::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 7px;
  width: 4px;
  height: 4px;
  border: 1px solid var(--ink-400);
  border-radius: 50%;
}

/* 인증 방법 표 */
.mu-table { margin-bottom: 4px; }
.mu-table td { vertical-align: middle; }
.mu-group {
  text-align: center;
  font-weight: 600;
  color: var(--ink-800);
  background: var(--ink-50);
}
.mu-method {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
  align-items: center;
}
.mu-method-title {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.mu-method-desc {
  font-size: var(--fz-xs);
  color: var(--ink-500);
}
.mu-docs { text-align: center; }

.mu-date {
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--ink-600);
}
.mu-empty {
  text-align: center;
  color: var(--ink-400);
  padding: 28px 0;
}
</style>
