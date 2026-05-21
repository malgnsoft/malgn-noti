<script setup lang="ts">
interface ExportJob {
  id: string
  requestedAt: string
  expiresAt: string
  status: '처리 중' | '완료' | '만료'
}

const props = defineProps<{ open: boolean, jobs?: ExportJob[] }>()
const emit = defineEmits<{ close: [] }>()

/* 목업 — 백엔드 연동 시 useExportJob() 응답으로 교체 */
const DEFAULT_JOBS: ExportJob[] = [
  { id: '20260520122133uo9erdf', requestedAt: '2026-05-20 12:21', expiresAt: '2026-05-27 12:21', status: '처리 중' },
  { id: '20260219161504G4e5JF8ii40', requestedAt: '2026-02-19 16:15', expiresAt: '2026-02-26 16:15', status: '만료' },
  { id: '20260219160936vOJs19LFyy0', requestedAt: '2026-02-19 16:09', expiresAt: '2026-02-26 16:09', status: '만료' },
]
const list = computed(() => props.jobs ?? DEFAULT_JOBS)
</script>

<template>
  <AppModal :open="open" title="다운로드 요청 목록" :width="640" @close="emit('close')">
    <p class="export-note">
      요청한 지 7일이 지난 파일은 만료 처리됩니다.
    </p>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>요청 아이디</th>
            <th style="text-align: center">
              요청 일시
            </th>
            <th style="text-align: center">
              만료 일시
            </th>
            <th style="text-align: center">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in list" :key="j.id">
            <td class="cell-mono">
              {{ j.id }}
            </td>
            <td class="cell-mono" style="text-align: center">
              {{ j.requestedAt }}
            </td>
            <td class="cell-mono" style="text-align: center">
              {{ j.expiresAt }}
            </td>
            <td style="text-align: center">
              <span :class="['export-st', j.status === '만료' ? 'export-st--expired' : 'export-st--active']">
                {{ j.status }}
              </span>
            </td>
          </tr>
          <tr v-if="!list.length">
            <td colspan="4" style="text-align: center; padding: 40px 12px; color: var(--ink-500)">
              다운로드 요청 내역이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <div class="export-footer">
        <button type="button" class="btn btn-primary" @click="emit('close')">
          확인
        </button>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.export-note {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 12px;
}
.export-st {
  font-size: var(--fz-sm);
}
.export-st--active {
  color: var(--ink-900);
  font-weight: 500;
}
.export-st--expired {
  color: var(--ink-400);
}
.export-footer {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
