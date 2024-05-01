import React from "react";

import { API, type Voice, voiceOptions } from "./lib/openai";
import { audioAPI } from "./lib/audio";
import type { SpeakerConfig } from "./types";

export type SpeakerProps = {
  handle: string;
  onChange: (speakerConfig: SpeakerConfig) => void | Promise<void> | undefined;
};

export function Speaker({ handle, onChange }: SpeakerProps) {
  // const [handle, updateHandle] = React.useState(handle);
  const [speakerId, setSpeakerId] = React.useState<string | undefined>(
    undefined
  );

  const [voice, setVoice] = React.useState<Voice>(voiceOptions[0]);

  async function say() {
    const audio = await API.say(
      handle.replace("[", "").replace("]", ""),
      voice
    );
    if (!audio) return;

    await audioAPI.play(audio, speakerId);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(handle);

    //TODO: show toast
  }

  React.useEffect(() => {
    if (!speakerId) return;

    onChange({ deviceId: speakerId, voice });
  }, [speakerId, voice]);

  return (
    <>
      {/* <textarea value={handle} onChange={(e) => updateHandle(e.target.value)} /> */}
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

      <button onClick={() => say()}>Speak</button>
    </>
  );
}
