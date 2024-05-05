import React from "react";
import type { Line } from "./types";

export type ConversationProps = {
  onSay: (lines: Line[]) => void | Promise<void> | undefined;
};

const testConversation: string = `
[SPEAKER1]
Hello my name is speaker one


[SPEAKER2]
Hello my name is speaker two


[SPEAKER3]
Hello my name is speaker three
`;

export function Conversation({ onSay }: ConversationProps) {
  const [conversationTitle, setConversationTitle] =
    React.useState("Conversation title");

  const [conversationText, setConversationText] =
    React.useState(testConversation);

  const parsedConversation = React.useMemo(() => {
    const lines = conversationText.split("\n");

    const parsed: Line[] = [];

    let currentSpeaker = "";
    let currentText = "";

    for (const line of lines) {
      if (line.startsWith("[")) {
        if (currentSpeaker) {
          parsed.push({ speaker: currentSpeaker, text: currentText });
        }

        currentSpeaker = line;
        currentText = "";
      } else {
        currentText += line + "\n";
      }
    }

    if (currentSpeaker) {
      parsed.push({ speaker: currentSpeaker, text: currentText });
    }

    return parsed;
  }, [conversationText]);

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
      <button onClick={() => onSay(parsedConversation)}>Speak</button>
    </div>
  );
}
