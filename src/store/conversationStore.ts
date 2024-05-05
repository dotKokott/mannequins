import { create } from 'zustand'
import {
  parseConversation,
  type Conversation,
  type Line,
  type SpeakerConfig,
} from '../types'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import { enableMapSet } from 'immer'
enableMapSet()

import { API } from '../lib/openai'
import { audioAPI } from '../lib/audio'

const testConversation: string = `
[HELIO]
Hello my name is Helio

[PAULA]
Hello Helio, my name is Paula

[HELIO]
Nice to meet you Paula. How are you today?

[PAULA]
I'm doing well, thank you for asking. How about you?
`

interface ConversationStore {
  speakerConfigs: Map<string, SpeakerConfig>
  lineQueue: Line[]
  currentLine: Line | undefined
  conversations: Conversation[]
  isPlaying: boolean

  addNewConversation: () => void
  removeConversation: (index: number) => void
  setConversation: (index: number, conversation: Conversation) => void
  setIsPlaying: (isPlaying: boolean) => void
  setSpeakerConfig: (speaker: string, config: SpeakerConfig) => void
  addToQueue: (lines: Line[]) => void
  conversationLoop: () => void
}

const useConversationStore = create<ConversationStore>()(
  persist(
    immer((set, get) => ({
      speakerConfigs: new Map<string, SpeakerConfig>(
        new Map([
          ['[HELIO]', { deviceId: 'default', voice: 'onyx' }],
          ['[BARBARA]', { deviceId: 'default', voice: 'alloy' }],
          ['[KARL]', { deviceId: 'default', voice: 'echo' }],
          ['[PAULA]', { deviceId: 'default', voice: 'shimmer' }],
        ]),
      ),
      lineQueue: [],
      currentLine: undefined,
      conversations: [
        {
          title: 'Test Conversation',
          text: testConversation,
          lines: parseConversation(testConversation),
        },
      ],
      isPlaying: true,

      addNewConversation: () => {
        set((state) => {
          state.conversations.push({
            title: 'New Conversation',
            text: testConversation,
            lines: parseConversation(testConversation),
          })
        })
      },

      removeConversation: (index: number) => {
        set((state) => {
          state.conversations.splice(index, 1)
        })
      },

      setConversation: (index: number, conversation: Conversation) => {
        set((state) => {
          state.conversations[index] = conversation
        })
      },

      setLineQueue: (lineQueue: Line[]) => {
        set((state) => {
          state.lineQueue = lineQueue
        })
      },

      setIsPlaying: (isPlaying: boolean) => {
        set((state) => {
          state.isPlaying = isPlaying
        })
      },

      setSpeakerConfig: (speaker: string, config: SpeakerConfig) => {
        set((state) => {
          state.speakerConfigs.set(speaker, config)
        })
      },

      addToQueue: (lines: Line[]) => {
        set((state) => {
          state.lineQueue.push(...lines)
        })
      },

      conversationLoop: async () => {
        while (true) {
          if (get().lineQueue.length === 0 || !get().isPlaying) {
            console.log('No lines queued or paused. Waiting...')

            set((state) => {
              state.currentLine = undefined
            })

            await new Promise((resolve) => setTimeout(resolve, 1000))
            continue
          }

          const conversation = get().lineQueue[0]
          set((state) => {
            state.currentLine = state.lineQueue.shift()
          })

          if (!conversation) continue

          const { speaker, text } = conversation
          const config = get().speakerConfigs.get(speaker)
          if (!config) continue

          console.log(`Saying: ${text} as ${speaker}`)
          const audio = await API.say(text, config.voice)
          if (!audio) continue

          console.log(`Playing audio on ${config.deviceId}`)
          await audioAPI.play(audio, config.deviceId)
        }
      },
    })),
    {
      name: 'conversation-store',
      partialize: (state) => {
        return {
          conversations: state.conversations,
        }
      },
    },
  ),
)

useConversationStore.getState().conversationLoop()

export { useConversationStore }
