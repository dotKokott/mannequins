import React from 'react'
import type { Line } from './types'
import { useConversationStore } from './store/conversationStore'

export function ConversationQueue() {
  const queue = useConversationStore((state) => state.lineQueue)
  const setQueue = useConversationStore((state) => state.setLineQueue)
  const currentLine = useConversationStore((state) => state.currentLine)

  let fullQueue

  if (currentLine) {
    fullQueue = [currentLine, ...queue]
  } else {
    fullQueue = queue
  }

  const getBackgroundColor = (line: Line) => {
    if (line === currentLine) {
      return 'green'
    } else {
      return 'white'
    }
  }

  return (
    <div>
      <h3>Conversation Queue</h3>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => {
            setQueue([])
          }}
        >
          Clear Queue
        </button>
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
  const queue = useConversationStore((state) => state.lineQueue)
  const [isPlaying, setIsPlaying] = useConversationStore((state) => [
    state.isPlaying,
    state.setIsPlaying,
  ])

  const play = () => {
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  return (
    <div>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <ConversationQueue />
    </div>
  )
}
