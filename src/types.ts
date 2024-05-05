import type { Voice } from "./lib/openai";

export type Conversation = {
  title: string;
  text: string;
  lines: Line[];
};

export type Line = {
  speaker: string;
  text: string;
};

export type SpeakerConfig = {
  deviceId: string;
  voice: Voice;
};
