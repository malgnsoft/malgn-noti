<script setup lang="ts">
import type { RcsTpl } from '~/types/template'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], pick: [RcsTpl] }>()

const TEMPLATES: RcsTpl[] = [
  { id: 1, name: '01_비디오팩생성', purpose: 'info', msgType: 'lms', deliveryType: 'standalone', fallback: 'sms', expiry: '24h', hasImage: true, body: '#{name}님, 비디오팩 생성이 완료되었습니다.\n콘솔에서 바로 첫 영상을 업로드해 보세요.', buttons: [{ type: 'web', label: '시작 가이드' }] },
  { id: 2, name: '02-1_비디오팩생성2일경과_upload_N', purpose: 'info', msgType: 'lms', deliveryType: 'standalone', fallback: 'sms', expiry: '24h', body: '#{name}님, 아직 영상이 업로드되지 않았어요.\n첫 영상을 올리고 비디오팩을 시작해 보세요.', buttons: [{ type: 'web', label: '영상 업로드' }] },
  { id: 3, name: '02-2_비디오팩생성2일경과_upload_Y', purpose: 'info', msgType: 'lms', deliveryType: 'standalone', fallback: 'sms', expiry: '24h', body: '#{name}님, 업로드해 주셔서 감사합니다.\n이제 인코딩을 요청하면 재생 링크가 생성됩니다.', buttons: [{ type: 'web', label: '인코딩 요청' }] },
  { id: 4, name: '03-1_비디오팩생성5일경과_upload_N', purpose: 'info', msgType: 'sms', deliveryType: 'standalone', fallback: 'sms', expiry: '24h', body: '#{name}님, 비디오팩을 아직 사용하지 않으셨어요.\n5분이면 첫 재생까지 끝낼 수 있습니다.', buttons: [{ type: 'web', label: '빠른 시작' }] },
  { id: 5, name: '03-2_비디오팩생성5일경과_upload_Y', purpose: 'info', msgType: 'lms', deliveryType: 'standalone', fallback: 'sms', expiry: '24h', body: '#{name}님, 재생 링크를 복사해 사이트에 임베드해 보세요.\n임베드 가이드를 확인하실 수 있습니다.', buttons: [{ type: 'web', label: '임베드 가이드' }] },
  { id: 6, name: '04_만기1일전', purpose: 'info', msgType: 'lms', deliveryType: 'standalone', fallback: 'sms', expiry: '1h', body: '#{name}님, 비디오팩 이용 기간이 내일 만료됩니다.\n중단 없이 사용하시려면 기간을 연장해 주세요.', buttons: [{ type: 'web', label: '기간 연장' }] },
  { id: 7, name: '05_기간만료', purpose: 'info', msgType: 'lms', deliveryType: 'conversation', fallback: 'integrated', expiry: '24h', body: '#{name}님, 비디오팩 이용 기간이 만료되었습니다.\n재구독 시 기존 데이터가 그대로 유지됩니다.', buttons: [{ type: 'web', label: '재구독하기' }] },
  { id: 8, name: '06-1_사용량초과_스토리지_무료플랜', purpose: 'info', msgType: 'lms', deliveryType: 'standalone', fallback: 'sms', expiry: '24h', body: '#{name}님, 무료 플랜 스토리지 용량을 초과했습니다.\n계속 이용하시려면 플랜 업그레이드를 검토해 주세요.', buttons: [{ type: 'web', label: '플랜 보기' }] },
  { id: 9, name: '06-2_사용량초과_스토리지_구독플랜', purpose: 'info', msgType: 'lms', deliveryType: 'standalone', fallback: 'sms', expiry: '24h', body: '#{name}님, 구독 플랜 스토리지 용량을 초과했습니다.\n추가 용량을 신청하시면 즉시 반영됩니다.', buttons: [{ type: 'web', label: '용량 추가' }] }
]

const search = ref('')
const picked = ref<RcsTpl | null>(null)
const filtered = computed(() => TEMPLATES.filter(t => !search.value || t.name.includes(search.value)))

function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" title="템플릿 선택" :width="720" @close="emit('close')">
    <div style="display: grid; grid-template-columns: 1fr 280px; gap: 16px">
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
        <div class="table-wrap" style="margin-top: 10px; max-height: 360px; overflow: auto">
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
      </div>
      <div class="rcs-tpl-side">
        RCS Biz Center 템플릿 유형은<br>미리보기를 지원하지 않습니다.
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" :disabled="!picked" @click="confirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.rcs-tpl-side {
  display: grid;
  place-items: center;
  text-align: center;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 20px;
  font-size: 12px;
  color: var(--ink-500);
  line-height: 1.7;
}
</style>
