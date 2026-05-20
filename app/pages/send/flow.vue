<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: '복합 플로우 발송' })
const toast = useToast()
const router = useRouter()

interface FlowNode { ch: string, label: string, tag: string, from: string, purpose: string, type: string, subject: string, body: string }
interface Flow { name: string, nodes: FlowNode[] }

const FLOWS: Flow[] = [
  {
    name: 'djkim',
    nodes: [
      {
        ch: 'sms', label: 'SMS', tag: 'S', from: '1644-7143', purpose: '일반용', type: 'LMS',
        subject: '[위캔디오] 비디오팩 준비 완료 🎉',
        body: '#{name}님, 비디오팩을 시작할 준비가 끝났어요.\n바로 "첫 재생"까지 가는 가장 쉬운 3단계만 안내드릴게요.\n\n1. 영상 업로드\n2. 인코딩 요청\n3. 재생 링크/임베드 복사\n\n▶ 시작 가이드\nhttps://support.wecandeo.com/docs/videopack-guide-quick-start\n\n※ 본 메시지는 위캔디오에서 플랜 신청 후 상품이 생성된 고객에게 발송되는 이용 시작 안내입니다.'
      },
      {
        ch: 'kakao', label: '알림톡', tag: 'K', from: '@위캔디오', purpose: '일반용', type: '기본형',
        subject: '비디오팩 준비 완료',
        body: '#{name}님, 비디오팩 준비가 완료되었습니다. 콘솔에서 확인해 주세요.'
      }
    ]
  }
]

const flowName = ref('') // 처음 로드 시 미선택
const selectedFlow = computed(() => FLOWS.find(f => f.name === flowName.value) || null)
const activeNode = ref(0)
const node = computed(() => selectedFlow.value?.nodes[activeNode.value] ?? null)
const subject = ref('')
const body = ref('')

watch(flowName, () => {
  activeNode.value = 0
  const first = selectedFlow.value?.nodes[0]
  if (first) {
    subject.value = first.subject
    body.value = first.body
  }
  else {
    subject.value = ''
    body.value = ''
  }
  // 플로우가 바뀌어도 수신자 목록·치환자 값은 유지한다.
  // 치환자 입력 칸은 varKeys(선택된 플로우의 #{...})에 따라 표시/숨김만 전환된다.
})
watch(activeNode, (i) => {
  const n = selectedFlow.value?.nodes[i]
  if (!n) return
  subject.value = n.subject
  body.value = n.body
})

const substitutionMode = ref<'common' | 'individual'>('common')
const commonVars = ref<Record<string, string>>({})
// 선택된 플로우의 노드 본문에서 #{...} 치환자 키를 수집(미선택이면 빈 배열)
const varKeys = computed(() => {
  if (!selectedFlow.value) return []
  const set = new Set<string>()
  for (const n of selectedFlow.value.nodes) {
    const found = n.body.match(/#\{([^}]+)\}/g) || []
    for (const m of found) set.add(m.slice(2, -1))
  }
  return [...set]
})
const recipients = ref<Recipient[]>([])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)
const openManage = ref(false)

function onManualConfirm(r: Recipient) {
  recipients.value = editTarget.value
    ? recipients.value.map(x => x.id === r.id ? r : x)
    : [...recipients.value, r]
}
function send() {
  openConfirm.value = false
  toast.add({ title: '플로우 발송 시작', color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/sms'), 1000)
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · 복합 플로우
      </div>
      <h1>복합 플로우 발송</h1>
      <p>여러 채널을 순서대로 발송. 노드별 단가가 합산됩니다.</p>
    </div>

    <div class="flow-info">
      <UIcon name="i-lucide-info" class="text-base" style="color: var(--accent-ink); flex-shrink: 0; margin-top: 1px" />
      <div>
        <div>복합(플로우) 발송을 이용하시면 두 개 이상의 메시지를 발송할 수 있습니다.</div>
        <div>선택된 메시지를 동시에 발송하거나 1순위로 발송 설정한 메시지가 실패할 경우 순차적으로 다른 메시지 유형으로 발송할 수 있습니다.</div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px">
      <!-- 플로우 선택 -->
      <AppSendFormCard title="플로우 선택">
        <AppFormRow label="플로우 이름" required>
          <div class="row" style="gap: 8px; flex-wrap: wrap">
            <select v-model="flowName" class="select" style="min-width: 280px; flex: 1; max-width: 360px">
              <option value="">
                플로우를 선택하세요
              </option>
              <option value="djkim">
                djkim
              </option>
            </select>
            <button type="button" class="btn btn-primary btn-sm" @click="openManage = true">
              플로우 관리
            </button>
          </div>
        </AppFormRow>
      </AppSendFormCard>

      <!-- 수신자 설정 -->
      <AppRecipientCard
        title="수신자 설정"
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        v-model:substitution-mode="substitutionMode"
        v-model:common-vars="commonVars"
        :key-columns="['phone', 'email']"
        :show-vars="varKeys.length > 0"
        :var-keys="varKeys"
        :show-substitution="varKeys.length > 0"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <!-- 메시지 설정 -->
      <AppSendFormCard title="메시지 설정" required>
        <div class="msg-grid">
          <div class="col">
            <AppFormRow label="발송 순서" required>
              <div v-if="selectedFlow" class="flow-chips">
                <template v-for="(n, i) in selectedFlow.nodes" :key="i">
                  <div class="flow-chip" :class="{ active: activeNode === i }" @click="activeNode = i">
                    <span :class="['ch-tile', n.ch]" style="width: 18px; height: 18px; border-radius: 4px; font-size: var(--fz-2xs)">{{ n.tag }}</span>
                    {{ n.label }}
                  </div>
                  <span v-if="i < selectedFlow.nodes.length - 1" class="flow-arrow">
                    <UIcon name="i-lucide-chevron-right" class="text-sm" />
                  </span>
                </template>
              </div>
              <div v-else class="muted" style="font-size: var(--fz-sm)">
                플로우를 선택하세요.
              </div>
            </AppFormRow>
            <AppFormRow label="메시지 채널" required>
              <div class="row" style="gap: 8px; flex-wrap: wrap">
                <select
                  v-model.number="activeNode"
                  class="select"
                  style="min-width: 240px; flex: 1; max-width: 320px"
                  :disabled="!selectedFlow"
                >
                  <option v-if="!selectedFlow" :value="0">
                    플로우를 선택하세요
                  </option>
                  <option v-for="(n, i) in (selectedFlow?.nodes || [])" :key="i" :value="i">
                    {{ n.label }}
                  </option>
                </select>
                <button type="button" class="btn btn-primary btn-sm" @click="openManage = true">
                  플로우 관리
                </button>
              </div>
            </AppFormRow>
            <AppFormRow label="발신 번호">
              <div class="ro-text">
                {{ node?.from || '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="발송 목적">
              <div class="ro-text">
                {{ node?.purpose || '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="발송 유형">
              <div class="ro-text">
                {{ node?.type || '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="제목">
              <input v-model="subject" class="input" :disabled="!selectedFlow">
            </AppFormRow>
            <AppFormRow label="내용">
              <textarea v-model="body" class="textarea" rows="12" :disabled="!selectedFlow" />
            </AppFormRow>
          </div>
          <div>
            <div style="font-size: var(--fz-sm); color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <div style="display: grid; place-items: center">
              <AppKakaoPreview v-if="node?.ch === 'kakao'" :profile-name="node.from" :body="body" />
              <AppPhonePreview v-else :sender-name="node?.from || '발신번호'" :message="body" />
            </div>
          </div>
        </div>
      </AppSendFormCard>

      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="!selectedFlow || recipients.length === 0"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

    <AppFlowManageDialog :open="openManage" @close="openManage = false" />
    <AppAddressBookDialog
      :open="openAddrBook"
      :key-columns="['phone', 'email']"
      @close="openAddrBook = false"
      @confirm="(items) => recipients = [...recipients, ...items]"
    />
    <AppRecipientFormDialog
      :open="openManual"
      :edit="editTarget"
      :key-columns="['phone', 'email']"
      :var-keys="substitutionMode === 'individual' ? varKeys : []"
      @close="openManual = false"
      @confirm="onManualConfirm"
    />
    <AppConfirmDialog
      :open="openReset"
      title="초기화"
      message="입력 초기화"
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="() => { recipients = []; openReset = false }"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      :channel="`Flow (${selectedFlow?.nodes.length ?? 0}개 노드)`"
      :count="recipients.length"
      :price-per-unit="29.9"
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.flow-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: var(--accent-soft);
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: var(--r-lg);
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: var(--fz-md);
  color: var(--ink-700);
  line-height: 1.7;
}
.msg-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
.ro-text {
  font-size: var(--fz-md);
  color: var(--ink-800);
  padding-top: 2px;
}
</style>
