import React from 'react'

import { API, type Voice, voiceOptions } from './lib/openai'
import { audioAPI } from './lib/audio'
import type { SpeakerConfig } from './types'

export type SpeakerProps = {
  handle: string
  config: SpeakerConfig
  onChange: (speakerConfig: SpeakerConfig) => void | Promise<void> | undefined
}

export function Speaker({ handle, config, onChange }: SpeakerProps) {
  // const [handle, updateHandle] = React.useState(handle);
  const [speakerId, setSpeakerId] = React.useState<string>(config.deviceId)

  const [voice, setVoice] = React.useState<Voice>(config.voice)

  async function say() {
    const audio = await API.say(
      `Hi! My name is ${handle.replace('[', '').replace(']', '')}`,
      voice,
    )
    if (!audio) return

    await audioAPI.play(audio, speakerId)
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(handle)

    //TODO: show toast
  }

  React.useEffect(() => {
    onChange({ deviceId: speakerId, voice })
  }, [speakerId, voice])

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}
    >
      <div>
        <a href="#" onClick={copyToClipboard}>
          {handle}
        </a>
      </div>
      <select value={speakerId} onChange={(e) => setSpeakerId(e.target.value)}>
        {audioAPI.outputDevices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
      <select value={voice} onChange={(e) => setVoice(e.target.value as any)}>
        {voiceOptions.map((voice) => (
          <option key={voice} value={voice}>
            {voice}
          </option>
        ))}
      </select>

      <button onClick={() => say()}>🗣️</button>
    </div>
  )
}
