import { ai, user } from "./message";
import { ChatCompletionOptions, fetchChatCompletion } from "./openai";
import { ChatMessage, PromptResponse } from "./types";

export async function prompt(
  prompts: (string | ChatMessage)[],
  options: { openAiApiKey?: string } & Partial<ChatCompletionOptions> = {}
): Promise<PromptResponse> {
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

  const output = await fetchChatCompletion(serializedPrompts, options);

  return {
    output,
    prompts: castedPrompts.concat(ai(output)),
    timestamp: Date.now(),
  };
}
