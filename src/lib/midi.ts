class MidiAPI {
  private midi: MIDIAccess | null

  private noteOnListeners: ((note: number, velocity: number) => void)[] = []

  constructor() {
    this.midi = null
  }

  async init() {
    this.midi = await navigator.requestMIDIAccess({
      sysex: true,
    })

    this.midi?.inputs.forEach((input) => {
      console.log(input)

      input.onmidimessage = (message: MIDIMessageEvent) =>
        this.handleMidiMessage(message)
    })
  }

  public addNoteOnListener(listener: (note: number, velocity: number) => void) {
    this.noteOnListeners.push(listener)
  }

  onNote(note: number, velocity: number) {
    if (velocity > 0) {
      this.noteOnListeners.forEach((listener) => listener(note, velocity))
    }
  }

  onPad(note: number, velocity: number) {
    console.log('onPad', note, velocity)
  }

  onModWheel(velocity: number) {
    console.log('onModWheel', velocity)
  }

  onPitchBend(velocity: number) {
    console.log('onPitchBend', velocity)
  }

  handleMidiMessage(message: MIDIMessageEvent) {
    const parsed = this.parseMidiMessage(message)
    if (!parsed) {
      return
    }

    const { command, channel, note, velocity } = parsed

    // Stop command.
    // Negative velocity is an upward release rather than a downward press.
    if (command === 8) {
      this.onNote(note, -velocity)
    }

    // Start command.
    else if (command === 9) {
      this.onNote(note, velocity)
    }

    // Knob command.
    else if (command === 11) {
      if (note === 1) this.onModWheel(velocity)
    }

    // Pitch bend command.
    else if (command === 14) {
      this.onPitchBend(velocity)
    }
  }

  parseMidiMessage(message: MIDIMessageEvent) {
    if (!message.data || message.data.length < 3) {
      return null
    }

    return {
      command: message.data[0] >> 4,
      channel: message.data[0] & 0xf,
      note: message.data[1],
      velocity: message.data[2] / 127,
    }
  }
}

const midiAPI = new MidiAPI()

export default midiAPI
