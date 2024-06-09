import React from 'react'

import { API, type Voice, voiceOptions } from './lib/openai'
import { audioAPI } from './lib/audio'
import type { SpeakerConfig } from './types'
import { css } from '@emotion/react'

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
  color: string
  onChange: (speakerConfig: SpeakerConfig) => void | Promise<void> | undefined
}

const flex = css`
  display: flex;
  flex-direction: column;
`

const flexItem = css`
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  border-bottom: none;
  background-color: white;

  padding: 10px;

  &:last-of-type {
    border-bottom: 2px solid black;
  }
`

export function Speaker({
  handle,
  index,
  config,
  color,
  onChange,
}: SpeakerProps) {
  // const [handle, updateHandle] = React.useState(handle);
  const [speakerId, setSpeakerId] = React.useState<string>(config.deviceId)

  const [voice, setVoice] = React.useState<Voice>(config.voice)

  const [volume, setVolume] = React.useState<number>(config.volume)

  async function say() {
    await API.say(
      `Hi! My name is ${handle.replace('[', '').replace(']', '')}`,
      {
        voice,
        deviceId: speakerId,
        volume,
      },
    )
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ height: '200px', margin: 'auto' }}>
        <img
          src={imageMap[handle as keyof typeof imageMap]}
          alt="Helios"
          style={{ height: '100%' }}
        />
      </div>
      <div css={flex}>
        <div
          css={css`
            ${flexItem};
            background-color: ${color};
          `}
          style={{ textAlign: 'center' }}
        >
          <a
            css={css`
              text-decoration: none;
              &:visited {
                color: black;
              }
            `}
            href="#"
            onClick={copyToClipboard}
          >
            {handle}
          </a>
        </div>

        <div css={flexItem}>
          <select
            value={speakerId}
            onChange={(e) => setSpeakerId(e.target.value)}
          >
            {audioAPI.outputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
        <div css={flexItem}>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value as any)}
          >
            {voiceOptions.map((voice) => (
              <option key={voice} value={voice}>
                {voice}
              </option>
            ))}
          </select>
        </div>

        <div css={flexItem}>
          <input
            type="range"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            min={0}
            max={2}
            step={0.01}
          />
        </div>

        <div css={flexItem}>
          <button onClick={() => say()}>🗣️</button>
        </div>
      </div>
    </div>
  )
}
