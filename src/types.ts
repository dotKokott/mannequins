import type { Voice } from "./lib/openai";

export type ParsedConversation = {
  speaker: string;
  text: string;
}[];

export type SpeakerConfig = {
  deviceId: string;
  voice: Voice;
};
