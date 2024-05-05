import { useConversationStore } from './store/conversationStore'

export function Interruptions() {
  const [welcomeText, setWelcomeText] = useConversationStore((state) => [
    state.welcomeText,
    state.setWelcomeText,
  ])

  const [hushText, setHushText] = useConversationStore((state) => [
    state.hushText,
    state.setHushText,
  ])

  const [goodbyeText, setGoodbyeText] = useConversationStore((state) => [
    state.goodbyeText,
    state.setGoodbyeText,
  ])

  return (
    <div>
      <h3>Interruptions</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div>
          <span>Welcome:</span>
          <input
            value={welcomeText}
            onChange={(e) => setWelcomeText(e.target.value)}
            placeholder="Welcome Text"
            style={{ width: '450px' }}
          />
        </div>
        <div>
          <span>Hush:</span>
          <input
            value={hushText}
            onChange={(e) => {
              setHushText(e.target.value)
            }}
            placeholder="Hush Text"
            style={{ width: '450px' }}
          />
        </div>
        <div>
          <span>Goodbye:</span>
          <input
            value={goodbyeText}
            onChange={(e) => setGoodbyeText(e.target.value)}
            placeholder="Goodbye Text"
            style={{ width: '450px' }}
          />
        </div>
      </div>
    </div>
  )
}
