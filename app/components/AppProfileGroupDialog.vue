<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const toast = useToast()

interface ProfileGroup {
  id: string
  name: string
  profileCount: number
  registeredAt: string
}

/* 그룹 상태는 세션 동안 유지 (백엔드 연동 시 교체) */
const groups = ref<ProfileGroup[]>([])
const groupName = ref('')

function addGroup() {
  const name = groupName.value.trim()
  if (!name) {
    toast.add({ title: '그룹 이름을 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (groups.value.some(g => g.name === name)) {
    toast.add({ title: '이미 등록된 그룹 이름입니다.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  groups.value = [
    {
      id: `g${Date.now()}`,
      name,
      profileCount: 0,
      registeredAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    },
    ...groups.value,
  ]
  groupName.value = ''
}

function removeGroup(id: string) {
  groups.value = groups.value.filter(g => g.id !== id)
}
</script>

<template>
  <AppModal :open="open" title="발신 프로필 그룹 관리" :width="560" @close="emit('close')">
    <p class="group-desc">여러 발신 프로필을 그룹으로 묶어 일괄 발송 시 활용할 수 있습니다.</p>

    <div class="add-row">
      <input
        v-model="groupName"
        class="input"
        placeholder="그룹 이름 입력"
        @keydown.enter="addGroup"
      >
      <button type="button" class="btn btn-primary" @click="addGroup">
        <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 그룹 추가
      </button>
    </div>

    <div class="group-table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>그룹 이름</th>
            <th>포함된 프로필 수</th>
            <th>등록 일시</th>
            <th class="th-manage">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in groups" :key="g.id">
            <td>{{ g.name }}</td>
            <td class="cell-mono">
              {{ g.profileCount }}
            </td>
            <td class="cell-mono">
              {{ g.registeredAt }}
            </td>
            <td class="th-manage">
              <button type="button" class="btn btn-error btn-sm" @click="removeGroup(g.id)">
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="!groups.length">
            <td colspan="4" class="empty-row">등록된 그룹이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="group-footer">
        <button type="button" class="btn btn-primary" style="min-width: 120px" @click="emit('close')">
          확인
        </button>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.group-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: 0 0 16px;
  line-height: 1.6;
}
.add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.add-row .input {
  flex: 1;
}
.group-table-wrap {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
}
.th-manage {
  width: 80px;
  text-align: center !important;
}
.empty-row {
  text-align: center;
  color: var(--ink-500);
  padding: 40px 12px !important;
}
.group-footer {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
