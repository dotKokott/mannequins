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

  const addInterruption = useConversationStore((state) => state.addInterruption)

  const [welcomeText, hushText, goodbyeText] = useConversationStore((state) => [
    state.welcomeText,
    state.hushText,
    state.goodbyeText,
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
        {!isPlaying && <button onClick={() => setIsPlaying(true)}>Play</button>}
        {isPlaying && (
          <button onClick={() => setIsPlaying(false)}>Pause</button>
        )}
        <button
          onClick={() => {
            setQueue([])
          }}
        >
          Clear Queue
        </button>

        <div>
          Auto play
          <input
            type="checkbox"
            checked={autoPickFromConversations}
            onChange={(e) => setAutoPickFromConversations(e.target.checked)}
          />
        </div>

        <span>Interrupt:</span>

        <button
          onClick={() => addInterruption([{ speaker: '', text: welcomeText }])}
        >
          Welcome
        </button>

        <button
          onClick={() => addInterruption([{ speaker: '', text: hushText }])}
        >
          Hush!
        </button>

        <button
          onClick={() => addInterruption([{ speaker: '', text: goodbyeText }])}
        >
          Goodbye
        </button>
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
