import React from 'react'
import { Config } from './Config'
import { Conversation } from './Conversation'
import { Speaker } from './Speaker'
import { useConversationStore } from './store/conversationStore'

import { ConversationQueue } from './ConversationQueue'
import { Interruptions } from './Interruptions'

import midiAPI from './lib/midi'
import { blue, green, pink, yellow } from './constants'

midiAPI.init()

const speakerColors = [pink, yellow, blue, green]

export function App() {
  const [lastMidiNote, setLastMidiNote] = React.useState<number | null>(null)

  const currentLanguage = useConversationStore((state) => state.currentLanguage)
  const setCurrentLanguage = useConversationStore(
    (state) => state.setCurrentLanguage,
  )

  React.useEffect(() => {
    const handleMidiNote = (note: number) => {
      console.log('MIDI Note:', note)
      setLastMidiNote(note)
    }

    midiAPI.addNoteOnListener(handleMidiNote)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentLanguage('english')
      } else if (e.key === 'ArrowRight') {
        setCurrentLanguage('french')
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      midiAPI.removeNoteOnListener(handleMidiNote)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [setCurrentLanguage])

  const speakers = useConversationStore((state) => state.speakerConfigs)

  const conversations = useConversationStore((state) => state.conversations)
  const setConversation = useConversationStore((state) => state.setConversation)

  const addNewConversation = useConversationStore(
    (state) => state.addNewConversation,
  )

  const removeConversation = useConversationStore(
    (state) => state.removeConversation,
  )

  const setSpeakerConfig = useConversationStore(
    (state) => state.setSpeakerConfig,
  )

  const addToQueue = useConversationStore((state) => state.addToQueue)
  const queue = useConversationStore((state) => state.lineQueue)

  return (
    <div
      style={{
        fontFamily: 'DIN Alternate',
        backgroundColor: 'rgb(244, 183, 155)',
      }}
    >
      <h2 style={{ float: 'right' }}>
        {'Life in Plastic ~ Telepathic Control Center'}
      </h2>

      <div style={{ float: 'right' }}>
        <span>Current Language: {currentLanguage}</span>
      </div>

      <Config />
      <span style={{}}>Last MIDI: {lastMidiNote}</span>
      <div
        style={{
          marginTop: '100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {Array.from(speakers.entries()).map(([speaker, config], index) => (
            <Speaker
              key={speaker}
              handle={speaker}
              config={config}
              index={index}
              color={speakerColors[index]}
              onChange={(speakerConfig) =>
                setSpeakerConfig(speaker, speakerConfig)
              }
            />
          ))}
        </div>

        <hr />
        <div>
          <div>
            <h3>Conversations</h3>
          </div>
          {conversations.map((conversation, index) => (
            <Conversation
              key={index}
              conversation={conversation}
              updateConversation={(conversation) =>
                setConversation(index, conversation)
              }
              onSay={(conversation) => addToQueue(conversation)}
              removeConversation={() => removeConversation(index)}
            />
          ))}
          <button onClick={addNewConversation}>+</button>
        </div>

        <Interruptions />
        <ConversationQueue />
      </div>
    </div>
  )
}
