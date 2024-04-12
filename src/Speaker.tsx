import type OpenAI from "openai";
import type { Stream } from "openai/streaming.mjs";
import React from "react";

import { API } from "./lib/openai";
import { audioAPI } from "./lib/audio";

export function Speaker() {
  const [text, updateText] = React.useState("Hello, world!");
  const [speakerId, setSpeakerId] = React.useState<string | undefined>(
    undefined
  );

  async function say() {
    const audio = await API.say(text);
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

      <button onClick={() => say()}>Speak</button>
    </>
  );
}
