import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface AIGenerateOptions {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

export async function generateText({
  prompt,
  systemPrompt = "당신은 책 쓰기 전문 AI 코치입니다. 한국어로 친절하고 전문적으로 답변합니다.",
  maxTokens = 4096,
  temperature = 0.7,
}: AIGenerateOptions): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    return textContent.text
  } catch (error) {
    console.error('Error generating text:', error)
    throw error
  }
}

export async function streamText({
  prompt,
  systemPrompt = "당신은 책 쓰기 전문 AI 코치입니다. 한국어로 친절하고 전문적으로 답변합니다.",
  maxTokens = 4096,
  temperature = 0.7,
  onChunk,
}: AIGenerateOptions & {
  onChunk: (text: string) => void
}): Promise<void> {
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onChunk(chunk.delta.text)
      }
    }
  } catch (error) {
    console.error('Error streaming text:', error)
    throw error
  }
}
