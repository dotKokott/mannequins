import React from 'react'
import type { Line } from './types'
import { useConversationStore } from './store/conversationStore'
import midiAPI from './lib/midi'

export function ConversationQueue() {
  const queue = useConversationStore((state) => state.lineQueue)
  const setQueue = useConversationStore((state) => state.setLineQueue)
  const currentLine = useConversationStore((state) => state.currentLine)

  const [playPauseMidi, setPlayPauseMidi] = useConversationStore((state) => [
    state.playPauseMidi || 0,
    state.setPlayPauseMidi,
  ])

  const [clearQueueMidi, setClearQueueMidi] = useConversationStore((state) => [
    state.ClearQueueMidi || 0,
    state.setClearQueueMidi,
  ])

  const [welcomeMidi, setWelcomeMidi] = useConversationStore((state) => [
    state.welcomeMidi || 0,
    state.setWelcomeMidi,
  ])

  const [hushMidi, setHushMidi] = useConversationStore((state) => [
    state.hushMidi || 0,
    state.setHushMidi,
  ])

  const [goodbyeMidi, setGoodbyeMidi] = useConversationStore((state) => [
    state.goodbyeMidi || 0,
    state.setGoodbyeMidi,
  ])

  const [welcomeText, hushText, goodbyeText] = useConversationStore((state) => [
    state.welcomeText,
    state.hushText,
    state.goodbyeText,
  ])

  const [isPlaying, setIsPlaying] = useConversationStore((state) => [
    state.isPlaying,
    state.setIsPlaying,
  ])

  const addInterruption = useConversationStore((state) => state.addInterruption)

  React.useEffect(() => {
    const handleMidiNote = (note: number) => {
      if (note === clearQueueMidi) {
        setQueue([])
      }

      if (note === playPauseMidi) {
        setIsPlaying(isPlaying ? false : true)
      }

      if (note === welcomeMidi) {
        addInterruption([{ speaker: '', text: welcomeText }])
      }

      if (note === hushMidi) {
        addInterruption([{ speaker: '', text: hushText }])
      }

      if (note === goodbyeMidi) {
        addInterruption([{ speaker: '', text: goodbyeText }])
      }
    }

    midiAPI.addNoteOnListener(handleMidiNote)

    return () => {
      midiAPI.removeNoteOnListener(handleMidiNote)
    }
  }, [
    clearQueueMidi,
    playPauseMidi,
    welcomeMidi,
    hushMidi,
    goodbyeMidi,
    welcomeText,
    hushText,
    goodbyeText,
    isPlaying,
    setQueue,
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
      <div>
        <label>Play/Pause MIDI note</label>
        <input
          style={{ width: '50px' }}
          type="number"
          value={playPauseMidi}
          onChange={(e) => setPlayPauseMidi(parseInt(e.target.value))}
        />

        <label>Clear Queue MIDI note</label>
        <input
          style={{ width: '50px' }}
          type="number"
          value={clearQueueMidi}
          onChange={(e) => setClearQueueMidi(parseInt(e.target.value))}
        />

        <label>Welcome MIDI note</label>
        <input
          style={{ width: '50px' }}
          type="number"
          value={welcomeMidi}
          onChange={(e) => setWelcomeMidi(parseInt(e.target.value))}
        />

        <label>Hush MIDI note</label>
        <input
          style={{ width: '50px' }}
          type="number"
          value={hushMidi}
          onChange={(e) => setHushMidi(parseInt(e.target.value))}
        />

        <label>Goodbye MIDI note</label>
        <input
          style={{ width: '50px' }}
          type="number"
          value={goodbyeMidi}
          onChange={(e) => setGoodbyeMidi(parseInt(e.target.value))}
        />
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
