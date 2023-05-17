import { ai, user } from "./message";
import {
  ChatCompletionMessage,
  ChatCompletionOptions,
  fetchChatCompletion,
  fetchChatCompletionStream,
  getChatCompletionOptions,
} from "./openai";
import { getChatEstimatedTokenCount, getEncoder } from "./tokens";
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

  return await createPromptResponse(options, castedPrompts, output, tokenCount);
}

export async function promptStream(
  prompts: (string | ChatMessage)[],
  options: {
    openAiApiKey?: string;
    onToken?: (token: string, res: PromptResponse) => void | Promise<void>;
    onComplete?: (res: PromptResponse) => void | Promise<void>;
  } & Partial<ChatCompletionOptions> = {}
): Promise<ReadableStream> {
  const { prompts: castedPrompts, serializedPrompts } = createPrompts(prompts);

  const res = await fetchChatCompletionStream(serializedPrompts, options);
  const decoder = new TextDecoder();
  const chunks: string[] = [];

  return res.pipeThrough(
    new TransformStream({
      async transform(chunk, controller) {
        const token = decoder.decode(chunk);

        chunks.push(token);
        controller.enqueue(chunk);

        if (options.onToken) {
          await options.onToken(
            token,
            await createPromptResponse(options, castedPrompts, chunks.join(""))
          );
        }
      },
      async flush() {
        if (options.onComplete) {
          await options.onComplete(
            await createPromptResponse(options, castedPrompts, chunks.join(""))
          );
        }
      },
    })
  );
}

async function createPromptResponse(
  options: Partial<ChatCompletionOptions>,
  prompts: ChatMessage[],
  output: string,
  tokenCount?: number
): Promise<PromptResponse> {
  const encoder = await getEncoder();
  const { model } = getChatCompletionOptions(options);
  const timestamp = Date.now();
  const allPrompts = prompts.concat(ai(output));

  return {
    model,
    output,
    prompts: allPrompts,
    timestamp,
    estimatedTokens:
      tokenCount ?? getChatEstimatedTokenCount(encoder, allPrompts),
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
