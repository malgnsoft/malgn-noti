<script setup lang="ts">
interface FlowTplItem { name: string, channel: string }

const props = defineProps<{ open: boolean, channel: string }>()
const emit = defineEmits<{ close: [], confirm: [string] }>()
const toast = useToast()

// 채널별 샘플 템플릿(목업)
const ALL: FlowTplItem[] = [
  { name: '01_비디오팩생성', channel: 'SMS' },
  { name: '02_회원가입환영', channel: 'SMS' },
  { name: '03_결제완료안내', channel: 'SMS' },
  { name: '01_가입환영_알림톡', channel: '알림톡' },
  { name: '02_주문완료_알림톡', channel: '알림톡' },
  { name: '03_배송안내_알림톡', channel: '알림톡' },
  { name: '01_가입환영_이메일', channel: '이메일' },
  { name: '01_앱푸시안내', channel: 'PUSH' }
]

const search = ref('')
const picked = ref('')

watch(() => props.open, (v) => {
  if (v) { search.value = ''; picked.value = '' }
})

const filtered = computed(() => ALL.filter(t =>
  t.channel === props.channel && (!search.value || t.name.includes(search.value))
))

function confirm() {
  if (!picked.value) {
    toast.add({ title: '템플릿을 선택하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  emit('confirm', picked.value)
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="템플릿 선택" :width="480" @close="emit('close')">
    <div class="ftp-search">
      <input v-model="search" class="input" placeholder="템플릿 이름을 입력하세요.">
      <UIcon name="i-lucide-search" class="text-sm ftp-search-ico" />
    </div>
    <div class="table-wrap" style="max-height: 320px; overflow: auto">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px" />
            <th style="text-align: center">
              템플릿 이름
            </th>
            <th style="width: 90px; text-align: center">
              채널
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in filtered"
            :key="t.name"
            :class="{ selected: picked === t.name }"
            style="cursor: pointer"
            @click="picked = t.name"
          >
            <td>
              <span class="ftp-radio" :class="{ on: picked === t.name }" />
            </td>
            <td style="text-align: center">
              {{ t.name }}
            </td>
            <td style="text-align: center">
              {{ t.channel }}
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="3" class="muted" style="text-align: center; padding: 28px 0">
              {{ channel ? '검색 결과가 없습니다.' : '메시지 채널을 먼저 선택하세요.' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" @click="confirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.ftp-search {
  position: relative;
  margin-bottom: 12px;
}
.ftp-search .input {
  padding-right: 36px;
}
.ftp-search-ico {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
}
.ftp-radio {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--ink-300);
  border-radius: 50%;
  background: var(--white);
  position: relative;
  vertical-align: middle;
}
.ftp-radio.on {
  border-color: var(--accent-ink);
}
.ftp-radio.on::after {
  content: '';
  position: absolute;
  inset: 2px;
  background: var(--accent-ink);
  border-radius: 50%;
}
</style>
