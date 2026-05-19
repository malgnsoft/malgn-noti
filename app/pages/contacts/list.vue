<script setup lang="ts">
useHead({ title: '주소록 / 연락처' })
const toast = useToast()
const router = useRouter()

const DATA = [
  { id: 1, name: '이수민', phone: '010-2345-6789', email: 'soomin.lee@example.com', group: 'VIP 고객', joined: '2024-09-12' },
  { id: 2, name: '박지훈', phone: '010-9876-5432', email: 'park.jihoon@example.com', group: '신규 가입', joined: '2026-05-15' },
  { id: 3, name: '최예진', phone: '010-3344-5566', email: 'yejin.choi@example.com', group: 'VIP 고객', joined: '2024-03-04' },
  { id: 4, name: '정민호', phone: '010-7788-9900', email: 'minho.jeong@example.com', group: '휴면 회원', joined: '2023-08-20' },
  { id: 5, name: '한지영', phone: '010-2233-4455', email: 'jiyoung.han@example.com', group: '신규 가입', joined: '2026-05-12' },
  { id: 6, name: '김도현', phone: '010-5566-7788', email: 'dohyun.kim@example.com', group: 'VIP 고객', joined: '2024-11-08' },
  { id: 7, name: '윤서연', phone: '010-1122-3344', email: 'seoyeon.yoon@example.com', group: '활성 고객', joined: '2025-02-14' },
  { id: 8, name: '강민재', phone: '010-9988-7766', email: 'minjae.kang@example.com', group: '활성 고객', joined: '2025-06-22' },
  { id: 9, name: '조하늘', phone: '010-4433-2211', email: 'haneul.cho@example.com', group: '수신거부', joined: '2024-05-30' }
]
const groups = [
  { id: 'all', name: '전체 연락처', count: DATA.length },
  { id: 'VIP 고객', name: 'VIP 고객', count: 3 },
  { id: '신규 가입', name: '신규 가입', count: 2 },
  { id: '활성 고객', name: '활성 고객', count: 2 },
  { id: '휴면 회원', name: '휴면 회원', count: 1 },
  { id: '수신거부', name: '수신거부', count: 1 }
]

const activeGroup = ref('all')
const search = ref('')
const selected = ref<number[]>([])

const filtered = computed(() => DATA.filter(c =>
  (activeGroup.value === 'all' || c.group === activeGroup.value)
  && (!search.value || (c.name + c.phone + c.email).includes(search.value))
))
function groupTone(g: string) {
  return g === 'VIP 고객' ? 'warning' : g === '수신거부' ? 'error' : 'sky'
}
function toggleAll(e: Event) {
  selected.value = (e.target as HTMLInputElement).checked ? filtered.value.map(c => c.id) : []
}
function toggleOne(id: number) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발송 관리 · 주소록
          </div>
          <h1>주소록 그룹 / 연락처</h1>
          <p>연락처를 그룹으로 관리하고 발송 시 빠르게 선택합니다.</p>
        </div>
        <div class="row" style="gap: 6px">
          <button class="btn btn-outline btn-sm">
            <UIcon name="i-lucide-upload" class="text-[12px]" /> CSV 가져오기
          </button>
          <button
            class="btn btn-primary btn-sm"
            @click="toast.add({ title: '연락처 추가 모달은 별도 화면에서 제공됩니다.', color: 'info', icon: 'i-lucide-info' })"
          >
            <UIcon name="i-lucide-plus" class="text-[12px]" /> 연락처 추가
          </button>
        </div>
      </div>
    </div>

    <div class="ct-grid">
      <aside>
        <div class="ct-aside-title">
          그룹
        </div>
        <div class="col" style="gap: 2px">
          <div
            v-for="g in groups"
            :key="g.id"
            class="ct-group"
            :class="{ on: activeGroup === g.id }"
            @click="activeGroup = g.id"
          >
            <span class="row" style="gap: 8px">
              <UIcon name="i-lucide-users" class="text-[14px]" />{{ g.name }}
            </span>
            <span class="muted num" style="font-size: 12px">{{ g.count }}</span>
          </div>
          <div class="h-divider" />
          <button class="btn btn-ghost btn-sm" style="justify-content: flex-start">
            <UIcon name="i-lucide-plus" class="text-[12px]" /> 새 그룹
          </button>
        </div>
      </aside>

      <div style="min-width: 0">
        <div class="filter-bar">
          <div style="position: relative; flex: 1">
            <UIcon name="i-lucide-search" class="text-sm" style="position: absolute; left: 10px; top: 11px; color: var(--ink-400)" />
            <input v-model="search" class="input" placeholder="이름 / 휴대폰 / 이메일 검색" style="padding-left: 32px">
          </div>
          <template v-if="selected.length > 0">
            <span class="muted" style="font-size: 12px">{{ selected.length }}명 선택됨</span>
            <button class="btn btn-outline btn-sm">
              <UIcon name="i-lucide-users" class="text-[12px]" /> 그룹 이동
            </button>
            <button class="btn btn-error btn-sm">
              <UIcon name="i-lucide-trash-2" class="text-[12px]" /> 삭제
            </button>
          </template>
          <button class="btn btn-soft btn-sm" @click="router.push('/send/sms')">
            <UIcon name="i-lucide-send" class="text-[12px]" /> 선택 발송
          </button>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 36px">
                  <label class="checkbox">
                    <input
                      type="checkbox"
                      :checked="selected.length === filtered.length && filtered.length > 0"
                      @change="toggleAll"
                    >
                  </label>
                </th>
                <th>이름</th><th>휴대폰</th><th>이메일</th><th>그룹</th><th>가입일</th>
                <th style="width: 48px" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in filtered" :key="c.id" :class="{ selected: selected.includes(c.id) }">
                <td>
                  <label class="checkbox"><input type="checkbox" :checked="selected.includes(c.id)" @change="toggleOne(c.id)"></label>
                </td>
                <td style="color: var(--ink-900)">
                  {{ c.name }}
                </td>
                <td class="cell-mono">
                  {{ c.phone }}
                </td>
                <td class="cell-mono" style="font-size: 12px">
                  {{ c.email }}
                </td>
                <td><AppBadge :tone="groupTone(c.group) as any">{{ c.group }}</AppBadge></td>
                <td class="muted">
                  {{ c.joined }}
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm btn-icon" aria-label="더보기">
                    <UIcon name="i-lucide-ellipsis-vertical" class="text-sm" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ct-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
}
@media (max-width: 1023px) {
  .ct-grid { grid-template-columns: 1fr; }
}
.ct-aside-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-400);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 4px 4px 12px;
}
.ct-group {
  padding: 10px 12px;
  border-radius: var(--r-md);
  cursor: pointer;
  color: var(--ink-700);
  font-weight: 500;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.12s;
}
.ct-group:hover { background: var(--ink-50); }
.ct-group.on {
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-weight: 600;
}
</style>
