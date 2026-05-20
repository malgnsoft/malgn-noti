<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

type KeyCol = 'phone' | 'email' | 'token'

const props = withDefaults(defineProps<{
  open: boolean
  keyColumn?: KeyCol
  keyColumns?: KeyCol[]
}>(), { keyColumn: 'phone', keyColumns: undefined })

// 표시할 키 컬럼 배열(다중 컬럼 지원). 미지정 시 단일 keyColumn 사용
const cols = computed<KeyCol[]>(() => (props.keyColumns && props.keyColumns.length ? props.keyColumns : [props.keyColumn!]))
function headOf(c: KeyCol) {
  return c === 'phone' ? '휴대폰' : c === 'email' ? '이메일' : '토큰'
}
function valOf(item: { phone: string, email: string, token?: string }, c: KeyCol) {
  return c === 'phone' ? item.phone : c === 'email' ? item.email : (item.token || '—')
}

const emit = defineEmits<{ close: [], confirm: [Recipient[]] }>()

const individual = [
  { id: 101, name: '이수민', phone: '010-2345-6789', email: 'soomin.lee@example.com', token: 'fcm:d4Hg9kV2soomin-lee-7e3a8c', group: 'VIP 고객' },
  { id: 102, name: '박지훈', phone: '010-9876-5432', email: 'park.jihoon@example.com', token: 'fcm:a1Bf2Cmpark-jihoon-9b4c1d', group: '신규 가입' },
  { id: 103, name: '최예진', phone: '010-3344-5566', email: 'yejin.choi@example.com', token: 'apns:Yc83Hbxc7yejin-choi-2f5e9a', group: 'VIP 고객' },
  { id: 104, name: '정민호', phone: '010-7788-9900', email: 'minho.jeong@example.com', token: 'fcm:Q9pLm2Vminho-jeong-6c2d8b', group: '휴면 회원' },
  { id: 105, name: '한지영', phone: '010-2233-4455', email: 'jiyoung.han@example.com', token: 'apns:Kt94Nbm3jiyoung-han-1e9d6f', group: '신규 가입' },
  { id: 106, name: '김도현', phone: '010-5566-7788', email: 'dohyun.kim@example.com', token: 'fcm:Pz58Ldb4dohyun-kim-8a3e2c', group: 'VIP 고객' },
  { id: 107, name: '윤서연', phone: '010-1122-3344', email: 'seoyeon.yoon@example.com', token: 'fcm:Vn19Rxm6seoyeon-yoon-4b7d3a', group: '활성 고객' },
  { id: 108, name: '강민재', phone: '010-9988-7766', email: 'minjae.kang@example.com', token: 'apns:Hg42Wcm5minjae-kang-9f6c8e', group: '활성 고객' }
]
const groups = [
  { id: 1, name: 'VIP 고객', count: 142, desc: '최근 30일 내 3회 이상 구매' },
  { id: 2, name: '신규 가입', count: 38, desc: '지난 7일간 가입' },
  { id: 3, name: '휴면 회원', count: 267, desc: '90일간 미접속' },
  { id: 4, name: '활성 고객', count: 1024, desc: '월 1회 이상 접속' },
  { id: 5, name: '장바구니 보유', count: 89, desc: '결제 미완료 항목 있음' }
]

const tab = ref<'individual' | 'group'>('individual')
const search = ref('')
const picked = ref<number[]>([])
const pickedGroups = ref<number[]>([])

watch(() => props.open, (v) => {
  if (v) { picked.value = []; pickedGroups.value = []; search.value = '' }
})

const filteredIndividual = computed(() => individual.filter(i =>
  !search.value || (i.name + i.phone + i.email).toLowerCase().includes(search.value.toLowerCase())))
const filteredGroups = computed(() => groups.filter(g =>
  !search.value || (g.name + g.desc).toLowerCase().includes(search.value.toLowerCase())))

const total = computed(() => tab.value === 'individual'
  ? picked.value.length
  : pickedGroups.value.reduce((s, gid) => s + (groups.find(g => g.id === gid)?.count || 0), 0))

function togglePick(id: number) {
  if (tab.value === 'individual') {
    picked.value = picked.value.includes(id) ? picked.value.filter(x => x !== id) : [...picked.value, id]
  }
  else {
    pickedGroups.value = pickedGroups.value.includes(id) ? pickedGroups.value.filter(x => x !== id) : [...pickedGroups.value, id]
  }
}
function confirm() {
  let chosen: Recipient[] = []
  if (tab.value === 'individual') {
    chosen = individual.filter(i => picked.value.includes(i.id)).map(i => ({ ...i, id: `ab-${i.id}-${Date.now()}` }))
  }
  else {
    chosen = pickedGroups.value.flatMap((gid) => {
      const g = groups.find(x => x.id === gid)
      if (!g) return []
      return Array.from({ length: Math.min(g.count, 5) }, (_, i) => ({
        id: `g-${gid}-${i}-${Date.now()}`,
        name: `${g.name} #${i + 1}`,
        phone: `010-${1000 + Math.floor(Math.random() * 9000)}-${1000 + Math.floor(Math.random() * 9000)}`,
        email: `${g.name.replace(/ /g, '').toLowerCase()}${i + 1}@example.com`,
        token: `fcm:${Math.random().toString(36).slice(2, 14)}${g.name.replace(/ /g, '').toLowerCase()}-${i + 1}`
      }))
    })
  }
  emit('confirm', chosen)
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="주소록 선택" :width="800" @close="emit('close')">
    <div class="tabs" style="margin-bottom: 16px">
      <div :class="['tab', { active: tab === 'individual' }]" @click="tab = 'individual'">
        개별 선택
      </div>
      <div :class="['tab', { active: tab === 'group' }]" @click="tab = 'group'">
        그룹 선택
      </div>
    </div>
    <div class="row" style="margin-bottom: 12px">
      <div style="position: relative; flex: 1; max-width: 320px">
        <UIcon
          name="i-lucide-search"
          class="text-sm"
          style="position: absolute; left: 10px; top: 11px; color: var(--ink-400)"
        />
        <input
          v-model="search"
          class="input"
          style="padding-left: 32px"
          :placeholder="tab === 'individual' ? '이름 / 전화번호 / 이메일 검색' : '그룹명 검색'"
        >
      </div>
    </div>
    <div class="table-wrap" style="max-height: 360px; overflow: auto">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px" />
            <template v-if="tab === 'individual'">
              <th>이름</th>
              <th v-for="c in cols" :key="c">
                {{ headOf(c) }}
              </th>
              <th>소속 그룹</th>
            </template>
            <template v-else>
              <th>그룹명</th>
              <th>연락처 수</th>
              <th>설명</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <template v-if="tab === 'individual'">
            <tr
              v-for="item in filteredIndividual"
              :key="item.id"
              :class="{ selected: picked.includes(item.id) }"
              style="cursor: pointer"
              @click="togglePick(item.id)"
            >
              <td>
                <span class="checkbox">
                  <input type="checkbox" :checked="picked.includes(item.id)" tabindex="-1" style="pointer-events: none">
                </span>
              </td>
              <td>{{ item.name }}</td>
              <td v-for="c in cols" :key="c" class="cell-mono">
                {{ valOf(item, c) }}
              </td>
              <td><AppBadge tone="sky">{{ item.group }}</AppBadge></td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="g in filteredGroups"
              :key="g.id"
              :class="{ selected: pickedGroups.includes(g.id) }"
              style="cursor: pointer"
              @click="togglePick(g.id)"
            >
              <td>
                <span class="checkbox">
                  <input type="checkbox" :checked="pickedGroups.includes(g.id)" tabindex="-1" style="pointer-events: none">
                </span>
              </td>
              <td>{{ g.name }}</td>
              <td class="cell-mono">
                <strong>{{ g.count.toLocaleString() }}</strong>명
              </td>
              <td class="muted">
                {{ g.desc }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <template #footer>
      <div class="muted" style="margin-right: auto; font-size: 13px">
        선택: <strong style="color: var(--accent-ink)">{{ total.toLocaleString() }}명</strong>
      </div>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="total === 0" @click="confirm">
        확인
      </button>
    </template>
  </AppModal>
</template>
