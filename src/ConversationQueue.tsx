import React from "react";
import type { ParsedConversation } from "./types";
import { useConversationStore } from "./store/conversationStore";

export type ConversationQueueProps = {
  queue: ParsedConversation;
};

export function ConversationQueue({ queue }: ConversationQueueProps) {
  return (
    <div>
      <h1>Conversation Queue</h1>
      <div>
        {queue.map((conversation, index) => (
          <div key={index}>
            <h2>{conversation.speaker}</h2>
            <p>{conversation.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConversationPlayer() {
  const queue = useConversationStore((state) => state.conversationQueue);
  const [isPlaying, setIsPlaying] = useConversationStore((state) => [
    state.isPlaying,
    state.setIsPlaying,
  ]);

  const play = () => {
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  return (
    <div>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <ConversationQueue queue={queue} />
    </div>
  );
}
