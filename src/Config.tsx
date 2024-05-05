import React from 'react'
import { API } from './lib/openai'

export function Config() {
  const [apiKey, setApiKey] = React.useState(
    () => localStorage.getItem('OPENAI_KEY') || '',
  )

  // Save the API key to local storage
  React.useEffect(() => {
    localStorage.setItem('OPENAI_KEY', apiKey)
    API.setApiKey(apiKey)
  }, [apiKey])

  return (
    <div>
      <span>API Key:</span>
      <input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API Key"
        style={{ width: '450px' }}
      />
    </div>
  )
}
