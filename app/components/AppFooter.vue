<script setup lang="ts">
const links = [
  { label: "회사소개", to: "#" },
  { label: "이용약관", to: "#" },
  { label: "스팸메시지 이용약관", to: "#" },
  { label: "개인정보 수집 및 이용동의", to: "#" },
  { label: "광고성 정보 수신 동의", to: "#" },
  { label: "요금신고내역", to: "#" },
];

const info = [
  "대표자 : 하근호",
  "사업자등록번호 : 119-86-39050",
  "통신판매업신고 제 : 000000000000000",
  "서울 구로구 디지털로 288 대륭포스트타워 1차 1701호",
  "이메일 : massage@malgnsoft.com",
  "개인정보보호책임자 : 김도형",
  "호스팅 제공자 : NHN CLOUD",
];
</script>

<template>
  <footer class="footer">
    <!-- 상단 -->
    <div class="footer-upper">
      <div class="footer-container">
        <div class="footer-upper-row">
          <div class="footer-brand-area">
            <NuxtLink to="/home" class="footer-logo-link">
              <UIcon
                name="i-lucide-message-square-text"
                class="footer-logo-icon"
              />
              <span class="footer-logo-name">맑은</span>
              <span class="footer-logo-msg">message</span>
            </NuxtLink>
            <div class="footer-slogan">
              대용량 메시지 기업용 전송 서비스입니다.
            </div>
          </div>

          <nav class="footer-links-area">
            <NuxtLink
              v-for="l in links"
              :key="l.label"
              :to="l.to"
              class="footer-link"
            >
              {{ l.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>
    </div>

    <!-- 하단 -->
    <div class="footer-lower">
      <div class="footer-container">
        <div class="footer-lower-row">
          <div class="footer-company">(주)맑은소프트</div>
          <div class="footer-details">
            <div class="footer-info">
              <span
                v-for="(item, i) in info"
                :key="i"
                class="footer-info-item"
                >{{ item }}</span
              >
            </div>
            <div class="footer-copy">© MALGNSOFT INC. ALL RIGHTS RESERVED.</div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
}

.footer-upper,
.footer-lower {
  background-color: #000000;
}

.footer-upper {
  padding: 28px 0;
}

.footer-lower {
  padding: 28px 0 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-container {
  max-width: 1200px;
  margin-inline: auto;
  padding: 0 24px;
}

.footer-upper-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px 40px;
}

.footer-brand-area {
  flex-shrink: 0;
  min-width: 200px;
}

.footer-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  margin-bottom: 6px;
}

.footer-logo-icon {
  font-size: 20px;
  color: var(--color-indigo);
  margin-right: 2px;
}

.footer-logo-name {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
}

.footer-logo-msg {
  font-size: 16px;
  font-weight: 300;
  color: #b0b7bf;
  margin-left: 2px;
}

.footer-logo-link:hover .footer-logo-name {
  color: #f0f0f0;
}

.footer-slogan {
  font-size: 13px;
  color: #b0b7bf;
}

.footer-links-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 48px;
  padding-top: 6px;
  flex: 1;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .footer-links-area {
    justify-content: flex-start;
    gap: 10px 24px;
  }
}

.footer-link {
  font-size: 15px;
  color: #ffffff;
  text-decoration: none;
  white-space: nowrap;
}
.footer-link:hover {
  color: #d4d8dc;
  text-decoration: underline;
}

.footer-lower-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px 60px;
}

.footer-company {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  letter-spacing: -1px;
  min-width: 200px;
  flex-shrink: 0;
}

.footer-details {
  flex: 1;
  min-width: 0;
}

.footer-info {
  font-size: 13px;
  color: #ffffff;
  line-height: 1.9;
  display: flex;
  flex-wrap: wrap;
  gap: 0 28px;
}

.footer-info-item {
  white-space: nowrap;
}

.footer-copy {
  font-size: 12px;
  color: #b0b7bf;
  margin-top: 8px;
  letter-spacing: 0.3px;
}
</style>
