import React from "react";
import type { Line } from "./types";
import { useConversationStore } from "./store/conversationStore";

export type ConversationQueueProps = {
  queue: Line[];
};

export function ConversationQueue({ queue }: ConversationQueueProps) {
  return (
    <div>
      <h3>Conversation Queue</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {queue.map((conversation, index) => (
          <div key={index} style={{ border: "1px solid black" }}>
            <span>{conversation.speaker}</span>
            <p>{conversation.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConversationPlayer() {
  const queue = useConversationStore((state) => state.lineQueue);
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
