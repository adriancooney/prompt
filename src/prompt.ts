import { encode } from "gpt-3-encoder";
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

  return createPromptResponse(castedPrompts, output);
}

export async function promptStream(
  prompts: (string | ChatMessage)[],
  options: {
    openAiApiKey?: string;
    onComplete?: (res: PromptResponse) => void | Promise<void>;
  } & Partial<ChatCompletionOptions> = {}
): Promise<ReadableStream> {
  const { prompts: castedPrompts, serializedPrompts } = createPrompts(prompts);

  const res = await fetchChatCompletionStream(serializedPrompts, options);
  const decoder = new TextDecoder();
  const chunks: string[] = [];

  return res.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        chunks.push(decoder.decode(chunk));
        controller.enqueue(chunk);
      },
      async flush() {
        const output = chunks.join("");

        await options.onComplete?.(createPromptResponse(castedPrompts, output));
      },
    })
  );
}

function createPromptResponse(
  prompts: ChatMessage[],
  output: string
): PromptResponse {
  const allPrompts = prompts.concat(ai(output));
  return {
    output,
    prompts: allPrompts,
    timestamp: Date.now(),
    estimatedTokens: countTokens(allPrompts),
  };
}

function countTokens(prompts: ChatMessage[]): number {
  return prompts.reduce(
    (acc, prompt) => acc + encode(prompt.content).length + 4,
    0
  );
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
