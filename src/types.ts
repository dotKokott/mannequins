import { current } from 'immer'
import type { Voice } from './lib/openai'

export type Conversation = {
  title: string
  text: string
  lines: Line[]
}

export type Line = {
  speaker: string
  text: string
}

export type SpeakerConfig = {
  deviceId: string
  voice: Voice
}

export function parseConversation(conversationText: string): Line[] {
  const lines = conversationText.split('\n')

  const parsed: Line[] = []

  let currentSpeaker = ''
  let currentText = ''

  for (const line of lines) {
    if (line.startsWith('[')) {
      if (currentSpeaker) {
        parsed.push({ speaker: currentSpeaker, text: currentText })
      }

      // regex parse to get speaker name including brackets
      currentSpeaker = line.match(/\[.*\]/)?.[0] || currentSpeaker
      currentText = ''
    } else {
      currentText += line + '\n'
    }
  }

  if (currentSpeaker) {
    parsed.push({ speaker: currentSpeaker, text: currentText })
  }

  return parsed
}
