<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '회원가입' })

const toast = useToast()
const step = ref(1)

function next() {
  if (step.value < 3) { step.value++; return }
  toast.add({ title: '가입이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  navigateTo('/home')
}
const subtitle = computed(() =>
  step.value === 1 ? '기본 정보를 입력해 주세요.'
    : step.value === 2 ? '기업 정보를 입력해 주세요.'
      : '약관에 동의해 주세요.')

const terms = ['[필수] 이용약관', '[필수] 개인정보처리방침', '[필수] 정보통신망법 동의', '[선택] 마케팅 정보 수신']
</script>

<template>
  <div>
    <div class="row" style="gap: 8px; margin-bottom: 18px">
      <div
        v-for="s in 3"
        :key="s"
        style="flex: 1; height: 4px; border-radius: 2px"
        :style="{ background: s <= step ? 'var(--accent)' : 'var(--ink-100)' }"
      />
    </div>
    <h2>회원가입 {{ step }}/3</h2>
    <p class="sub">
      {{ subtitle }}
    </p>

    <div class="col" style="gap: 12px">
      <template v-if="step === 1">
        <div>
          <label class="auth-label">이메일</label>
          <input class="input" placeholder="user@company.com" style="margin-top: 6px">
        </div>
        <div>
          <label class="auth-label">비밀번호</label>
          <input class="input" type="password" placeholder="8자 이상, 영문/숫자/특수문자 포함" style="margin-top: 6px">
        </div>
        <div>
          <label class="auth-label">이름</label>
          <input class="input" placeholder="홍길동" style="margin-top: 6px">
        </div>
        <div>
          <label class="auth-label">휴대폰 번호</label>
          <div class="row" style="gap: 6px; margin-top: 6px">
            <input class="input" placeholder="010-0000-0000" style="flex: 1">
            <button type="button" class="btn btn-outline btn-sm" style="height: 36px">
              인증요청
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="step === 2">
        <div>
          <label class="auth-label">회사명</label>
          <input class="input" placeholder="(주)몰리몰리" style="margin-top: 6px">
        </div>
        <div>
          <label class="auth-label">사업자등록번호</label>
          <input class="input" placeholder="000-00-00000" style="margin-top: 6px">
        </div>
        <div>
          <label class="auth-label">업종</label>
          <select class="select" style="margin-top: 6px">
            <option>이커머스 / 쇼핑몰</option><option>금융 / 핀테크</option><option>교육</option><option>의료 / 헬스케어</option><option>기타</option>
          </select>
        </div>
        <div>
          <label class="auth-label">월 예상 발송량</label>
          <select class="select" style="margin-top: 6px">
            <option>1,000건 이하</option><option>1,000~10,000건</option><option>10,000건 이상</option>
          </select>
        </div>
      </template>

      <template v-else>
        <div class="terms-box">
          <label class="checkbox" style="font-size: 14px; font-weight: 600; color: var(--ink-900)">
            <input type="checkbox"> 전체 약관에 동의합니다
          </label>
          <div class="h-divider" />
          <label v-for="t in terms" :key="t" class="checkbox" style="display: flex; padding: 6px 0">
            <input type="checkbox"> {{ t }}
            <a style="margin-left: auto; color: var(--accent-ink)">보기</a>
          </label>
        </div>
      </template>

      <div class="row" style="gap: 8px; margin-top: 8px">
        <button v-if="step > 1" type="button" class="btn btn-outline" style="flex: 1" @click="step--">
          이전
        </button>
        <button type="button" class="btn btn-primary btn-lg" style="flex: 1" @click="next">
          {{ step < 3 ? '다음' : '가입 완료' }}
        </button>
      </div>

      <div style="text-align: center; font-size: 12px; color: var(--ink-500); margin-top: 6px">
        이미 계정이 있으신가요?
        <NuxtLink to="/login" style="color: var(--accent-ink); font-weight: 600">
          로그인
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-700);
  display: block;
}
.terms-box {
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  font-size: 12px;
  color: var(--ink-700);
  line-height: 1.7;
}
</style>
