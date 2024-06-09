import OpenAI from 'openai'
import { audioAPI } from './audio'
import type { SpeakerConfig } from '../types'

export const voiceOptions = [
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer',
] as const
export type Voice = (typeof voiceOptions)[number]

export class API {
  // cache for audio buffers
  // it is a map of [voice + text, buffer]
  static bufferCache: Map<string, ArrayBuffer> = this.getCache()

  static async getOrCreateBuffer(voice: Voice, text: string) {
    const key = `${voice}+${text}`

    if (API.bufferCache.has(key)) {
      console.log('Cache hit')
      return API.bufferCache.get(key) as ArrayBuffer
    }

    console.log('Cache miss')
    return await this.createBuffer(voice, text)
  }

  static async createBuffer(voice: Voice, text: string) {
    const response = await this.openaiInstance.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      response_format: 'opus',
    })

    const buffer = await response.arrayBuffer()
    API.bufferCache.set(`${voice}+${text}`, buffer)

    return buffer
  }

  static async storeCache() {
    localStorage.setItem('bufferCache', JSON.stringify([...API.bufferCache]))
  }

  static getCache() {
    const cache = localStorage.getItem('bufferCache')

    return cache ? new Map(JSON.parse(cache)) : new Map()
  }

  private static openaiInstance = new OpenAI({
    apiKey: '',
    dangerouslyAllowBrowser: true,
  })

  static async setApiKey(apiKey: string) {
    this.openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  }

  private static completionModel = 'gpt-3.5-turbo-16k-0613'
  public static completionSystemPrompt = ''

  private static ttsModel = 'tts-1' //tts-1-hd is better

  static async completeChat(text: string) {
    const response = await this.openaiInstance.chat.completions.create({
      model: this.completionModel,
      messages: [{ role: 'user', content: text }],

      stream: false,
    })

    return response.choices[0].message.content
  }

  static async completeChatStream(text: string) {
    const stream = await this.openaiInstance.chat.completions.create({
      model: this.completionModel,
      messages: [{ role: 'user', content: text }],
      stream: true,
    })

    return stream
  }

  static async say(text: string, config: SpeakerConfig) {
    // if text contains {2s} then split the text into two parts and say the first part, then wait 10 seconds and say the second part
    // text can contain multiple {2s} and they will all be processed

    // split at first occurance
    const parts = text.split(/{(\d+)s}(.*)/)
    if (parts.length > 1) {
      console.log(parts)

      const [firstPart, waitTime, secondPart] = parts

      console.log(`Found wait time: ${parts[1]}`)

      await this.say(firstPart, config)
      await new Promise((resolve) =>
        setTimeout(resolve, parseInt(waitTime) * 1000),
      )
      await this.say(secondPart, config)
      return
    }

    if (text.length == 0) {
      return
    }

    const buffer = await this.getOrCreateBuffer(config.voice, text)

    // the slice is needed because the buffer is a stream and we need to copy it
    await audioAPI.play(buffer.slice(0), config.deviceId, config.volume)
  }

  static async sayStream(text: string, voice: Voice = 'alloy') {
    const stream = await this.openaiInstance.audio.speech.create({
      model: this.ttsModel,
      voice: voice,
      input: text,
      response_format: 'opus',
    })

    return stream.body
  }
}
