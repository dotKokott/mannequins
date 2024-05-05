import { create } from "zustand";
import {
  parseConversation,
  type Conversation,
  type Line,
  type SpeakerConfig,
} from "../types";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { API } from "../lib/openai";
import { audioAPI } from "../lib/audio";

enableMapSet();

const testConversation: string = `
[SPEAKER1]
Hello my name is speaker one


[SPEAKER2]
Hello my name is speaker two


[SPEAKER3]
Hello my name is speaker three
`;

interface ConversationStore {
  speakerConfigs: Map<string, SpeakerConfig>;
  lineQueue: Line[];
  currentLine: Line | undefined;
  conversations: Conversation[];
  isPlaying: boolean;

  setConversation: (index: number, conversation: Conversation) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeakerConfig: (speaker: string, config: SpeakerConfig) => void;
  addToQueue: (lines: Line[]) => void;
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
    lineQueue: [],
    currentLine: undefined,
    conversations: [
      {
        title: "Test Conversation",
        text: testConversation,
        lines: parseConversation(testConversation),
      },
    ],
    isPlaying: true,

    setConversation: (index: number, conversation: Conversation) => {
      set((state) => {
        state.conversations[index] = conversation;
      });
    },

    setLineQueue: (lineQueue: Line[]) => {
      set((state) => {
        state.lineQueue = lineQueue;
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

    addToQueue: (lines: Line[]) => {
      set((state) => {
        state.lineQueue.push(...lines);
      });
    },

    conversationLoop: async () => {
      while (true) {
        if (get().lineQueue.length === 0 || !get().isPlaying) {
          console.log("No lines queued or paused. Waiting...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        const conversation = get().lineQueue[0];
        set((state) => {
          state.currentLine = state.lineQueue.shift();
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
