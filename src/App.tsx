import React from "react";
import { Config } from "./Config";
import { Conversation } from "./Conversation";
import { Speaker } from "./Speaker";
import { useConversationStore } from "./store/conversationStore";

import { ConversationQueue } from "./ConversationQueue";

export function App() {
  const speakers = useConversationStore((state) =>
    Array.from(state.speakerConfigs.keys())
  );

  const setSpeakerConfig = useConversationStore(
    (state) => state.setSpeakerConfig
  );

  const addToQueue = useConversationStore((state) => state.addToQueue);
  const queue = useConversationStore((state) => state.conversationQueue);

  console.log(speakers);

  return (
    <>
      <p>{"Life in Plastic"}</p>
      <Config />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {speakers.map((speaker) => (
          <Speaker
            key={speaker}
            handle={speaker}
            onChange={(config) => setSpeakerConfig(speaker, config)}
          />
        ))}
        <Conversation onSay={(conversation) => addToQueue(conversation)} />
        <ConversationQueue queue={queue} />
      </div>
    </>
  );
}
