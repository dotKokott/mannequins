import { create } from 'zustand'
import {
  parseConversation,
  type Conversation,
  type Line,
  type SpeakerConfig,
} from '../types'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { enableMapSet } from 'immer'
enableMapSet()

import { API } from '../lib/openai'
import { audioAPI } from '../lib/audio'

const testConversation: string = `
[HELIO]
I wanted to talk about something.

[KARL]
What, Helio?

[HELIO]
I think we need more variety in our hats.

[BARBARA]
Variety? What kind of variety?

[HELIO]
You know, a few berets, maybe some cowboy hats.

[PAULA]
Hmm, not a bad idea. But what about the sunglasses? We're looking a bit dated with these retro frames.

[KARL]
Agreed. How about some aviators or wayfarers?

[BARBARA]
And don't get me started on the scarves. We need a splash of color!

[PAULA]
Yes! Floral patterns or bold stripes. Something eye-catching.

[HELIO]
We're a fashionable bunch. We should make a statement.

[KARL]
Absolutely! Let’s pitch the idea to the store manager.

[BARBARA]
After all, we are the faces of this shop.

[PAULA]
Literally.
`

interface ConversationStore {
  speakerConfigs: Map<string, SpeakerConfig>
  lineQueue: Line[]
  currentLine: Line | undefined
  conversations: Conversation[]
  isPlaying: boolean
  autoPickFromConversations: boolean

  addNewConversation: () => void
  removeConversation: (index: number) => void
  setConversation: (index: number, conversation: Conversation) => void
  setIsPlaying: (isPlaying: boolean) => void
  setLineQueue: (lineQueue: Line[]) => void
  setAutoPickFromConversations: (autoPickFromQueue: boolean) => void
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
      autoPickFromConversations: false,

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

      setAutoPickFromConversations: (autoPickFromQueue: boolean) => {
        set((state) => {
          state.autoPickFromConversations = autoPickFromQueue
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
          if (
            get().lineQueue.length === 0 &&
            get().autoPickFromConversations &&
            get().conversations.length > 0
          ) {
            console.log('No lines queued. Picking randomly conversations...')
            const conversation =
              get().conversations[
                Math.floor(Math.random() * get().conversations.length)
              ]

            set((state) => {
              state.lineQueue = conversation.lines
            })
          }

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
