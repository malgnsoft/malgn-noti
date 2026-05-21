<script setup lang="ts">
useHead({ title: '상세 설정' })
const toast = useToast()

type TabKey = 'sms' | 'rcs' | 'push' | 'webhook' | 'backup'
const TABS: { key: TabKey, label: string }[] = [
  { key: 'sms', label: '문자 메시지' },
  { key: 'rcs', label: 'RCS' },
  { key: 'push', label: 'PUSH' },
  { key: 'webhook', label: '웹훅' },
  { key: 'backup', label: '백업' },
]
const tab = ref<TabKey>('sms')

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
const BLOCK_TIMES = ['10분', '30분', '1시간', '3시간', '6시간', '12시간', '24시간']

const COUNTRY_OPTIONS = [
  '미국/캐나다(1)', '영국(44)', '호주(61)', '인도네시아(62)', '필리핀(63)', '태국(66)',
  '일본(81)', '베트남(84)', '중국(86)', '인도(91)', '홍콩(852)', '대만(886)',
  '싱가포르(65)', '말레이시아(60)', '독일(49)', '프랑스(33)',
]

/* ── 설정 상태(목업) ─────────────────────────────────────────────── */
const state = reactive({
  intlSms: {
    enabled: 'off',
    monthly: '1000',
    countries: [
      '미국/캐나다(1)', '영국(44)', '호주(61)', '인도네시아(62)', '필리핀(63)', '태국(66)',
      '일본(81)', '베트남(84)', '중국(86)', '인도(91)', '홍콩(852)', '대만(886)',
    ] as string[],
  },
  smsDedup: { enabled: 'off', blockTime: '10분' },
  altText: { mode: 'convert' as 'convert' | 'remove' | 'fail' },
  smsAdLimit: { enabled: 'off', start: '21:00', end: '08:00', failMode: '실패 처리' },
  rcsAdLimit: { enabled: 'off', start: '20:00', end: '09:00', failMode: '실패 처리' },
  tokenExpiry: { period: '12개월' },
  appType: { type: '다중 토큰' },
  pushDedup: { enabled: 'off', blockTime: '10분' },
  pushCollect: { enabled: 'off' },
  adLabelPos: { pos: '제목' },
  adConsent: {
    day: '3일',
    time: '11시',
    inputType: '기본',
    title: '광고성 메시지 수신 동의 안내',
    body: `정보통신망법 제50조 제8항(영리목적의 광고성 정보 전송 제한)에 따라 광고성 메시지 수신 동의 사실을 수신 동의를 받은 날로부터 2년마다 안내드립니다.
- 광고성 메시지 수신 동의 일시: '###AD_AGREEMENT_DATE_TIME###'
- 수신 동의 철회 방법: 알림 설정 메뉴`,
  },
  webhook: { enabled: '사용', url: '', retry: '3회' },
  backup: { enabled: '사용', cycle: '매일', keep: '90일' },
})

const addCountry = ref('')
const availableCountries = computed(() => COUNTRY_OPTIONS.filter(c => !state.intlSms.countries.includes(c)))
function onAddCountry() {
  if (addCountry.value && !state.intlSms.countries.includes(addCountry.value)) {
    state.intlSms.countries.push(addCountry.value)
  }
  addCountry.value = ''
}
function removeCountry(c: string) {
  state.intlSms.countries = state.intlSms.countries.filter(x => x !== c)
}

function onSave(name: string) {
  toast.add({ title: `${name} 설정을 저장했습니다.`, icon: 'i-lucide-circle-check' })
}

/* ── 대체 문자 설정 모달 ─────────────────────────────────────────── */
const altTextModalOpen = ref(false)
const altTextDraft = ref<'convert' | 'remove' | 'fail'>('convert')
function openAltTextModal() {
  altTextDraft.value = state.altText.mode
  altTextModalOpen.value = true
}
function onAltTextConfirm() {
  state.altText.mode = altTextDraft.value
  altTextModalOpen.value = false
  toast.add({ title: '대체 문자 설정을 저장했습니다.', icon: 'i-lucide-circle-check' })
}
function onSaveAll() {
  toast.add({ title: '상세 설정', description: '모든 설정을 저장했습니다.', icon: 'i-lucide-circle-check' })
}
function onTestSend() {
  toast.add({ title: '확인 발송', description: '테스트 메시지를 발송했습니다.', icon: 'i-lucide-send' })
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 관리 · 상세 설정
      </div>
      <h1>상세 설정</h1>
      <p>채널별 발송 공통 옵션과 웹훅·백업 정책을 설정합니다.</p>
    </div>

    <div class="set-card">
      <!-- 탭 -->
      <div class="set-tabs">
        <button
          v-for="t in TABS"
          :key="t.key"
          type="button"
          class="set-tab"
          :class="{ on: tab === t.key }"
          @click="tab = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="set-body">
        <!-- ───── 문자 메시지 ───── -->
        <template v-if="tab === 'sms'">
          <div class="set-group">
            <div class="set-label">
              국제 SMS 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="국제 SMS 메시지 발송 설정"
                description="국제 SMS 발송 기능의 사용 여부를 설정할 수 있습니다."
                @save="onSave('국제 SMS 메시지 발송')"
              >
                <ul class="sf-notice">
                  <li>
                    국제 발송 자동 차단 기능은 비정상적인 국제 발송을 줄일 수 있는 보조적인 기능입니다.
                    <ul>
                      <li>설정된 임계치(월 발송 건수)를 넘으면 자동 차단되며 국제 발송 특성상 발송 데이터가 수집되는 속도에 따라 차단 시점이 정확하지 않을 수 있습니다.</li>
                    </ul>
                  </li>
                  <li>국제 SMS 월 발송 건수는 최소 1건에서 최대 10,000건까지 설정할 수 있습니다. 10,000건 초과 발송이 필요한 경우 [고객 센터]로 문의하세요.</li>
                  <li>어뷰징이 자주 발생하는 일부 국가는 발송 차단이 기본 설정된 상태이며, 발송을 허용하려면 국가를 선택하여 허용할 수 있습니다.</li>
                </ul>
                <div class="sf-row">
                  <label class="sf-label">국제 SMS 발송</label>
                  <select v-model="state.intlSms.enabled" class="select sf-control">
                    <option value="off">
                      사용 안 함
                    </option>
                    <option value="on">
                      사용
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">월 발송 건수</label>
                  <input v-model="state.intlSms.monthly" class="input sf-control" inputmode="numeric">
                </div>
                <div class="sf-row">
                  <label class="sf-label">발송 허용 국가</label>
                  <div class="sf-tagbox">
                    <span v-for="c in state.intlSms.countries" :key="c" class="sf-tag">
                      {{ c }}
                      <button type="button" aria-label="삭제" @click="removeCountry(c)">
                        <UIcon name="i-lucide-x" class="text-[length:var(--fz-sm)]" />
                      </button>
                    </span>
                    <select
                      v-if="availableCountries.length"
                      v-model="addCountry"
                      class="select sf-tag-add"
                      @change="onAddCountry"
                    >
                      <option value="">
                        + 국가 추가
                      </option>
                      <option v-for="c in availableCountries" :key="c" :value="c">
                        {{ c }}
                      </option>
                    </select>
                  </div>
                </div>
              </AppSettingsSection>
            </div>
          </div>

          <div class="set-group">
            <div class="set-label">
              메시지 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="메시지 중복 발송 차단 시간 설정"
                description="설정한 시간 동안 같은 내용의 메시지가 발송되지 않도록 설정할 수 있습니다."
                @save="onSave('메시지 중복 발송 차단')"
              >
                <ul class="sf-notice">
                  <li>발송 유형(SMS/LMS/MMS), 발신 번호, 수신 번호, 제목, 내용, 첨부 파일이 모두 일치하는 경우 중복으로 판단하여 차단됩니다.</li>
                </ul>
                <div class="sf-row">
                  <label class="sf-label">중복 발송 차단</label>
                  <select v-model="state.smsDedup.enabled" class="select sf-control">
                    <option value="off">
                      사용 안 함
                    </option>
                    <option value="on">
                      사용
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">차단 시간</label>
                  <select v-model="state.smsDedup.blockTime" class="select sf-control">
                    <option v-for="t in BLOCK_TIMES" :key="t" :value="t">
                      {{ t }}
                    </option>
                  </select>
                </div>
              </AppSettingsSection>

              <AppSettingsSection
                title="대체 문자 설정"
                description="발송 내용(제목/본문)에 발송 불가능한 문자(EUC-KR 인코딩 범위 외 문자)가 포함된 경우 발송 가능한 문자로 대체하여 발송하도록 설정할 수 있습니다."
                modal
                @open-modal="openAltTextModal"
              />
            </div>
          </div>

          <div class="set-group">
            <div class="set-label">
              광고성 메시지 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="광고성 메시지 발송 시간 제한 설정"
                description="광고성 메시지의 발송 시간을 제한할 수 있습니다."
                @save="onSave('광고성 메시지 발송 시간 제한')"
              >
                <ul class="sf-notice">
                  <li>
                    설정 가능한 시간은 다음과 같습니다.
                    <ul>
                      <li>광고 발송 제한 시작 설정 가능 시간: 18:00~21:00</li>
                      <li>광고 발송 제한 종료 설정 가능 시간: 08:00~12:00</li>
                    </ul>
                  </li>
                </ul>
                <div class="sf-row">
                  <label class="sf-label">광고 발송 제한</label>
                  <select v-model="state.smsAdLimit.enabled" class="select sf-control">
                    <option value="off">
                      사용 안 함
                    </option>
                    <option value="on">
                      사용
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">광고 발송 제한 시간</label>
                  <div class="sf-timerange">
                    <select v-model="state.smsAdLimit.start" class="select">
                      <option v-for="h in HOURS" :key="h" :value="h">
                        {{ h }}
                      </option>
                    </select>
                    <span class="sf-dash">-</span>
                    <select v-model="state.smsAdLimit.end" class="select">
                      <option v-for="h in HOURS" :key="h" :value="h">
                        {{ h }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="sf-row">
                  <label class="sf-label">미발송 메시지 처리 방식</label>
                  <select v-model="state.smsAdLimit.failMode" class="select sf-control">
                    <option value="실패 처리">
                      실패 처리
                    </option>
                    <option value="보류">
                      보류
                    </option>
                  </select>
                </div>
              </AppSettingsSection>
            </div>
          </div>
        </template>

        <!-- ───── RCS ───── -->
        <template v-else-if="tab === 'rcs'">
          <div class="set-group">
            <div class="set-label">
              광고성 메시지 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="광고성 메시지 발송 시간 제한 설정"
                description="광고성 메시지의 발송 시간을 제한할 수 있습니다."
                @save="onSave('광고성 메시지 발송 시간 제한')"
              >
                <ul class="sf-notice">
                  <li>
                    설정 가능한 시간은 다음과 같습니다.
                    <ul>
                      <li>광고 발송 제한 시작 설정 가능 시간: 18:00~21:00</li>
                      <li>광고 발송 제한 종료 설정 가능 시간: 08:00~12:00</li>
                    </ul>
                  </li>
                </ul>
                <div class="sf-row">
                  <label class="sf-label">광고 발송 제한</label>
                  <select v-model="state.rcsAdLimit.enabled" class="select sf-control">
                    <option value="off">
                      사용 안 함
                    </option>
                    <option value="on">
                      사용
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">광고 발송 제한 시간</label>
                  <div class="sf-timerange">
                    <select v-model="state.rcsAdLimit.start" class="select">
                      <option v-for="h in HOURS" :key="h" :value="h">
                        {{ h }}
                      </option>
                    </select>
                    <span class="sf-dash">-</span>
                    <select v-model="state.rcsAdLimit.end" class="select">
                      <option v-for="h in HOURS" :key="h" :value="h">
                        {{ h }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="sf-row">
                  <label class="sf-label">미발송 메시지 처리 방식</label>
                  <select v-model="state.rcsAdLimit.failMode" class="select sf-control">
                    <option value="실패 처리">
                      실패 처리
                    </option>
                    <option value="보류">
                      보류
                    </option>
                  </select>
                </div>
              </AppSettingsSection>
            </div>
          </div>
        </template>

        <!-- ───── PUSH ───── -->
        <template v-else-if="tab === 'push'">
          <div class="set-group">
            <div class="set-label">
              토큰 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="토큰 만료 기간 설정"
                description="토큰 만료 기간을 설정하여 설정 기간 동안 요청이 없는 토큰으로의 메시지 발송을 제외할 수 있습니다."
                @save="onSave('토큰 만료 기간')"
              >
                <p class="sf-inline-desc">
                  설정한 기간 동안 앱을 사용하지 않은 사용자(토큰)는 메시지 발송 대상에서 제외됩니다.
                </p>
                <div class="sf-row">
                  <label class="sf-label">만료 기간</label>
                  <select v-model="state.tokenExpiry.period" class="select sf-control">
                    <option v-for="p in ['3개월', '6개월', '12개월', '24개월']" :key="p" :value="p">
                      {{ p }}
                    </option>
                  </select>
                </div>
              </AppSettingsSection>

              <AppSettingsSection
                title="앱 유형 설정"
                description="연동된 앱의 유형을 선택하여 토큰을 관리할 수 있습니다."
                @save="onSave('앱 유형')"
              >
                <p class="sf-inline-desc">
                  다중 토큰(하나의 앱을 여러 기기에서 이용), 단일 토큰(하나의 앱을 1개의 기기에서 이용)
                </p>
                <div class="sf-row">
                  <label class="sf-label">앱 유형</label>
                  <select v-model="state.appType.type" class="select sf-control">
                    <option value="다중 토큰">
                      다중 토큰
                    </option>
                    <option value="단일 토큰">
                      단일 토큰
                    </option>
                  </select>
                </div>
              </AppSettingsSection>
            </div>
          </div>

          <div class="set-group">
            <div class="set-label">
              메시지 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="메시지 중복 발송 차단 시간 설정"
                description="설정한 시간 동안 같은 내용의 메시지가 발송되지 않도록 설정할 수 있습니다."
                @save="onSave('메시지 중복 발송 차단')"
              >
                <p class="sf-inline-desc">
                  발송 목적(일반용/광고용), 내용(콘텐츠), 발신 정보, 수신 동의 설정 가이드, 광고 표시 문구 위치, 토큰이 모두 일치하는 경우 중복으로 판단하여 차단됩니다.
                </p>
                <div class="sf-row">
                  <label class="sf-label">중복 발송 차단</label>
                  <select v-model="state.pushDedup.enabled" class="select sf-control">
                    <option value="off">
                      사용 안 함
                    </option>
                    <option value="on">
                      사용
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">차단 시간</label>
                  <select v-model="state.pushDedup.blockTime" class="select sf-control">
                    <option v-for="t in BLOCK_TIMES" :key="t" :value="t">
                      {{ t }}
                    </option>
                  </select>
                </div>
              </AppSettingsSection>

              <AppSettingsSection
                title="메시지 수신/확인 수집 설정"
                description="발송된 메시지의 수신 및 확인 여부 수집을 설정할 수 있습니다."
                @save="onSave('메시지 수신/확인 수집')"
              >
                <ul class="sf-notice">
                  <li>v1.4 SDK 이상 버전을 적용해야 정보를 수집할 수 있습니다. (Android/iOS 지원)</li>
                  <li>수집된 발송, 수신, 확인 데이터에 일부 차이가 있을 수 있습니다.</li>
                </ul>
                <div class="sf-row">
                  <label class="sf-label">수신/확인 수집</label>
                  <select v-model="state.pushCollect.enabled" class="select sf-control">
                    <option value="off">
                      사용 안 함
                    </option>
                    <option value="on">
                      사용
                    </option>
                  </select>
                </div>
              </AppSettingsSection>
            </div>
          </div>

          <div class="set-group">
            <div class="set-label">
              광고성 메시지 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="광고 표시 문구 위치 설정"
                description="광고성 메시지 발송 시 (광고) 표시 위치를 설정할 수 있습니다."
                @save="onSave('광고 표시 문구 위치')"
              >
                <p class="sf-inline-desc">
                  제목에 (광고) 표시 노출 설정 시 수신 동의 철회 방법은 내용에 노출됩니다.
                </p>
                <div class="sf-row">
                  <label class="sf-label">표시 위치</label>
                  <select v-model="state.adLabelPos.pos" class="select sf-control">
                    <option value="제목">
                      제목
                    </option>
                    <option value="내용">
                      내용
                    </option>
                  </select>
                </div>
              </AppSettingsSection>

              <AppSettingsSection
                title="광고성 메시지 수신 동의 자동 발송 설정"
                description="광고성 메시지 수신을 동의한 지 만 2년이 된 사용자(토큰)에게 수신 재동의 메시지 자동 발송을 설정할 수 있습니다."
                @save="onSave('광고성 메시지 수신 동의 자동 발송')"
              >
                <ul class="sf-notice">
                  <li>메시지 내용에는 광고성 메시지 수신 동의 날짜, 동의 유지 및 철회 방법을 반드시 포함해야 합니다.</li>
                  <li>광고성 메시지 수신 동의 일시 치환자(<code>###AD_AGREEMENT_DATE_TIME###</code>)를 본문에 넣으면 메시지 발송 시 해당 토큰의 동의 일시로 치환됩니다.</li>
                </ul>
                <div class="sf-row">
                  <label class="sf-label">예약일</label>
                  <select v-model="state.adConsent.day" class="select sf-control">
                    <option v-for="d in ['1일', '2일', '3일', '5일', '7일']" :key="d" :value="d">
                      {{ d }}
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">예약 시간</label>
                  <select v-model="state.adConsent.time" class="select sf-control">
                    <option v-for="n in 24" :key="n" :value="`${n - 1}시`">
                      {{ n - 1 }}시
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">입력 유형</label>
                  <select v-model="state.adConsent.inputType" class="select sf-control">
                    <option value="기본">
                      기본
                    </option>
                    <option value="JSON">
                      JSON
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">제목</label>
                  <input v-model="state.adConsent.title" class="input sf-control">
                </div>
                <div class="sf-row">
                  <label class="sf-label">내용</label>
                  <textarea v-model="state.adConsent.body" class="textarea sf-control" rows="4" />
                </div>
                <div class="sf-row">
                  <label class="sf-label">발송 테스트</label>
                  <button type="button" class="btn btn-primary sf-testbtn" @click="onTestSend">
                    확인 발송
                  </button>
                </div>
              </AppSettingsSection>
            </div>
          </div>
        </template>

        <!-- ───── 웹훅 ───── -->
        <template v-else-if="tab === 'webhook'">
          <div class="set-group">
            <div class="set-label">
              웹훅 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="웹훅 URL 설정"
                description="발송 결과를 수신할 웹훅 URL을 설정할 수 있습니다."
                @save="onSave('웹훅 URL')"
              >
                <div class="sf-row">
                  <label class="sf-label">웹훅 사용</label>
                  <select v-model="state.webhook.enabled" class="select sf-control">
                    <option value="사용">
                      사용
                    </option>
                    <option value="사용 안 함">
                      사용 안 함
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">웹훅 URL</label>
                  <input v-model="state.webhook.url" class="input sf-control" placeholder="https://your-server.com/webhook">
                </div>
                <div class="sf-row">
                  <label class="sf-label">재시도 횟수</label>
                  <select v-model="state.webhook.retry" class="select sf-control">
                    <option v-for="r in ['0회', '1회', '3회', '5회']" :key="r" :value="r">
                      {{ r }}
                    </option>
                  </select>
                </div>
              </AppSettingsSection>
            </div>
          </div>
        </template>

        <!-- ───── 백업 ───── -->
        <template v-else>
          <div class="set-group">
            <div class="set-label">
              백업 설정
            </div>
            <div class="set-sections">
              <AppSettingsSection
                title="발송 데이터 백업 설정"
                description="발송 이력 데이터를 외부 저장소로 자동 백업할 수 있습니다."
                @save="onSave('발송 데이터 백업')"
              >
                <div class="sf-row">
                  <label class="sf-label">백업 사용</label>
                  <select v-model="state.backup.enabled" class="select sf-control">
                    <option value="사용">
                      사용
                    </option>
                    <option value="사용 안 함">
                      사용 안 함
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">백업 주기</label>
                  <select v-model="state.backup.cycle" class="select sf-control">
                    <option v-for="c in ['매일', '매주', '매월']" :key="c" :value="c">
                      {{ c }}
                    </option>
                  </select>
                </div>
                <div class="sf-row">
                  <label class="sf-label">보관 기간</label>
                  <select v-model="state.backup.keep" class="select sf-control">
                    <option v-for="k in ['30일', '90일', '180일', '365일']" :key="k" :value="k">
                      {{ k }}
                    </option>
                  </select>
                </div>
              </AppSettingsSection>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="set-actionbar">
      <button type="button" class="btn btn-outline-dark set-action-btn">
        취소
      </button>
      <button type="button" class="btn btn-primary set-action-btn" @click="onSaveAll">
        저장하기
      </button>
    </div>

    <!-- 대체 문자 설정 모달 -->
    <AppModal :open="altTextModalOpen" title="대체 문자 설정" :width="460" @close="altTextModalOpen = false">
      <p class="at-desc">
        발송 불가능한 문자가 포함된 경우의 처리 방식을 선택하세요.
      </p>
      <AppRadioGroup
        v-model="altTextDraft"
        :options="[
          { value: 'convert', label: '대체 문자로 자동 변환' },
          { value: 'remove', label: '해당 문자 제거' },
          { value: 'fail', label: '발송 실패 처리' },
        ]"
      />
      <template #footer>
        <button type="button" class="btn btn-outline-dark" @click="altTextModalOpen = false">
          취소
        </button>
        <button type="button" class="btn btn-primary" @click="onAltTextConfirm">
          확인
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.set-card {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  overflow: hidden;
}

/* 탭 */
.set-tabs {
  display: flex;
  border-bottom: 1px solid var(--line);
  padding: 0 12px;
}
.set-tab {
  padding: 16px 16px;
  background: none;
  border: 0;
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-500);
  cursor: pointer;
  transition: color 0.12s, box-shadow 0.12s;
}
.set-tab:hover {
  color: var(--ink-800);
}
.set-tab.on {
  color: var(--ink-900);
  font-weight: 600;
  box-shadow: inset 0 -2px var(--accent);
}

.set-body {
  padding: 4px 24px 8px;
}

/* 그룹 */
.set-group {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid var(--line);
  align-items: start;
}
.set-group:first-child {
  border-top: 0;
}
@media (max-width: 880px) {
  .set-group { grid-template-columns: 1fr; gap: 12px; }
}
.set-label {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-800);
  padding-top: 2px;
}
.set-sections {
  min-width: 0;
}

/* 필드 */
.sf-notice {
  margin: 0 0 16px;
  padding-left: 18px;
  list-style: disc;
}
.sf-notice > li {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
}
.sf-notice ul {
  margin: 2px 0;
  padding-left: 16px;
  list-style: circle;
}
.sf-notice ul li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.7;
}
.sf-notice code {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--accent-ink);
  background: var(--accent-soft);
  padding: 1px 5px;
  border-radius: var(--r-sm);
}
.sf-inline-desc {
  margin: 0 0 16px;
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
}

.sf-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
  align-items: center;
}
.sf-row + .sf-row {
  margin-top: 12px;
}
.sf-label {
  font-size: var(--fz-sm);
  color: var(--ink-600);
}
.sf-control {
  max-width: 420px;
}
.sf-row .textarea.sf-control {
  max-width: 560px;
}

.at-desc {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  margin-bottom: 16px;
}

.sf-testbtn {
  height: 28px;
  padding: 0 12px;
  font-size: var(--fz-sm);
  font-weight: 500;
}

.sf-timerange {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sf-timerange .select {
  width: 110px;
}
.sf-dash {
  color: var(--ink-400);
}

.sf-tagbox {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  max-width: 560px;
}
.sf-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px 3px 9px;
  background: var(--ink-50);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  font-size: var(--fz-xs);
  color: var(--ink-700);
}
.sf-tag button {
  border: 0;
  background: none;
  padding: 0;
  color: var(--ink-400);
  cursor: pointer;
}
.sf-tag button:hover {
  color: var(--ink-800);
}
.sf-tag-add {
  height: 26px;
  font-size: var(--fz-xs);
  padding: 0 6px;
  border-style: dashed;
}

/* 하단 액션 바 */
.set-actionbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
.set-action-btn {
  height: 36px;
  padding: 0 16px;
  font-size: var(--fz-md);
  font-weight: 500;
}
</style>
