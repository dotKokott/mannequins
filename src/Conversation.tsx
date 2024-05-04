import React from "react";
import type { ParsedConversation } from "./types";

export type ConversationProps = {
  onSay: (conversation: ParsedConversation) => void | Promise<void> | undefined;
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
  const [conversationText, setConversationText] =
    React.useState(testConversation);

  const parsedConversation = React.useMemo(() => {
    const lines = conversationText.split("\n");

    const parsed: ParsedConversation = [];

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
    <>
      <textarea
        rows={10}
        value={conversationText}
        onChange={(e) => setConversationText(e.target.value)}
      />
      <button onClick={() => onSay(parsedConversation)}>Speak</button>
    </>
  );
}
