import type { Channel } from '~/types/domain'

export interface AiTemplateRequest {
  channel: Channel
  prompt: string
  variables?: string[]
}

export interface AiTemplateResult {
  jobId: string
  title: string
  body: string
  estimatedCost: number
}

export function useAiTemplate() {
  const api = useApi()

  async function generate(req: AiTemplateRequest) {
    return api<AiTemplateResult>('/ai/templates/generate', {
      method: 'POST',
      body: req
    })
  }

  return { generate }
}
