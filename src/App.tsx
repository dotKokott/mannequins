import React from 'react'
import { Config } from './Config'
import { Conversation } from './Conversation'
import { Speaker } from './Speaker'
import { useConversationStore } from './store/conversationStore'

import { ConversationQueue } from './ConversationQueue'

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

  const [autoPickFromConversations, setAutoPickFromConversations] =
    useConversationStore((state) => [
      state.autoPickFromConversations,
      state.setAutoPickFromConversations,
    ])

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
        <button onClick={addNewConversation}>Add New Conversation</button>
        <div>
          Auto pick from conversations
          <input
            type="checkbox"
            checked={autoPickFromConversations}
            onChange={(e) => setAutoPickFromConversations(e.target.checked)}
          />
        </div>
        <ConversationQueue />
      </div>
    </>
  )
}
