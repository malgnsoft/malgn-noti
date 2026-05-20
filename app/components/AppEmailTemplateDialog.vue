<script setup lang="ts">
import type { EmailTpl } from '~/types/template'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], pick: [EmailTpl] }>()

const FROM = 'no-reply@wecandeo.com'
const TEMPLATES: EmailTpl[] = [
  { id: 1, name: '01_상품생성시', subject: '[위캔디오] 상품이 정상적으로 생성되었습니다.', from: FROM, heading: '상품 생성이 완료되었습니다', body: '#{name}님, 신청하신 상품이 정상적으로 생성되었습니다.', buttonLabel: '콘솔로 이동' },
  { id: 2, name: '02-1_비디오팩생성2일경과', subject: '[위캔디오] 비디오팩 생성 2일 경과 안내', from: FROM, heading: '비디오팩을 확인해 주세요', body: '#{name}님, 비디오팩 생성 후 2일이 지났습니다. 아직 첫 영상을 등록하지 않으셨다면 시작 가이드를 확인해 주세요.', buttonLabel: '비디오팩 보기' },
  { id: 3, name: '02-2_비디오팩생성2일경과', subject: '[위캔디오] 비디오팩 생성 2일 경과 안내', from: FROM, heading: '비디오팩을 확인해 주세요', body: '#{name}님, 비디오팩 생성 후 2일이 지났습니다.', buttonLabel: '비디오팩 보기' },
  { id: 4, name: '03-1_비디오팩생성5일경과', subject: '[위캔디오] 비디오팩 생성 5일 경과 안내', from: FROM, heading: '비디오팩 활용을 도와드릴게요', body: '#{name}님, 비디오팩 생성 후 5일이 지났습니다.', buttonLabel: '가이드 보기' },
  { id: 5, name: '03-2_비디오팩생성5일경과', subject: '[위캔디오] 비디오팩 생성 5일 경과 안내', from: FROM, heading: '비디오팩 활용을 도와드릴게요', body: '#{name}님, 비디오팩 생성 후 5일이 지났습니다.', buttonLabel: '가이드 보기' },
  { id: 6, name: '2026년3월-뉴스레터', subject: '[위캔디오] 2026년 3월 뉴스레터', from: FROM, heading: '이달의 소식', body: '#{name}님, 3월 새 소식과 업데이트를 전해드립니다.', buttonLabel: '자세히 보기' },
  { id: 7, name: 'brand_ad_reception', subject: '[위캔디오] 광고성 정보 수신 안내', from: FROM, heading: '광고 수신 동의 안내', body: '#{name}님, 광고성 정보 수신에 동의해 주셔서 감사합니다.' },
  { id: 8, name: 'brand_email_change', subject: '[위캔디오] 이메일 주소 변경 확인', from: FROM, heading: '이메일이 변경되었습니다', body: '#{name}님, 계정 이메일 주소가 변경되었습니다. 본인이 아니라면 고객센터로 문의해 주세요.' },
  { id: 9, name: 'brand_login_verify', subject: '[위캔디오] 로그인 인증 코드', from: FROM, heading: '로그인 인증', body: '#{name}님, 로그인 인증 코드는 #{code} 입니다. 3분 이내에 입력해 주세요.' }
]

const search = ref('')
const picked = ref<EmailTpl | null>(TEMPLATES[0] ?? null)
const filtered = computed(() => TEMPLATES.filter(t => !search.value || t.name.includes(search.value)))

function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" title="템플릿 선택" :width="900" @close="emit('close')">
    <div style="display: grid; grid-template-columns: 320px 1fr; gap: 16px">
      <div>
        <div style="position: relative">
          <input
            v-model="search"
            class="input"
            placeholder="템플릿 이름을 입력하세요."
            style="padding-right: 32px"
          >
          <UIcon
            name="i-lucide-search"
            class="text-sm"
            style="position: absolute; right: 10px; top: 11px; color: var(--ink-400)"
          />
        </div>
        <div class="table-wrap" style="margin-top: 10px">
          <table class="table">
            <thead>
              <tr>
                <th style="text-align: center">
                  템플릿 이름
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in filtered"
                :key="t.id"
                :class="{ selected: picked?.id === t.id }"
                style="cursor: pointer"
                @click="picked = t"
              >
                <td>{{ t.name }}</td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td class="muted" style="text-align: center; padding: 28px 0">
                  검색 결과가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="row" style="justify-content: center; gap: 4px; margin-top: 12px">
          <button class="btn btn-outline btn-sm btn-icon" disabled>
            <UIcon name="i-lucide-chevrons-left" class="text-sm" />
          </button>
          <button class="btn btn-outline btn-sm btn-icon" disabled>
            <UIcon name="i-lucide-chevron-left" class="text-sm" />
          </button>
          <button class="btn btn-primary btn-sm" style="min-width: 30px; padding: 0">
            1
          </button>
          <button class="btn btn-outline btn-sm" style="min-width: 30px; padding: 0">
            2
          </button>
          <button class="btn btn-outline btn-sm" style="min-width: 30px; padding: 0">
            3
          </button>
          <button class="btn btn-outline btn-sm btn-icon">
            <UIcon name="i-lucide-chevron-right" class="text-sm" />
          </button>
          <button class="btn btn-outline btn-sm btn-icon">
            <UIcon name="i-lucide-chevrons-right" class="text-sm" />
          </button>
        </div>
      </div>

      <div>
        <AppEmailPreview
          v-if="picked"
          :subject="picked.subject"
          :from="picked.from"
          :heading="picked.heading"
          :body="picked.body"
          :button-label="picked.buttonLabel"
        />
        <AppEmptyState
          v-else
          icon="i-lucide-mail"
          title="템플릿을 선택해 주세요"
          desc="좌측 목록에서 이메일 템플릿을 고르세요."
        />
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!picked" @click="confirm">
        확인
      </button>
    </template>
  </AppModal>
</template>
