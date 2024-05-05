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

  const conversations = useConversationStore((state) => state.conversations);
  const setConversation = useConversationStore(
    (state) => state.setConversation
  );

  const setSpeakerConfig = useConversationStore(
    (state) => state.setSpeakerConfig
  );

  const addToQueue = useConversationStore((state) => state.addToQueue);
  const queue = useConversationStore((state) => state.lineQueue);

  return (
    <>
      <p>{"Life in Plastic"}</p>
      <Config />
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
          }}
        >
          {speakers.map((speaker) => (
            <Speaker
              key={speaker}
              handle={speaker}
              onChange={(config) => setSpeakerConfig(speaker, config)}
            />
          ))}
        </div>
        {conversations.map((conversation, index) => (
          <Conversation
            key={index}
            conversation={conversation}
            updateConversation={(conversation) =>
              setConversation(index, conversation)
            }
            onSay={(conversation) => addToQueue(conversation)}
          />
        ))}
        {/* <Conversation onSay={(lines) => addToQueue(lines)} /> */}
        <ConversationQueue queue={queue} />
      </div>
    </>
  );
}
