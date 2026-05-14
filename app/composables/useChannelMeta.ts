import type { DispatchKind } from '~/types/domain'
import type { BodyVariant, ChannelMeta, FieldId } from '~/types/channel'
import { CHANNEL_METAS } from '~/types/channel'

export function useChannelMeta(id: DispatchKind): ChannelMeta {
  return CHANNEL_METAS[id]
}

// 템플릿 사용 모드에서 특정 필드가 잠겨야 하는지
export function isFieldLocked(meta: ChannelMeta, field: FieldId, templateUsed: boolean): boolean {
  if (!templateUsed) return false
  return meta.templateLockedFields?.includes(field) ?? false
}

// 본문 편집 모드 — 'readonly' | 'variable-only' | 'editable'
export function resolveBodyEditMode(
  meta: ChannelMeta,
  templateUsed: boolean,
): 'readonly' | 'variable-only' | 'editable' {
  if (!templateUsed) return 'editable'
  if (meta.templateBodyEdit) return meta.templateBodyEdit
  return meta.templateLockedFields?.includes('body') ? 'readonly' : 'editable'
}

// 점진적 disclosure — 카드가 활성화되는지
export function isCardUnlocked(
  meta: ChannelMeta,
  card: 'recipient' | 'message',
  filled: { sender: boolean; template: boolean },
): boolean {
  const reqs = meta.prerequisites?.[card]
  if (!reqs || reqs.length === 0) return true
  return reqs.every((req) => filled[req])
}

// 현재 sub-mode의 BodyVariant
export function resolveBodyVariant(
  meta: ChannelMeta,
  variantKey?: string,
): BodyVariant {
  const variants = meta.body.variants
  if (variantKey && variants[variantKey]) return variants[variantKey]!
  // SMS는 'sms', 알림톡은 'basic', 그 외는 'default'를 기본값으로
  const fallbackKey = Object.keys(variants)[0]!
  return variants[fallbackKey]!
}

// 치환자 패널 활성 여부
export function isSubstitutionActive(meta: ChannelMeta, templateUsed: boolean): boolean {
  if (!meta.substitution) return false
  if (meta.template.mode === 'required') return true
  return templateUsed
}
