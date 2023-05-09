import { ChatCompletionOptions } from "./openai";

type Message = {
  content: string;
  metadata?: any;
};

export type SystemMessage = Message & {
  role: "system";
};

export type UserMessage = Message & {
  role: "user";
};

export type AIMessage = Message & {
  role: "ai";
};

export type ChatMessage = SystemMessage | UserMessage | AIMessage;

export type PromptResponse = {
  prompts: ChatMessage[];
  output: string;
  timestamp: number;
  estimatedTokens: number;
  model: ChatCompletionOptions["model"];
};
