import OpenAI from "openai";
import type { Stream } from "openai/streaming.mjs";

export const voiceOptions = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
] as const;
export type Voice = (typeof voiceOptions)[number];

export class API {
  private static openaiInstance = new OpenAI({
    apiKey: "",
    dangerouslyAllowBrowser: true,
  });

  static async setApiKey(apiKey: string) {
    this.openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  private static completionModel = "gpt-3.5-turbo-16k-0613";
  public static completionSystemPrompt = "";

  private static ttsModel = "tts-1"; //tts-1-hd is better

  static async completeChat(text: string) {
    const response = await this.openaiInstance.chat.completions.create({
      model: this.completionModel,
      messages: [{ role: "user", content: text }],

      stream: false,
    });

    return response.choices[0].message.content;
  }

  static async completeChatStream(text: string) {
    const stream = await this.openaiInstance.chat.completions.create({
      model: this.completionModel,
      messages: [{ role: "user", content: text }],
      stream: true,
    });

    return stream;
  }

  static async say(text: string, voice: Voice = "alloy") {
    const response = await this.openaiInstance.audio.speech.create({
      model: this.ttsModel,
      voice,
      input: text,
      response_format: "opus",
    });

    return response.arrayBuffer();
  }

  static async sayStream(text: string, voice: Voice = "alloy") {
    const stream = await this.openaiInstance.audio.speech.create({
      model: this.ttsModel,
      voice: voice,
      input: text,
      response_format: "opus",
    });

    return stream.body;
  }
}
