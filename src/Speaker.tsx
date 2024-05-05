import React from 'react'

import { API, type Voice, voiceOptions } from './lib/openai'
import { audioAPI } from './lib/audio'
import type { SpeakerConfig } from './types'

import helio from './media/images/helio.png'
import karl from './media/images/karl.png'
import barbara from './media/images/barbara.png'
import paula from './media/images/paula.png'

const imageMap = {
  '[HELIO]': helio as string,
  '[KARL]': karl as string,
  '[BARBARA]': barbara as string,
  '[PAULA]': paula as string,
}

import midiAPI from './lib/midi'

export type SpeakerProps = {
  handle: string
  config: SpeakerConfig
  index: number
  onChange: (speakerConfig: SpeakerConfig) => void | Promise<void> | undefined
}

export function Speaker({ handle, index, config, onChange }: SpeakerProps) {
  // const [handle, updateHandle] = React.useState(handle);
  const [speakerId, setSpeakerId] = React.useState<string>(config.deviceId)

  const [voice, setVoice] = React.useState<Voice>(config.voice)

  const [volume, setVolume] = React.useState<number>(config.volume)

  async function say() {
    const audio = await API.say(
      `Hi! My name is ${handle.replace('[', '').replace(']', '')}`,
      voice,
    )
    if (!audio) return

    await audioAPI.play(audio, speakerId, volume)
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(handle)

    //TODO: show toast
  }

  React.useEffect(() => {
    onChange({ deviceId: speakerId, voice, volume })
  }, [speakerId, voice, volume])

  React.useEffect(() => {
    midiAPI.addNoteOnListener((note, velocity) => {
      if (note === index + 36) {
        say()
      }
    })

    return () => {
      // midiAPI.off('noteon')
    }
  }, [index])

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}
    >
      <img
        src={imageMap[handle as keyof typeof imageMap]}
        alt="Helios"
        style={{ width: '100px' }}
      />
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

      <input
        type="range"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        min={0}
        max={2}
        step={0.01}
      />

      <button onClick={() => say()}>🗣️</button>
    </div>
  )
}
