import React from 'react'
import type { Line } from './types'
import { useConversationStore } from './store/conversationStore'

export function ConversationQueue() {
  const queue = useConversationStore((state) => state.lineQueue)
  const setQueue = useConversationStore((state) => state.setLineQueue)
  const currentLine = useConversationStore((state) => state.currentLine)

  const [isPlaying, setIsPlaying] = useConversationStore((state) => [
    state.isPlaying,
    state.setIsPlaying,
  ])

  const [autoPickFromConversations, setAutoPickFromConversations] =
    useConversationStore((state) => [
      state.autoPickFromConversations,
      state.setAutoPickFromConversations,
    ])

  const fullQueue = [currentLine, ...queue].filter(Boolean) as Line[]

  const getBackgroundColor = (line: Line) => {
    if (line === currentLine) {
      return 'green'
    } else {
      return 'white'
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <h3>Conversation Queue</h3>
        <button
          onClick={() => {
            setQueue([])
          }}
        >
          Clear Queue
        </button>
        {!isPlaying && <button onClick={() => setIsPlaying(true)}>Play</button>}
        {isPlaying && (
          <button onClick={() => setIsPlaying(false)}>Pause</button>
        )}
        <div>
          Auto pick from conversations
          <input
            type="checkbox"
            checked={autoPickFromConversations}
            onChange={(e) => setAutoPickFromConversations(e.target.checked)}
          />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
          flexWrap: 'wrap',
        }}
      >
        {fullQueue.map((line, index) => (
          <div
            key={index}
            style={{
              border: '1px solid black',
              padding: '10px',
              backgroundColor: getBackgroundColor(line),
            }}
          >
            <span>{line.speaker}</span>
            <p>{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConversationPlayer() {
  const play = () => {
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  return (
    <div>
      <h3>Conversation Player</h3>
    </div>
  )
}
