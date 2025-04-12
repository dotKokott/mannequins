import React from 'react'
import {
  parseConversation,
  type Conversation,
  type Line,
  type Language,
} from './types'
import midiAPI from './lib/midi'

export type ConversationProps = {
  conversation: Conversation
  updateConversation: (conversation: Conversation) => void
  removeConversation: () => void
  onSay: (lines: Line[]) => void | Promise<void> | undefined
}

export function Conversation({
  conversation,
  updateConversation,
  removeConversation,
  onSay,
}: ConversationProps) {
  const [conversationTitle, setConversationTitle] = React.useState(
    conversation.title,
  )

  const [conversationText, setConversationText] = React.useState(
    conversation.text,
  )

  const [language, setLanguage] = React.useState<Language>(
    conversation.language,
  )

  const [conversationQueueMidiNote, setConversationQueueMidiNote] =
    React.useState(conversation.queueMidiNote)

  const parsedConversation = React.useMemo(() => {
    return parseConversation(conversationText)
  }, [conversationText])

  React.useEffect(() => {
    updateConversation({
      title: conversationTitle,
      text: conversationText,
      lines: parseConversation(conversationText),

      language,

      queueMidiNote: conversationQueueMidiNote,
    })
  }, [conversationTitle, conversationText, conversationQueueMidiNote, language])

  React.useEffect(() => {
    const handleMidiNote = (note: number) => {
      if (note === conversationQueueMidiNote) {
        onSay(parsedConversation)
      }
    }

    midiAPI.addNoteOnListener(handleMidiNote)

    return () => {
      midiAPI.removeNoteOnListener(handleMidiNote)
    }
  }, [conversationQueueMidiNote, parsedConversation])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'white',
      }}
    >
      <input
        value={conversationTitle}
        onChange={(e) => setConversationTitle(e.target.value)}
      />
      <textarea
        rows={10}
        value={conversationText}
        onChange={(e) => setConversationText(e.target.value)}
      />
      <div>
        <div>
          <label>Midi Note: </label>
          <input
            style={{ width: '10%' }}
            type="number"
            value={conversationQueueMidiNote}
            onChange={(e) =>
              setConversationQueueMidiNote(parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <label>Language: </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="english">English</option>
            <option value="french">French</option>
          </select>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <button onClick={() => onSay(parsedConversation)}>Add to queue</button>
        <button onClick={removeConversation}>Delete Conversation</button>
      </div>
    </div>
  )
}
