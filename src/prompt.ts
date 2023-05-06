import { ai, user } from "./message";
import {
  ChatCompletionMessage,
  ChatCompletionOptions,
  fetchChatCompletion,
  fetchChatCompletionStream,
} from "./openai";
import { getChatEstimatedTokenCount } from "./tokens";
import { ChatMessage, PromptResponse } from "./types";

export async function prompt(
  prompts: (string | ChatMessage)[],
  options: { openAiApiKey?: string } & Partial<ChatCompletionOptions> = {}
): Promise<PromptResponse> {
  const { prompts: castedPrompts, serializedPrompts } = createPrompts(prompts);
  const { output, tokenCount } = await fetchChatCompletion(
    serializedPrompts,
    options
  );

  return createPromptResponse(castedPrompts, output, tokenCount);
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
  output: string,
  tokenCount?: number
): PromptResponse {
  const timestamp = Date.now();
  const allPrompts = prompts.concat(ai(output));

  return {
    output,
    prompts: allPrompts,
    timestamp,
    estimatedTokens: tokenCount ?? getChatEstimatedTokenCount(allPrompts),
  };
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
