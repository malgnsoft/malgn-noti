<script setup lang="ts">
const toast = useToast()

/* 저장된 설정 (목업 — 백엔드 연동 시 교체) */
const savedEnabled = ref(false)
const savedMethod = ref<'email' | 'phone'>('email')

/* 편집 중 값 */
const enabled = ref(savedEnabled.value)
const method = ref<'email' | 'phone'>(savedMethod.value)

const dirty = computed(() =>
  enabled.value !== savedEnabled.value
  || (enabled.value && method.value !== savedMethod.value),
)

const METHODS = [
  { value: 'email' as const, label: '이메일 인증', desc: '가입한 이메일로 인증코드를 발송합니다.', icon: 'i-lucide-mail' },
  { value: 'phone' as const, label: '휴대전화 인증', desc: '등록된 휴대전화로 인증코드를 발송합니다.', icon: 'i-lucide-smartphone' },
]

function save() {
  savedEnabled.value = enabled.value
  savedMethod.value = method.value
  toast.add({
    title: enabled.value ? '보안로그인이 설정되었습니다.' : '보안로그인이 해제되었습니다.',
    color: 'success',
    icon: 'i-lucide-circle-check',
  })
}
</script>

<template>
  <div class="sl-panel">
    <section class="ms-sec">
      <div class="ms-head">
        <h3>보안로그인 사용</h3>
      </div>

      <div class="sl-rows">
        <!-- 사용 여부 -->
        <div class="sl-row">
          <div class="sl-info">
            <span class="sl-title">보안로그인 사용 여부</span>
            <span class="sl-desc">로그인 시 추가 인증을 요구하여 계정 보안을 강화합니다.</span>
          </div>
          <div class="seg">
            <button type="button" :class="{ active: !enabled }" @click="enabled = false">
              사용안함
            </button>
            <button type="button" :class="{ active: enabled }" @click="enabled = true">
              사용
            </button>
          </div>
        </div>

        <!-- 인증 방식 (사용 시) -->
        <div v-if="enabled" class="sl-methods">
          <span class="sl-methods-label">인증 방식</span>
          <div class="sl-method-list">
            <label
              v-for="m in METHODS"
              :key="m.value"
              class="sl-method"
              :class="{ on: method === m.value }"
            >
              <input v-model="method" type="radio" :value="m.value">
              <UIcon :name="m.icon" class="sl-method-icon" />
              <span class="sl-method-text">
                <span class="sl-method-title">{{ m.label }}</span>
                <span class="sl-method-desc">{{ m.desc }}</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <div class="ms-actions">
      <button type="button" class="btn btn-primary btn-lg save-btn" :disabled="!dirty" @click="save">
        저장하기
      </button>
    </div>
  </div>
</template>

<style scoped>
.ms-head {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}

.sl-rows {
  display: flex;
  flex-direction: column;
}

/* 사용 여부 행 */
.sl-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
}
.sl-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.sl-title {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.sl-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.sl-row .seg { margin-left: auto; flex-shrink: 0; }

/* 인증 방식 */
.sl-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0 4px;
  border-top: 1px solid var(--line);
  margin-top: 4px;
}
.sl-methods-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-600);
  padding-top: 12px;
}
.sl-method-list {
  display: flex;
  gap: 10px;
}
.sl-method {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.sl-method:hover { border-color: var(--ink-300); }
.sl-method.on {
  border-color: var(--ink-900);
  background: var(--ink-50);
}
.sl-method input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--ink-300);
  border-radius: 50%;
  margin: 0;
  flex-shrink: 0;
  cursor: pointer;
  background: var(--white);
  transition: all 0.12s;
}
.sl-method input[type="radio"]:checked {
  border-color: var(--ink-900);
  background: var(--ink-900);
  box-shadow: inset 0 0 0 3.5px var(--white);
}
.sl-method-icon {
  font-size: var(--fz-xl);
  color: var(--ink-500);
  flex-shrink: 0;
}
.sl-method.on .sl-method-icon { color: var(--ink-900); }
.sl-method-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.sl-method-title {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.sl-method-desc {
  font-size: var(--fz-xs);
  color: var(--ink-500);
}

.ms-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}
.save-btn {
  min-width: 160px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .sl-method-list { flex-direction: column; }
}
</style>
