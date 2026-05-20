<script setup lang="ts">
const props = defineProps<{ open: boolean, domain?: string }>()
const emit = defineEmits<{ close: [] }>()

const toast = useToast()

const DKIM_VALUE = 'v=DKIM1;k=rsa;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCNPs/rndfDisqrjiHoXBQZJZSiafj8FgcPpMtP8u86zSAX4BUuKaqtzpnBG/Qf1i41wPPQ/B9p0vwUj8aPumuiWeLhhMaT4SZVM1cdZLfHs/dpOJ1ijSJcxLnZsDWZdk0aHrnqHbUgeF9YdOXJR/iTCTxEzArMNDFSeDA96hww+wIDAQAB'
const hostName = computed(() => `toast._domainkey.www.${props.domain || 'example.com'}`)

const verified = ref(false)
const dkimEnabled = ref(true)

watch(() => props.open, (v) => {
  if (v) {
    verified.value = false
    dkimEnabled.value = true
  }
})

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: `${label}을(를) 복사했습니다.`, icon: 'i-lucide-copy' })
  }
  catch {
    toast.add({ title: '복사에 실패했습니다.', icon: 'i-lucide-octagon-alert' })
  }
}
function onVerify() {
  verified.value = true
  toast.add({ title: 'DKIM 인증', description: 'DKIM 레코드 인증에 성공했습니다.', icon: 'i-lucide-circle-check' })
}
function onSave() {
  toast.add({
    title: 'DKIM 설정',
    description: `DKIM 사용 설정을 ${dkimEnabled.value ? '켰' : '껐'}습니다.`,
    icon: 'i-lucide-circle-check',
  })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="DKIM 설정" :width="620" @close="emit('close')">
    <div class="dk-card">
      <div class="dk-card-title">
        DKIM 레코드 인증
      </div>
      <p class="dk-desc">
        DKIM 레코드 인증을 통해 발신자 및 이메일 내용 등이 위변조되지 않았는지 수신자 측에서 검증할 수 있습니다.
      </p>

      <div class="dk-steps-label">
        [인증 절차 안내]
      </div>
      <ol class="dk-steps">
        <li>TXT 레코드는 도메인의 추가 정보를 제공하는 DNS(도메인 이름 시스템) 내 항목입니다.</li>
        <li>아래의 DNS 구성에 다음 TXT 레코드를 추가합니다.</li>
      </ol>

      <div class="dk-field">
        <div class="dk-field-label">
          • DNS 호스트 이름(TXT 레코드 이름)
        </div>
        <div class="dk-copy-line">
          <input class="input dk-mono" :value="hostName" readonly>
          <button type="button" class="btn btn-outline" @click="copy(hostName, 'DNS 호스트 이름')">
            복사
          </button>
        </div>
      </div>

      <div class="dk-field">
        <div class="dk-field-label">
          • TXT 레코드 값
        </div>
        <div class="dk-copy-line dk-copy-line--top">
          <textarea class="textarea dk-mono" :value="DKIM_VALUE" readonly rows="4" />
          <button type="button" class="btn btn-outline" @click="copy(DKIM_VALUE, 'TXT 레코드 값')">
            복사
          </button>
        </div>
      </div>

      <ol class="dk-steps" start="3">
        <li>{{ hostName }}에서 DNS TXT 레코드를 발견하면 DKIM 기능을 이용할 수 있습니다.</li>
        <li>등록을 확인한 뒤 콘솔에서 [인증]을 클릭하면 DKIM 레코드 인증이 완료됩니다.</li>
      </ol>
      <p class="dk-hint">
        <UIcon name="i-lucide-info" class="dk-hint-icon" /> DNS 변경이 적용되려면 시간이 다소 걸릴 수 있습니다.
      </p>

      <div class="dk-verify-row">
        <button type="button" class="btn btn-soft btn-sm" @click="onVerify">
          인증
        </button>
        <span v-if="verified" class="dk-verify-ok">
          <UIcon name="i-lucide-circle-check" /> 인증에 성공했습니다.
        </span>
      </div>
    </div>

    <div class="dk-divider" />
    <div class="dk-toggle-row">
      <span class="dk-toggle-label">
        DKIM 사용 설정
        <UIcon name="i-lucide-circle-help" class="dk-help" />
      </span>
      <button
        type="button"
        class="dk-switch"
        :class="{ on: dkimEnabled }"
        role="switch"
        :aria-checked="dkimEnabled"
        @click="dkimEnabled = !dkimEnabled"
      >
        <span class="dk-switch-thumb" />
      </button>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onSave">
        저장
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.dk-card {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 16px;
}
.dk-card-title {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
  margin-bottom: 8px;
}
.dk-desc {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.6;
  margin: 0 0 14px;
}
.dk-steps-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  margin-bottom: 6px;
}
.dk-steps {
  margin: 0 0 12px;
  padding-left: 20px;
  list-style: decimal;
}
.dk-steps li {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
}
.dk-field {
  margin-bottom: 12px;
}
.dk-field-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-700);
  margin-bottom: 5px;
}
.dk-copy-line {
  display: flex;
  gap: 6px;
  align-items: center;
}
.dk-copy-line--top {
  align-items: flex-start;
}
.dk-copy-line .input,
.dk-copy-line .textarea {
  flex: 1;
  min-width: 0;
}
.dk-mono {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
}
textarea.dk-mono {
  resize: none;
  line-height: 1.5;
  word-break: break-all;
}
.dk-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0 0 14px;
}
.dk-hint-icon {
  flex: none;
}
.dk-verify-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dk-verify-ok {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fz-sm);
  color: var(--accent-ink);
  font-weight: 500;
}

.dk-divider {
  height: 1px;
  background: var(--line);
  margin: 18px 0;
}
.dk-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dk-toggle-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-700);
}
.dk-help {
  font-size: var(--fz-sm);
  color: var(--ink-400);
}
.dk-switch {
  width: 40px;
  height: 22px;
  border-radius: var(--r-full);
  border: 0;
  background: var(--ink-200);
  padding: 0;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}
.dk-switch.on {
  background: var(--accent);
}
.dk-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: var(--r-full);
  background: var(--white);
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s;
}
.dk-switch.on .dk-switch-thumb {
  transform: translateX(18px);
}
</style>
