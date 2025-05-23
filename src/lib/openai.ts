import OpenAI from 'openai'
import { audioAPI } from './audio'
import type { SpeakerConfig } from '../types'

export const voiceOptions = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'onyx',
  'nova',
  'sage',
  'shimmer',
  'verse',
] as const
export type Voice = (typeof voiceOptions)[number]

const dbName = 'BufferCacheDB'
const storeName = 'buffers'

// Open the IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export class API {
  // cache for audio buffers
  static bufferCache = new Map<string, ArrayBufferLike>()
  static bufferChanged = false

  private static ttsModel = 'gpt-4o-mini-tts'

  static async getOrCreateBuffer(
    voice: Voice,
    text: string,
    instructions?: string,
  ) {
    const key = `${voice}+${text}-${instructions}`

    if (API.bufferCache.has(key)) {
      console.log('Cache hit')
      return API.bufferCache.get(key) as ArrayBuffer
    }

    console.log('Cache miss')
    return await this.createBuffer(voice, text, instructions)
  }

  static async createBuffer(voice: Voice, text: string, instructions?: string) {
    const response = await this.openaiInstance.audio.speech.create({
      model: API.ttsModel,
      voice: voice,
      input: text,
      response_format: 'opus',
      instructions:
        instructions ||
        'Please speak in a slow and clear manner. Add emotion and personality to the text.',
    })

    const buffer = await response.arrayBuffer()
    const key = `${voice}+${text}-${instructions}`
    API.bufferCache.set(key, buffer)
    API.bufferChanged = true

    await this.storeCache()

    return buffer
  }

  static async storeCache(): Promise<void> {
    if (!API.bufferChanged) {
      return
    }

    const db = await openDB()

    const serializedMap = Array.from(this.bufferCache.entries()).map(
      ([key, buffer]) => ({
        key,
        buffer: buffer, // Ensure we clone the buffer properly
      }),
    )

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(serializedMap, 'bufferCache')

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  }

  static async loadFromCache(): Promise<Map<string, ArrayBuffer>> {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get('bufferCache')

      request.onsuccess = () => {
        const result = request.result || []
        const bufferCache = new Map<string, ArrayBuffer>(
          result.map((entry: { key: string; buffer: ArrayBuffer }) => [
            entry.key,
            entry.buffer,
          ]),
        )
        resolve(bufferCache)
      }

      request.onerror = () => {
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
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
    this.bufferCache = await this.loadFromCache()
  }

  private static completionModel = 'gpt-3.5-turbo-16k-0613'
  public static completionSystemPrompt = ''

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
    // split at first occurrence
    const parts = text.split(/{(\d+)s}(.*)/)
    if (parts.length > 1) {
      // Clean up the parts:
      // 1. Filter out empty strings
      // 2. Trim whitespace and newlines from each part
      const cleanParts = parts
        .filter((part) => part !== '')
        .map((part) => part.trim())
        .filter(Boolean) // removes any parts that became empty after trimming

      const [firstPart, waitTime, ...remainingParts] = cleanParts
      const secondPart = remainingParts.join(' ') // join any remaining parts

      console.log('Clean parts:', cleanParts)

      await this.say(firstPart, config)
      console.log('start wait')
      await new Promise((resolve) =>
        setTimeout(resolve, parseInt(waitTime) * 1000),
      )
      console.log('end wait')
      if (secondPart) {
        await this.say(secondPart, config)
      }
      return
    }

    if (text.length == 0) {
      return
    }

    const buffer = await this.getOrCreateBuffer(
      config.voice,
      text,
      config.voiceInstructions,
    )

    await audioAPI.play(
      buffer.slice(0),
      config.deviceId,
      config.volume,
      config.pan,
    )
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
