import { ai, user } from "./message";
import {
  ChatCompletionMessage,
  ChatCompletionOptions,
  fetchChatCompletion,
  fetchChatCompletionStream,
} from "./openai";
import { ChatMessage, PromptResponse } from "./types";

export async function prompt(
  prompts: (string | ChatMessage)[],
  options: { openAiApiKey?: string } & Partial<ChatCompletionOptions> = {}
): Promise<PromptResponse> {
  const { prompts: castedPrompts, serializedPrompts } = createPrompts(prompts);
  const output = await fetchChatCompletion(serializedPrompts, options);

  return {
    output,
    prompts: castedPrompts.concat(ai(output)),
    timestamp: Date.now(),
  };
}

export async function promptStream(
  prompts: (string | ChatMessage)[],
  options: { openAiApiKey?: string } & Partial<ChatCompletionOptions> = {}
): Promise<ReadableStream> {
  const { prompts: castedPrompts, serializedPrompts } = createPrompts(prompts);

  return await fetchChatCompletionStream(serializedPrompts, options);
}

function createPrompts(prompts: (string | ChatMessage)[]): {
  prompts: ChatMessage[];
  serializedPrompts: ChatCompletionMessage[];
} {
  const castedPrompts = prompts.map((prompt) =>
    typeof prompt === "string" ? user(prompt) : prompt
  );

  const serializedPrompts = castedPrompts.map((prompt) => ({
    role: (prompt.role === "ai" ? "assistant" : prompt.role) as
      | "user"
      | "system"
      | "assistant",
    content: prompt.content,
  }));

  return {
    prompts: castedPrompts,
    serializedPrompts,
  };
}
