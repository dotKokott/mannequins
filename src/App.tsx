import React from "react";
import { Config } from "./Config";
import { Conversation } from "./Conversation";
import { Speaker } from "./Speaker";
import type { ParsedConversation, SpeakerConfig } from "./types";
import { API } from "./lib/openai";
import { audioAPI } from "./lib/audio";

class ConversationHandler {
  public speakerConfigs = new Map<string, SpeakerConfig>();
  public conversationQueue: ParsedConversation = [];
  public isPlaying = true;
  public cancel = false;

  private constructor() {
    this.speakerConfigs.set("[SPEAKER1]", {
      deviceId: "default",
      voice: "alloy",
    });
    this.speakerConfigs.set("[SPEAKER2]", {
      deviceId: "default",
      voice: "alloy",
    });
    this.speakerConfigs.set("[SPEAKER3]", {
      deviceId: "default",
      voice: "alloy",
    });

    this.conversationLoop();
  }

  private static instance: ConversationHandler;
  static getInstance() {
    if (!ConversationHandler.instance) {
      ConversationHandler.instance = new ConversationHandler();
    }

    return ConversationHandler.instance;
  }

  public setSpeakerConfig(speaker: string, config: SpeakerConfig) {
    this.speakerConfigs.set(speaker, config);
  }

  public queue(conversation: ParsedConversation) {
    this.conversationQueue.push(...conversation);
  }

  async say(conversation: ParsedConversation) {}

  async conversationLoop() {
    while (!this.cancel) {
      if (this.conversationQueue.length === 0 || !this.isPlaying) {
        console.log("No conversations queued. Waiting...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        continue;
      }

      const conversation = this.conversationQueue.shift();
      if (!conversation) continue;

      const { speaker, text } = conversation;
      const config = this.speakerConfigs.get(speaker);
      if (!config) continue;

      console.log(`Saying: ${text} as ${speaker}`);
      const audio = await API.say(text, config.voice);
      if (!audio) continue;

      console.log(`Playing audio on ${config.deviceId}`);
      await audioAPI.play(audio, config.deviceId);
    }
  }
}

export function App() {
  // const [currentConversation, setCurrentConversation] = React.useState<
  //   ParsedConversation | undefined
  // >(undefined);
  const handler = ConversationHandler.getInstance();
  const speakers = Array.from(handler.speakerConfigs.keys());

  return (
    <>
      <p>{"Life in Plastic"}</p>
      <Config />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {speakers.map((speaker) => (
          <Speaker
            key={speaker}
            handle={speaker}
            onChange={(config) => handler.setSpeakerConfig(speaker, config)}
          />
        ))}
        <Conversation onSay={(conversation) => handler.queue(conversation)} />
      </div>
    </>
  );
}
