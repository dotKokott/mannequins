class AudioAPI {
  public outputDevices: MediaDeviceInfo[] = []
  public contexts: Record<string, AudioContext> = {}

  public async initialize() {
    this.outputDevices = await AudioAPI.enumerateDevices()

    console.log(this.outputDevices)

    this.contexts = this.outputDevices.reduce(
      (acc, device) => {
        const context = new AudioContext({
          sinkId: device.deviceId !== 'default' ? device.deviceId : undefined,
        })

        acc[device.deviceId] = context
        return acc
      },
      {} as Record<string, AudioContext>,
    )
  }

  public static async enumerateDevices() {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    const devices = await navigator.mediaDevices.enumerateDevices()

    const audioDevices = devices.filter((device) => {
      return device.kind === 'audiooutput'
    })

    return audioDevices
  }

  public async play(buffer: ArrayBuffer, where: string = 'default') {
    if (!this.contexts[where]) {
      throw new Error(`No audio context for device ${where}`)
    }

    const context = this.contexts[where]

    const audioBuffer = await context.decodeAudioData(buffer)

    const source = context.createBufferSource()
    source.buffer = audioBuffer
    source.connect(context.destination)
    source.start(0)

    // resolve once the audio has finished playing
    return new Promise<void>((resolve) => {
      source.onended = () => {
        resolve()
      }
    })
  }
}

const audioAPI = new AudioAPI()
await audioAPI.initialize()

export { audioAPI }
