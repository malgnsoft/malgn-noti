<script setup lang="ts">
useHead({ title: 'PUSH 인증 관리' })

const fcmJson = ref('')
const apns = ref({ keyId: '', teamId: '', bundleId: '', env: 'Production', fileName: '' })
const adm = ref({ clientId: '', clientSecret: '' })

const apnsFileInput = ref<HTMLInputElement | null>(null)
function onPickApnsFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  apns.value.fileName = f?.name ?? ''
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        발신 정보 · PUSH 인증
      </div>
      <h1>PUSH 인증 관리</h1>
      <p>채널별 푸시 인증 정보를 등록해 Android · iOS · Kindle Fire 기기로 발송합니다.</p>
    </div>

    <div class="pc-board">
      <!-- FCM -->
      <AppPushCertSection
        label="FCM 인증 설정"
        title="FCM 서비스 계정 키 등록"
        toggle-label="서비스 계정 키 등록"
        :bullets="[
          'Android 기기에 푸시 알림 메시지를 전송하기 위해 유효한 FCM 서비스 계정 키(Service Account Credential) 정보를 입력하세요.',
          '자세한 내용은 [사용자 가이드]를 참고하세요.',
        ]"
      >
        <div class="pc-field pc-field--full">
          <label class="pc-field-label">서비스 계정 키 (JSON)</label>
          <textarea
            v-model="fcmJson"
            class="textarea"
            rows="6"
            placeholder='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"..."}'
          />
          <p class="pc-field-hint">
            Google Cloud Console에서 발급한 서비스 계정 키 JSON 전체를 붙여넣으세요.
          </p>
        </div>
      </AppPushCertSection>

      <!-- APNS -->
      <AppPushCertSection
        label="APNS 인증 설정"
        title="APNS JWT 인증서 등록"
        toggle-label="APNS JWT 인증서 등록"
        :bullets="[
          'iOS 기기에 푸시 알림 메시지를 전송하기 위해 Apple Developer 사이트에서 발급 받은 APNS JWT 인증서 정보를 입력하세요.',
          '자세한 내용은 [사용자 가이드]를 참고하세요.',
        ]"
      >
        <div class="pc-grid">
          <div class="pc-field">
            <label class="pc-field-label">Key ID</label>
            <input v-model="apns.keyId" class="input" placeholder="예: ABC123DEFG">
          </div>
          <div class="pc-field">
            <label class="pc-field-label">Team ID</label>
            <input v-model="apns.teamId" class="input" placeholder="예: 1A2B3C4D5E">
          </div>
          <div class="pc-field">
            <label class="pc-field-label">Bundle ID</label>
            <input v-model="apns.bundleId" class="input" placeholder="예: com.malgnsoft.app">
          </div>
          <div class="pc-field">
            <label class="pc-field-label">환경</label>
            <select v-model="apns.env" class="select">
              <option>Production</option>
              <option>Sandbox</option>
            </select>
          </div>
          <div class="pc-field pc-field--full">
            <label class="pc-field-label">인증 키 (.p8 파일)</label>
            <div class="pc-file-line">
              <input class="input" :value="apns.fileName" readonly placeholder="파일을 선택하세요">
              <input ref="apnsFileInput" type="file" accept=".p8" class="pc-file-hidden" @change="onPickApnsFile">
              <button type="button" class="btn btn-outline btn-sm" @click="apnsFileInput?.click()">
                <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 파일 선택
              </button>
            </div>
            <p class="pc-field-hint">
              .p8 형식의 APNs 인증 키 파일을 업로드하세요.
            </p>
          </div>
        </div>
      </AppPushCertSection>

      <!-- ADM -->
      <AppPushCertSection
        label="ADM 인증 설정"
        title="ADM 자격 증명 등록"
        toggle-label="자격 증명 등록"
        :bullets="[
          'Kindle Fire 앱에 푸시 알림 메시지를 전송하기 위해 클라이언트 정보를 입력하세요.',
          '자세한 내용은 [사용자 가이드]를 참고하세요.',
        ]"
      >
        <div class="pc-grid">
          <div class="pc-field">
            <label class="pc-field-label">Client ID</label>
            <input v-model="adm.clientId" class="input" placeholder="Amazon Developer Client ID">
          </div>
          <div class="pc-field">
            <label class="pc-field-label">Client Secret</label>
            <input v-model="adm.clientSecret" class="input" placeholder="Amazon Developer Client Secret">
          </div>
          <p class="pc-field-hint pc-field--full">
            Amazon Developer Portal에서 발급한 Client ID/Secret을 입력하세요.
          </p>
        </div>
      </AppPushCertSection>
    </div>
  </div>
</template>

<style scoped>
.pc-board {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 8px 24px 16px;
}

.pc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.pc-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.pc-field--full {
  grid-column: 1 / -1;
}
.pc-field-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-700);
}
.pc-field .input,
.pc-field .select,
.pc-field .textarea {
  width: 100%;
}
.pc-field-hint {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.pc-file-line {
  display: flex;
  gap: 6px;
}
.pc-file-line .input {
  flex: 1;
  min-width: 0;
}
.pc-file-hidden {
  display: none;
}
</style>
