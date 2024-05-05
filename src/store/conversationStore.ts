import { create } from 'zustand'
import {
  parseConversation,
  type Conversation,
  type Line,
  type SpeakerConfig,
} from '../types'
import { immer } from 'zustand/middleware/immer'
import {
  createJSONStorage,
  persist,
  type StorageValue,
} from 'zustand/middleware'
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
  currentSpeakerConfig: SpeakerConfig | undefined
  conversations: Conversation[]
  isPlaying: boolean
  autoPickFromConversations: boolean

  welcomeText: string
  hushText: string
  goodbyeText: string

  setWelcomeText: (text: string) => void
  setHushText: (text: string) => void
  setGoodbyeText: (text: string) => void

  addNewConversation: () => void
  removeConversation: (index: number) => void
  setConversation: (index: number, conversation: Conversation) => void
  setIsPlaying: (isPlaying: boolean) => void
  setLineQueue: (lineQueue: Line[]) => void
  setAutoPickFromConversations: (autoPickFromQueue: boolean) => void
  setSpeakerConfig: (speaker: string, config: SpeakerConfig) => void
  addToQueue: (lines: Line[]) => void
  conversationLoop: () => void
  addInterruption: (lines: Line[]) => void
}

const localStorageWithMap = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    const { state } = JSON.parse(str)
    return {
      state: {
        ...state,
        transactions: new Map(state.speakerConfigs),
      },
    }
  },
  setItem: (name: string, newValue: StorageValue<ConversationStore>) => {
    // functions cannot be JSON encoded
    const str = JSON.stringify({
      state: {
        ...newValue.state,
        speakerConfigs: Array.from(newValue.state.speakerConfigs.entries()),
      },
    })
    localStorage.setItem(name, str)
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}

const useConversationStore = create<ConversationStore>()(
  persist(
    immer((set, get) => ({
      speakerConfigs: new Map<string, SpeakerConfig>(
        new Map([
          ['[HELIO]', { deviceId: 'default', voice: 'onyx', volume: 1 }],
          ['[BARBARA]', { deviceId: 'default', voice: 'alloy', volume: 1 }],
          ['[KARL]', { deviceId: 'default', voice: 'echo', volume: 1 }],
          ['[PAULA]', { deviceId: 'default', voice: 'shimmer', volume: 1 }],
        ]),
      ),
      lineQueue: [],
      currentLine: undefined,
      currentSpeakerConfig: undefined,
      conversations: [
        {
          title: 'Test Conversation',
          text: testConversation,
          lines: parseConversation(testConversation),
        },
      ],
      isPlaying: true,
      autoPickFromConversations: false,

      welcomeText: 'Ooooh look the new hire!',
      hushText: 'Shhh!',
      goodbyeText: 'You got bored? Could have said goodbye',

      setWelcomeText: (text: string) => {
        set((state) => {
          state.welcomeText = text
        })
      },

      setHushText: (text: string) => {
        set((state) => {
          state.hushText = text
        })
      },

      setGoodbyeText: (text: string) => {
        set((state) => {
          state.goodbyeText = text
        })
      },

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

      addInterruption: (lines: Line[]) => {
        set((state) => {
          audioAPI.stop(state.currentSpeakerConfig?.deviceId || 'default')

          lines = lines.map((line) => {
            if (line.speaker == '') {
              const randomSpeaker = Array.from(state.speakerConfigs.keys())[
                Math.floor(Math.random() * state.speakerConfigs.size)
              ]

              console.log('Random speaker:', randomSpeaker)

              line.speaker =
                state.currentLine?.speaker || randomSpeaker || '[UNKNOWN]'
            }

            return line
          })

          let newLines = [
            // interruption
            ...lines,
            // where were we?
            {
              speaker: state.currentLine?.speaker || '',
              text: 'Where were we?',
            },
            // current line
            state.currentLine,
          ].filter(Boolean) as Line[]

          state.lineQueue = [...newLines, ...state.lineQueue]
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
              state.currentSpeakerConfig = undefined
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

          set((state) => {
            state.currentSpeakerConfig = config
          })

          console.log(`Saying: ${text} as ${speaker}`)
          const audio = await API.say(text, config.voice)
          if (!audio) continue

          console.log(`Playing audio on ${config.deviceId}`)
          await audioAPI.play(audio, config.deviceId, config.volume)
        }
      },
    })),
    {
      name: 'conversation-store',
      partialize: (state) => {
        return {
          conversations: state.conversations,
          welcomeText: state.welcomeText,
          hushText: state.hushText,
          goodbyeText: state.goodbyeText,
        }
      },
    },
  ),
)

useConversationStore.getState().conversationLoop()

export { useConversationStore }
