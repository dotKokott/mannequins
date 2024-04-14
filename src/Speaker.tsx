import React from "react";

import { API, type Voice, voiceOptions } from "./lib/openai";
import { audioAPI } from "./lib/audio";

export function Speaker() {
  const [text, updateText] = React.useState("Hello, world!");
  const [speakerId, setSpeakerId] = React.useState<string | undefined>(
    undefined
  );

  const [voice, setVoice] = React.useState<Voice>(voiceOptions[0]);

  async function say() {
    const audio = await API.say(text, voice);
    if (!audio) return;

    await audioAPI.play(audio, speakerId);
  }

  return (
    <>
      <textarea value={text} onChange={(e) => updateText(e.target.value)} />
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

      <button onClick={() => say()}>Speak</button>
    </>
  );
}
