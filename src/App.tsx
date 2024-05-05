import React from 'react'
import { Config } from './Config'
import { Conversation } from './Conversation'
import { Speaker } from './Speaker'
import { useConversationStore } from './store/conversationStore'

import { ConversationQueue } from './ConversationQueue'
import { Interruptions } from './Interruptions'

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
      <p>{'Life in Plastic'}</p>
      <Config />
      <div
        style={{
          marginTop: '20px',
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
          {Array.from(speakers.entries()).map(([speaker, config]) => (
            <Speaker
              key={speaker}
              handle={speaker}
              config={config}
              onChange={(speakerConfig) =>
                setSpeakerConfig(speaker, speakerConfig)
              }
            />
          ))}
        </div>

        <hr />
        <div>
          <h3>Conversations</h3>
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
        </div>
        <button onClick={addNewConversation}>Add New Conversation</button>
        <Interruptions />
        <ConversationQueue />
      </div>
    </>
  )
}
