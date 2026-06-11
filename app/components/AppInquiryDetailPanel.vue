<script setup lang="ts">
const toast = useToast()
const api = useApi()
const auth = useAuthStore()
const route = useRoute()
const id = computed(() => Number(route.params.id))

type Status = 'wait' | 'progress' | 'done'
const STATUS_META: Record<Status, { label: string, badge: string }> = {
  wait: { label: '답변대기', badge: 'badge-error' },
  progress: { label: '답변중', badge: 'badge-success' },
  done: { label: '답변완료', badge: 'badge-neutral' },
}
const PRODUCT_LABEL: Record<string, string> = {
  all: '전체', sms: 'SMS', rcs: 'RCS', kakao: '카카오톡', email: '이메일', push: 'PUSH',
}
const TYPE_LABEL: Record<string, string> = {
  product: '상품', payment: '결제', partner: '제휴', etc: '기타',
}

interface InquiryRow {
  id: number
  inquiryType: string
  productType: string | null
  title: string
  body: string
  answerState: Status
  createdAt: string
}
interface ReplyRow {
  id: number
  parentReplyId: number | null
  authorUserId: number | null
  authorName: string
  adminYn: 'Y' | 'N'
  body: string
  createdAt: string
}
interface Comment {
  id: number
  author: string
  isAdmin: boolean
  time: string
  body: string
  own: boolean
  replies: Comment[]
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function channelOf(r: InquiryRow): string {
  const product = r.productType && r.productType !== 'all' ? PRODUCT_LABEL[r.productType] : undefined
  if (product) return product
  return TYPE_LABEL[r.inquiryType] ?? '문의'
}

const inquiry = ref<{ status: Status, statusLabel: string, badge: string, channel: string, title: string, time: string, content: string } | null>(null)
const comments = ref<Comment[]>([])

function toComment(r: ReplyRow): Comment {
  return {
    id: r.id,
    author: r.authorName,
    isAdmin: r.adminYn === 'Y',
    time: fmtDateTime(r.createdAt),
    body: r.body,
    own: r.authorUserId != null && r.authorUserId === auth.user?.id,
    replies: [],
  }
}

const totalComments = computed(() => {
  let n = 0
  const count = (list: Comment[]) => { for (const c of list) { n++; count(c.replies) } }
  count(comments.value)
  return n
})

async function loadInquiry() {
  const res = await api<{ data: InquiryRow }>(`/inquiries/${id.value}`)
  const r = res.data
  const meta = STATUS_META[r.answerState] ?? STATUS_META.wait
  inquiry.value = {
    status: r.answerState,
    statusLabel: meta.label,
    badge: meta.badge,
    channel: channelOf(r),
    title: r.title,
    time: fmtDateTime(r.createdAt),
    content: r.body,
  }
}
async function loadReplies() {
  const res = await api<{ data: ReplyRow[] }>(`/inquiries/${id.value}/replies`)
  const byId = new Map<number, Comment>()
  for (const row of res.data) byId.set(row.id, toComment(row))
  const roots: Comment[] = []
  for (const row of res.data) {
    const c = byId.get(row.id)!
    if (row.parentReplyId && byId.has(row.parentReplyId)) byId.get(row.parentReplyId)!.replies.push(c)
    else roots.push(c)
  }
  comments.value = roots
}

async function loadAll() {
  await Promise.all([loadInquiry(), loadReplies()])
}

// SSR에서 실패해도 죽지 않도록 swallow — client mount 시 재시도.
try { await loadAll() }
catch { /* ignore */ }
onMounted(() => {
  if (!inquiry.value) loadAll().catch(() => {
    toast.add({ title: '문의 내역을 불러오지 못했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  })
})

/* 답변 작성 */
const replyBody = ref('')
const submitting = ref(false)
async function submitReply() {
  const body = replyBody.value.trim()
  if (!body || submitting.value) return
  submitting.value = true
  try {
    await api(`/inquiries/${id.value}/replies`, { method: 'POST', body: { body } })
    replyBody.value = ''
    await loadAll()
    toast.add({ title: '답변이 등록되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch {
    toast.add({ title: '답변 등록에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    submitting.value = false
  }
}
function goList() {
  navigateTo('/account/inquiries')
}
</script>

<template>
  <div class="iqd-panel">
    <section class="ms-sec">
      <div class="ms-head">
        <h3>문의 내역</h3>
        <button type="button" class="btn btn-outline-dark btn-sm" @click="goList">
          <UIcon name="i-lucide-arrow-left" class="text-[length:var(--fz-sm)]" /> 목록
        </button>
      </div>

      <!-- 문의 헤더 -->
      <div v-if="inquiry" class="iqd-head">
        <div class="iqd-head-top">
          <span class="badge" :class="inquiry.badge">{{ inquiry.statusLabel }}</span>
        </div>
        <p class="iqd-title">
          <span class="iqd-channel">{{ inquiry.channel }}</span>
          {{ inquiry.title }}
        </p>
        <div class="iqd-meta">
          <span class="iqd-meta-item"><UIcon name="i-lucide-clock" /> {{ inquiry.time }}</span>
          <span class="iqd-meta-item"><UIcon name="i-lucide-message-square" /> {{ totalComments }}</span>
        </div>
      </div>

      <!-- 문의 내용 -->
      <div v-if="inquiry" class="iqd-content">{{ inquiry.content }}</div>
      <div v-else class="iqd-empty">문의 내역을 불러오는 중입니다.</div>

      <div class="iqd-rule" />

      <!-- 댓글 -->
      <h4 class="iqd-comments-title">전체 {{ totalComments }}</h4>
      <ul class="iqd-comments">
        <li v-for="c in comments" :key="c.id" class="iqd-comment">
          <div class="iqd-c-head">
            <span class="iqd-avatar"><UIcon name="i-lucide-circle-user-round" /></span>
            <span class="iqd-c-author" :class="{ admin: c.isAdmin }">{{ c.author }}</span>
            <span class="iqd-c-time">{{ c.time }}</span>
          </div>
          <p class="iqd-c-body">{{ c.body }}</p>

          <!-- 대댓글 -->
          <ul v-if="c.replies.length" class="iqd-replies">
            <li v-for="r in c.replies" :key="r.id" class="iqd-reply">
              <div class="iqd-c-head">
                <span class="iqd-avatar"><UIcon name="i-lucide-circle-user-round" /></span>
                <span class="iqd-c-author" :class="{ admin: r.isAdmin }">{{ r.author }}</span>
                <span class="iqd-c-time">{{ r.time }}</span>
              </div>
              <p class="iqd-c-body">{{ r.body }}</p>
            </li>
          </ul>
        </li>
        <li v-if="!comments.length" class="iqd-empty">아직 등록된 답변이 없습니다.</li>
      </ul>

      <!-- 답변 작성 -->
      <div class="iqd-compose">
        <textarea
          v-model="replyBody"
          class="textarea iqd-compose-input"
          rows="3"
          placeholder="답변을 입력해 주세요."
          @keydown.meta.enter="submitReply"
          @keydown.ctrl.enter="submitReply"
        />
        <div class="iqd-compose-actions">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="!replyBody.trim() || submitting"
            @click="submitReply"
          >
            <UIcon name="i-lucide-corner-down-right" class="text-[length:var(--fz-sm)]" /> 답변 등록
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ms-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.ms-head .btn { margin-left: auto; }

/* 문의 헤더 */
.iqd-head-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.iqd-menu {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-400);
  font-size: var(--fz-md);
}
.iqd-menu.sm { width: 24px; height: 24px; }
.iqd-menu:hover { background: var(--ink-100); color: var(--ink-900); }

.iqd-title {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 8px;
}
.iqd-channel {
  color: var(--accent-ink);
  margin-right: 4px;
}
.iqd-meta {
  display: flex;
  gap: 16px;
}
.iqd-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

.iqd-source {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 20px 0 10px;
}

/* 문의 내용 */
.iqd-content {
  padding: 24px;
  min-height: 200px;
  background: var(--ink-50);
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  color: var(--ink-700);
  line-height: 1.75;
  white-space: pre-line;
}

/* 첨부파일 */
.iqd-files {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}
.iqd-files-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-600);
  padding-top: 2px;
}
.iqd-files-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.iqd-files-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.iqd-file-name {
  font-size: var(--fz-sm);
  color: var(--ink-700);
}
.iqd-file-dl {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--ink-400);
  font-size: var(--fz-sm);
}
.iqd-file-dl:hover { background: var(--ink-100); color: var(--ink-900); }

.iqd-rule {
  height: 1px;
  background: var(--line);
  margin: 24px 0;
}

/* 댓글 */
.iqd-comments-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 14px;
}
.iqd-comments {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.iqd-comment {
  padding: 16px 18px;
  background: var(--ink-50);
  border-radius: var(--r-md);
}

.iqd-c-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.iqd-avatar {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--white);
  color: var(--ink-400);
  font-size: var(--fz-lg);
  flex-shrink: 0;
}
.iqd-c-author {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--ink-900);
}
.iqd-c-author.admin { color: var(--ink-900); }
.iqd-c-time {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.iqd-c-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.iqd-c-reply {
  border: 0;
  background: transparent;
  padding: 2px 4px;
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-500);
}
.iqd-c-reply:hover { color: var(--ink-900); }

.iqd-c-body {
  font-size: var(--fz-sm);
  color: var(--ink-700);
  line-height: 1.7;
  margin: 0;
  white-space: pre-line;
}
.iqd-mention {
  color: var(--accent-ink);
  font-weight: 600;
  margin-right: 3px;
}

/* 대댓글 */
.iqd-replies {
  list-style: none;
  margin: 12px 0 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--line);
}
.iqd-reply {
  padding: 14px 16px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
.iqd-reply + .iqd-reply { margin-top: 8px; }

.iqd-empty {
  padding: 32px 0;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-400);
}

/* 답변 작성 */
.iqd-compose {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}
.iqd-compose-input {
  width: 100%;
  resize: vertical;
}
.iqd-compose-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>
