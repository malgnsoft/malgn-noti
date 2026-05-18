<script setup lang="ts">
const links = [
  { label: '이용약관', to: '#', strong: true },
  { label: '개인정보처리방침', to: '#' },
  { label: '스팸메시지 이용약관', to: '#' },
  { label: '광고성 정보 수신 동의', to: '#' },
  { label: '요금신고내역', to: '#' },
  { label: '고객센터', to: '/inquiry' }
]

const info = [
  '대표자: 하근호',
  '사업자등록번호 119-86-39050',
  '통신판매업신고 제0000-서울구로-00000호',
  '서울 구로구 디지털로 288 대륭포스트타워 1차 1701호',
  '이메일: massage@malgnsoft.com',
  '개인정보보호책임자: 김도형'
]
</script>

<template>
  <footer class="footer">
    <div class="footer-upper">
      <div class="footer-upper-inner">
        <div class="footer-logo">
          <NuxtLink to="/home" class="name-row">
            <span class="name">맑은</span>
            <span class="msg">메시징</span>
          </NuxtLink>
          <div class="footer-slogan">
            기업의 모든 메시지를 한 곳에서
          </div>
        </div>
        <nav class="footer-links">
          <NuxtLink
            v-for="l in links"
            :key="l.label"
            :to="l.to"
            :class="['', l.strong ? 'strong' : '']"
          >
            {{ l.label }}
          </NuxtLink>
        </nav>
      </div>
    </div>
    <div class="footer-lower">
      <div class="footer-lower-inner">
        <div class="footer-company-name">
          (주)맑은소프트
        </div>
        <div class="footer-meta">
          <span v-for="i in info" :key="i">{{ i }}</span>
          <span class="footer-copy">© 2026 Malgn Soft Inc. All rights reserved.</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-copy {
  width: 100%;
  margin-top: 8px;
  color: var(--ink-300);
}
</style>
