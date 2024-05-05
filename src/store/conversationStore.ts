import { create } from "zustand";
import type { ParsedConversation, SpeakerConfig } from "../types";
import { immer } from "zustand/middleware/immer";
import { API } from "../lib/openai";
import { audioAPI } from "../lib/audio";

interface ConversationStore {
  speakerConfigs: Map<string, SpeakerConfig>;
  conversationQueue: ParsedConversation;
  isPlaying: boolean;

  setIsPlaying: (isPlaying: boolean) => void;
  setSpeakerConfig: (speaker: string, config: SpeakerConfig) => void;
  addToQueue: (conversation: ParsedConversation) => void;
  conversationLoop: () => void;
}

const useConversationStore = create<ConversationStore>()(
  immer((set, get) => ({
    speakerConfigs: new Map<string, SpeakerConfig>(
      new Map([
        ["[SPEAKER1]", { deviceId: "default", voice: "alloy" }],
        ["[SPEAKER2]", { deviceId: "default", voice: "alloy" }],
        ["[SPEAKER3]", { deviceId: "default", voice: "alloy" }],
      ])
    ),
    conversationQueue: [],
    isPlaying: true,

    setConversationQueue: (conversationQueue: ParsedConversation) => {
      set((state) => {
        state.conversationQueue = conversationQueue;
      });
    },

    setIsPlaying: (isPlaying: boolean) => {
      set((state) => {
        state.isPlaying = isPlaying;
      });
    },

    setSpeakerConfig: (speaker: string, config: SpeakerConfig) => {
      set((state) => {
        state.speakerConfigs.set(speaker, config);
      });
    },

    addToQueue: (conversation: ParsedConversation) => {
      set((state) => {
        state.conversationQueue.push(...conversation);
      });
    },

    conversationLoop: async () => {
      while (true) {
        if (get().conversationQueue.length === 0 || !get().isPlaying) {
          console.log("No conversations queued or paused. Waiting...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        const conversation = get().conversationQueue[0];
        set((state) => {
          state.conversationQueue = state.conversationQueue.slice(1);
        });

        if (!conversation) continue;

        const { speaker, text } = conversation;
        const config = get().speakerConfigs.get(speaker);
        if (!config) continue;

        console.log(`Saying: ${text} as ${speaker}`);
        const audio = await API.say(text, config.voice);
        if (!audio) continue;

        console.log(`Playing audio on ${config.deviceId}`);
        await audioAPI.play(audio, config.deviceId);
      }
    },
  }))
);

useConversationStore.getState().conversationLoop();

export { useConversationStore };
