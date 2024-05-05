import type OpenAI from 'openai'
import type { Stream } from 'openai/streaming.mjs'
import React from 'react'

import { API } from './lib/openai'
import { audioAPI } from './lib/audio'

export function TTSTest() {
  const [text, updateText] = React.useState('Hello, world!')

  async function speak() {
    async function processStream(
      stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    ) {
      for await (const chunk of stream) {
        console.log('Received chunk:', chunk.choices[0].delta.content)
      }
    }

    const stream = await API.completeChatStream(text)

    await processStream(stream)
  }

  async function playAudioFromStream(
    readableStream: ReadableStream<Uint8Array>,
  ) {
    const audioContext = new AudioContext()
    let reader = readableStream.getReader()
    let chunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const arrayBuffer = new Blob(chunks).arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(await arrayBuffer)

    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.start(0)
  }

  async function say() {
    const audio = await API.say(text)
    if (!audio) return

    await audioAPI.play(audio)
  }

  return (
    <>
      <textarea value={text} onChange={(e) => updateText(e.target.value)} />

      <button onClick={() => say()}>Speak</button>
    </>
  )
}
