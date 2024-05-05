import React from 'react'
import { Config } from './Config'
import { Conversation } from './Conversation'
import { Speaker } from './Speaker'
import { useConversationStore } from './store/conversationStore'

import { ConversationQueue } from './ConversationQueue'
import { Interruptions } from './Interruptions'

import midiAPI from './lib/midi'

midiAPI.init()

export function App() {
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
    <>
      <h2 style={{ float: 'right' }}>
        {'Life in Plastic ~ Telepathic Control Center'}
      </h2>
      <Config />
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
            gap: '10px',
          }}
        >
          {Array.from(speakers.entries()).map(([speaker, config], index) => (
            <Speaker
              key={speaker}
              handle={speaker}
              config={config}
              index={index}
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
    </>
  )
}
