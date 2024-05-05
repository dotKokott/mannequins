class AudioAPI {
  public outputDevices: MediaDeviceInfo[] = []
  public contexts: Record<string, AudioContext> = {}
  public sources: Record<string, AudioBufferSourceNode> = {}

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

  public async play(
    buffer: ArrayBuffer,
    where: string = 'default',
    volume = 1,
  ) {
    if (!this.contexts[where]) {
      throw new Error(`No audio context for device ${where}`)
    }

    const context = this.contexts[where]

    const audioBuffer = await context.decodeAudioData(buffer)

    if (this.sources[where]) {
      this.sources[where].stop()
      this.sources[where].disconnect()
    }

    this.sources[where] = context.createBufferSource()
    this.sources[where].buffer = audioBuffer
    // this.sources[where].connect(context.destination)
    this.sources[where].start(0)

    const gainNode = context.createGain()
    gainNode.gain.value = volume
    this.sources[where].connect(gainNode)
    gainNode.connect(context.destination)

    // resolve once the audio has finished playing
    return new Promise<void>((resolve) => {
      this.sources[where].onended = () => {
        resolve()
      }
    })
  }

  public async stop(where: string = 'default') {
    if (!this.sources[where]) {
      return
    }

    this.sources[where].stop()
  }
}

const audioAPI = new AudioAPI()
await audioAPI.initialize()

export { audioAPI }
