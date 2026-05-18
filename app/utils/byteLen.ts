/** 한글=2byte, ASCII=1byte 근사 byte 길이 (SMS/LMS 카운터용) */
export function byteLen(s = ''): number {
  let n = 0
  for (const c of s) n += c.charCodeAt(0) > 0x7f ? 2 : 1
  return n
}
