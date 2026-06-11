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

/* ── 멀티 계정(매니저) — /me/members ───────────────────────────── */
const toast = useToast()
const api = useApi()
const auth = useAuthStore()

type Role = 'owner' | 'admin' | 'member'
interface MemberRow {
  id: number
  loginid: string
  name: string | null
  email: string | null
  role: Role
  status: number
  lastLoginAt: string | null
  createdAt: string
}
const ROLE_LABEL: Record<Role, string> = { owner: '소유자', admin: '관리자', member: '멤버' }

const canManage = computed(() => auth.user?.role === 'owner' || auth.user?.role === 'admin')
const myId = computed(() => auth.user?.id ?? null)

function fmtDateTime(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const members = ref<MemberRow[]>([])
async function loadMembers() {
  const res = await api<{ data: { items: MemberRow[] } }>('/me/members')
  members.value = res.data.items
}
// SSR에서 실패해도 죽지 않도록 swallow — client mount 시 재시도.
try { await loadMembers() }
catch { /* ignore */ }
onMounted(() => {
  if (members.value.length === 0) loadMembers().catch(() => { /* ignore */ })
})

function errStatus(e: unknown): number | undefined {
  return (e as { response?: { status?: number } })?.response?.status
    ?? (e as { statusCode?: number })?.statusCode
}

/* 담당자 추가 모달 */
const addOpen = ref(false)
const adding = ref(false)
async function onSubmitMember(p: { name: string, email: string, role: 'admin' | 'member' }) {
  if (adding.value) return
  adding.value = true
  try {
    await api('/me/members', { method: 'POST', body: p })
    await loadMembers()
    addOpen.value = false
    toast.add({ title: '담당자 계정이 생성되었습니다. 임시 비밀번호가 이메일로 발송되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch (e) {
    toast.add({
      title: errStatus(e) === 409 ? '이미 사용 중인 이메일입니다.' : '담당자 추가에 실패했습니다.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
  finally {
    adding.value = false
  }
}

/* 권한 변경 */
async function changeRole(m: MemberRow, role: Role) {
  if (role === m.role) return
  try {
    await api(`/me/members/${m.id}`, { method: 'PATCH', body: { role } })
    await loadMembers()
    toast.add({ title: '권한이 변경되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch (e) {
    await loadMembers()
    toast.add({
      title: errStatus(e) === 409 ? '마지막 소유자는 변경할 수 없습니다.' : '권한 변경에 실패했습니다.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}

/* 활성/정지 토글 */
async function toggleStatus(m: MemberRow) {
  const next = m.status === 1 ? 0 : 1
  try {
    await api(`/me/members/${m.id}`, { method: 'PATCH', body: { status: next } })
    await loadMembers()
    toast.add({ title: next === 1 ? '계정이 활성화되었습니다.' : '계정이 정지되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch (e) {
    toast.add({
      title: errStatus(e) === 409 ? '마지막 소유자는 정지할 수 없습니다.' : '상태 변경에 실패했습니다.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}

/* 삭제 */
const deleteTarget = ref<MemberRow | null>(null)
const deleteMessage = computed(() => {
  const m = deleteTarget.value
  if (!m) return ''
  return `${m.name || m.loginid} (${m.email || m.loginid}) 계정을 삭제하시겠습니까?\n삭제한 계정은 복구할 수 없습니다.`
})
async function confirmDelete() {
  const m = deleteTarget.value
  if (!m) return
  try {
    await api(`/me/members/${m.id}`, { method: 'DELETE' })
    await loadMembers()
    toast.add({ title: '계정이 삭제되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch (e) {
    toast.add({
      title: errStatus(e) === 409 ? '마지막 소유자는 삭제할 수 없습니다.' : '계정 삭제에 실패했습니다.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
  deleteTarget.value = null
}
</script>

<template>
  <div class="mu-panel">
    <!-- 본인 인증 안내 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>본인 인증 안내</h3>
        <button v-if="canManage" type="button" class="btn btn-primary btn-sm" @click="addOpen = true">
          <UIcon name="i-lucide-user-plus" class="text-[length:var(--fz-sm)]" />
          담당자 추가
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

    <!-- 멀티 계정 목록 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>멀티 계정</h3>
        <button v-if="canManage" type="button" class="btn btn-primary btn-sm" @click="addOpen = true">
          <UIcon name="i-lucide-user-plus" class="text-[length:var(--fz-sm)]" />
          담당자 추가
        </button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일(아이디)</th>
            <th style="width: 120px">권한</th>
            <th style="width: 80px">상태</th>
            <th style="width: 150px">최근 로그인</th>
            <th style="width: 150px">생성일</th>
            <th style="width: 150px">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.id">
            <td>
              {{ m.name || '-' }}
              <span v-if="m.id === myId" class="badge badge-neutral">본인</span>
            </td>
            <td>{{ m.email || m.loginid }}</td>
            <td>
              <select
                v-if="canManage && m.id !== myId && m.role !== 'owner'"
                class="select mu-role-select"
                :value="m.role"
                @change="changeRole(m, ($event.target as HTMLSelectElement).value as Role)"
              >
                <option value="admin">관리자</option>
                <option value="member">멤버</option>
              </select>
              <span v-else>{{ ROLE_LABEL[m.role] }}</span>
            </td>
            <td>
              <span class="badge" :class="m.status === 1 ? 'badge-success' : 'badge-neutral'">
                {{ m.status === 1 ? '활성' : '정지' }}
              </span>
            </td>
            <td class="mu-date">{{ fmtDateTime(m.lastLoginAt) }}</td>
            <td class="mu-date">{{ fmtDateTime(m.createdAt) }}</td>
            <td>
              <div v-if="canManage && m.id !== myId" class="mu-actions">
                <button type="button" class="btn btn-outline-dark btn-sm" @click="toggleStatus(m)">
                  {{ m.status === 1 ? '정지' : '활성화' }}
                </button>
                <button type="button" class="btn btn-sm mu-del" @click="deleteTarget = m">
                  삭제
                </button>
              </div>
              <span v-else class="mu-muted">—</span>
            </td>
          </tr>
          <tr v-if="!members.length">
            <td colspan="7" class="mu-empty">멀티 계정이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <AppManagerInviteDialog
      :open="addOpen"
      :submitting="adding"
      @close="addOpen = false"
      @submit="onSubmitMember"
    />
    <AppConfirmDialog
      :open="!!deleteTarget"
      title="멀티 계정 삭제"
      :message="deleteMessage"
      confirm-label="삭제"
      danger
      @close="deleteTarget = null"
      @confirm="confirmDelete"
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

.mu-role-select {
  height: 30px;
  padding: 0 8px;
  font-size: var(--fz-sm);
}
.mu-actions {
  display: flex;
  gap: 6px;
}
.mu-del {
  border: 1px solid var(--danger);
  color: var(--danger-ink);
  background: var(--white);
}
.mu-del:hover { background: #fef2f2; }
.mu-muted { color: var(--ink-300); }
</style>
