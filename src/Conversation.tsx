import React from "react";
import { parseConversation, type Conversation, type Line } from "./types";

export type ConversationProps = {
  conversation: Conversation;
  updateConversation: (conversation: Conversation) => void;
  onSay: (lines: Line[]) => void | Promise<void> | undefined;
};

export function Conversation({
  conversation,
  updateConversation,
  onSay,
}: ConversationProps) {
  const [conversationTitle, setConversationTitle] = React.useState(
    conversation.title
  );

  const [conversationText, setConversationText] = React.useState(
    conversation.text
  );

  const parsedConversation = React.useMemo(() => {
    return parseConversation(conversationText);
  }, [conversationText]);

  React.useEffect(() => {
    updateConversation({
      title: conversationTitle,
      text: conversationText,
      lines: parseConversation(conversationText),
    });
  }, [conversationTitle, conversationText]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid black",
        padding: "10px",
      }}
    >
      <input
        value={conversationTitle}
        onChange={(e) => setConversationTitle(e.target.value)}
      />
      <textarea
        rows={10}
        value={conversationText}
        onChange={(e) => setConversationText(e.target.value)}
      />
      <button onClick={() => onSay(parsedConversation)}>Add to queue</button>
    </div>
  );
}
