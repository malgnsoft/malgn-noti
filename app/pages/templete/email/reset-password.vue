<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '비밀번호 재설정 메일 템플릿' })

// 실제 발송 이메일 본문(email-safe HTML) — table 레이아웃 + 인라인 스타일만 사용.
// 웹 디자인 시스템 클래스는 이메일 클라이언트에서 렌더되지 않으므로 사용 금지.
// 변수: {{resetUrl}} (재설정 링크), {{expireHours}} (만료 시간)
const emailHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafaf9; margin:0; padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:480px; background-color:#ffffff; border:1px solid #ececec; border-radius:8px;">
        <tr>
          <td style="padding:28px 32px 20px 32px; border-bottom:1px solid #ececec;">
            <span style="display:inline-block; vertical-align:middle; width:24px; height:24px; line-height:24px; text-align:center; background-color:#0a0a0a; color:#00DC82; border-radius:6px; font-family:Arial,sans-serif; font-size:14px; font-weight:700;">✦</span>
            <span style="font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:16px; font-weight:800; color:#0a0a0a; vertical-align:middle; margin-left:6px;">맑은</span>
            <span style="font-family:'Courier New',monospace; font-size:13px; color:#71717a; vertical-align:middle;">message</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px 0; font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:20px; font-weight:700; color:#0a0a0a;">비밀번호를 재설정해 주세요</h1>
            <p style="margin:0 0 24px 0; font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:14px; line-height:1.6; color:#52525b;">비밀번호 재설정 요청을 접수했습니다. 아래 버튼을 눌러 새 비밀번호를 설정해 주세요.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
              <tr>
                <td align="center" bgcolor="#0a0a0a" style="border-radius:6px;">
                  <a href="{{resetUrl}}" target="_blank" style="display:inline-block; padding:13px 28px; font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:6px;">비밀번호 재설정</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 16px 0; font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:13px; line-height:1.6; color:#71717a;">이 재설정 링크는 발송 후 <strong style="color:#52525b;">{{expireHours}}시간</strong> 동안 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시하시고 비밀번호를 그대로 유지해 주세요.</p>
            <p style="margin:0 0 8px 0; font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:12px; line-height:1.6; color:#a1a1aa;">버튼이 동작하지 않으면 아래 주소를 복사해 브라우저에 붙여 넣어 주세요.</p>
            <p style="margin:0; font-family:'Courier New',monospace; font-size:12px; line-height:1.6; color:#007a48; word-break:break-all;">{{resetUrl}}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px; border-top:1px solid #ececec;">
            <p style="margin:0 0 4px 0; font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:13px; font-weight:700; color:#3f3f46;">맑은 메시징</p>
            <p style="margin:0; font-family:Arial,'Apple SD Gothic Neo',sans-serif; font-size:11px; color:#a1a1aa;">© 2026 맑은소프트. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`

const variables = [
  { name: '{{resetUrl}}', desc: '비밀번호 재설정 링크 (CTA·fallback 텍스트)' },
  { name: '{{expireHours}}', desc: '재설정 링크 만료 시간 (시간 단위)' },
]
</script>

<template>
  <AppEmailTemplatePreview
    crumb="EMAIL TEMPLATE"
    title="비밀번호 재설정 메일"
    intro="비밀번호 재설정 요청 시 발송되는 메일의 정본 템플릿입니다. 아래는 실제 발송될 본문 미리보기입니다."
    :html="emailHtml"
    :variables="variables"
  />
</template>
