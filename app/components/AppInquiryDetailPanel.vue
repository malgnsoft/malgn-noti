<script setup lang="ts">
const toast = useToast()

interface Comment {
  id: number
  author: string
  isAdmin: boolean
  time: string
  mention?: string
  body: string
  own?: boolean
  replies?: Comment[]
}

/* 문의 상세 (목업 — 백엔드 연동 시 교체) */
const inquiry = {
  status: '답변대기',
  channel: '결제',
  title: '1:1 문의 제목',
  time: '2026.05.20 14:32',
  comments: 10,
  source: '신고하기 또는 결제내역 > 문의하기 했을 경우 관련 정보 노출 영역',
  content: '온라인 강의는 단순히 콘텐츠를 잘 만드는 것만으로는 수익이 발생하지 않습니다. 수익이 나는 강의는 기획 단계부터 구조가 다르게 설계됩니다. 이번 심화 특강에서는 강의 상품을 기획할 때 반드시 고려해야 할 수익 구조 설계 방식을 다룹니다. 무료 콘텐츠와 유료 콘텐츠의 경계 설정 방식을 함께 살펴봅니다.',
  files: ['image.jpg', 'image.jpg'],
}

const REPLY_BODY = '해당 강의는 초보자도 수강할 수 있도록 구성되어 있습니다. 기본 개념부터 차근차근 설명하며, 중간중간 실무 예시를 함께 다루기 때문에 관련 경험이 없으신 분들도 따라오실 수 있습니다.\n다만, 용어 자체가 처음인 경우에는 초반 강의에서 다소 낯설게 느껴질 수는 있으나 강의를 순서대로 수강하시면 자연스럽게 이해하실 수 있도록 구성되어 있습니다. 기초부터 정리하고 싶은 분들께 특히 추천드립니다.'

const COMMENTS: Comment[] = [
  {
    id: 1,
    author: '관리자 닉네임',
    isAdmin: true,
    time: '1시간 전',
    body: REPLY_BODY,
  },
  {
    id: 2,
    author: '닉네임',
    isAdmin: false,
    time: '2026.05.20',
    mention: '닉네임',
    body: REPLY_BODY,
    own: true,
  },
  {
    id: 3,
    author: '관리자 닉네임',
    isAdmin: true,
    time: '2026.05.18',
    mention: '닉네임',
    body: REPLY_BODY,
    replies: [
      {
        id: 4,
        author: '닉네임',
        isAdmin: false,
        time: '방금 전',
        mention: '닉네임',
        body: REPLY_BODY,
        own: true,
      },
    ],
  },
]

function downloadFile(name: string) {
  toast.add({ title: `${name} 파일을 다운로드합니다.`, color: 'info', icon: 'i-lucide-download' })
}
function onReply() {
  toast.add({ title: '답글 작성', color: 'info', icon: 'i-lucide-corner-down-right' })
}
function onMenu() {
  toast.add({ title: '댓글 메뉴', color: 'info', icon: 'i-lucide-ellipsis-vertical' })
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
      <div class="iqd-head">
        <div class="iqd-head-top">
          <span class="badge badge-error">{{ inquiry.status }}</span>
          <button type="button" class="iqd-menu" aria-label="더보기" @click="onMenu">
            <UIcon name="i-lucide-ellipsis-vertical" />
          </button>
        </div>
        <p class="iqd-title">
          <span class="iqd-channel">{{ inquiry.channel }}</span>
          {{ inquiry.title }}
        </p>
        <div class="iqd-meta">
          <span class="iqd-meta-item"><UIcon name="i-lucide-clock" /> {{ inquiry.time }}</span>
          <span class="iqd-meta-item"><UIcon name="i-lucide-message-square" /> {{ inquiry.comments }}</span>
        </div>
      </div>

      <p class="iqd-source">{{ inquiry.source }}</p>

      <!-- 문의 내용 -->
      <div class="iqd-content">{{ inquiry.content }}</div>

      <!-- 첨부파일 -->
      <div class="iqd-files">
        <span class="iqd-files-label">첨부파일</span>
        <ul class="iqd-files-list">
          <li v-for="(f, i) in inquiry.files" :key="i">
            <span class="iqd-file-name">{{ f }}</span>
            <button type="button" class="iqd-file-dl" :aria-label="`${f} 다운로드`" @click="downloadFile(f)">
              <UIcon name="i-lucide-download" />
            </button>
          </li>
        </ul>
      </div>

      <div class="iqd-rule" />

      <!-- 댓글 -->
      <h4 class="iqd-comments-title">전체 {{ COMMENTS.length }}</h4>
      <ul class="iqd-comments">
        <li v-for="c in COMMENTS" :key="c.id" class="iqd-comment">
          <div class="iqd-c-head">
            <span class="iqd-avatar"><UIcon name="i-lucide-circle-user-round" /></span>
            <span class="iqd-c-author" :class="{ admin: c.isAdmin }">{{ c.author }}</span>
            <span class="iqd-c-time">{{ c.time }}</span>
            <div class="iqd-c-actions">
              <button type="button" class="iqd-c-reply" @click="onReply">답글</button>
              <button v-if="c.own" type="button" class="iqd-menu sm" aria-label="더보기" @click="onMenu">
                <UIcon name="i-lucide-ellipsis-vertical" />
              </button>
            </div>
          </div>
          <p class="iqd-c-body">
            <span v-if="c.mention" class="iqd-mention">@{{ c.mention }}</span>{{ c.body }}
          </p>

          <!-- 대댓글 -->
          <ul v-if="c.replies?.length" class="iqd-replies">
            <li v-for="r in c.replies" :key="r.id" class="iqd-reply">
              <div class="iqd-c-head">
                <span class="iqd-avatar"><UIcon name="i-lucide-circle-user-round" /></span>
                <span class="iqd-c-author" :class="{ admin: r.isAdmin }">{{ r.author }}</span>
                <span class="iqd-c-time">{{ r.time }}</span>
                <div class="iqd-c-actions">
                  <button type="button" class="iqd-c-reply" @click="onReply">답글</button>
                  <button v-if="r.own" type="button" class="iqd-menu sm" aria-label="더보기" @click="onMenu">
                    <UIcon name="i-lucide-ellipsis-vertical" />
                  </button>
                </div>
              </div>
              <p class="iqd-c-body">
                <span v-if="r.mention" class="iqd-mention">@{{ r.mention }}</span>{{ r.body }}
              </p>
            </li>
          </ul>
        </li>
      </ul>
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
</style>
