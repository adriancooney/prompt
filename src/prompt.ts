import { ai, user } from "./message";
import {
  ChatCompletionMessage,
  ChatCompletionOptions,
  fetchChatCompletion,
  fetchChatCompletionStream,
} from "./openai";
import { getChatEstimatedTokenCount, getEncoder } from "./tokens";
import { ChatMessage, PromptResponse } from "./types";

const DEFAULT_OPENAI_FREQUENCY_PENALTY = 0;
const DEFAULT_OPENAI_MAX_TOKENS = 1000;
const DEFAULT_OPENAI_MODEL = "gpt-3.5-turbo";
const DEFAULT_OPENAI_PRESENCE_PENALTY = 0;
const DEFAULT_OPENAI_TEMPERATURE = 0.7;
const DEFAULT_OPENAI_TOP_P = 1;

export async function prompt(
  prompts: (string | ChatMessage)[],
  options: Partial<ChatCompletionOptions> = {}
): Promise<PromptResponse> {
  const timeStart = Date.now();
  const { prompts: castedPrompts, serializedPrompts } = createPrompts(prompts);
  const { output, tokenCount } = await fetchChatCompletion(
    serializedPrompts,
    getChatCompletionOptions(options)
  );

  return await createPromptResponse(
    options,
    castedPrompts,
    output,
    timeStart,
    tokenCount
  );
}

export async function promptStream(
  prompts: (string | ChatMessage)[],
  options: {
    onToken?: (token: string, res: PromptResponse) => void | Promise<void>;
    onComplete?: (res: PromptResponse) => void | Promise<void>;
  } & Partial<ChatCompletionOptions> = {}
): Promise<ReadableStream> {
  const timeStart = Date.now();
  const { prompts: castedPrompts, serializedPrompts } = createPrompts(prompts);

  const res = await fetchChatCompletionStream(
    serializedPrompts,
    getChatCompletionOptions(options)
  );

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
            await createPromptResponse(
              options,
              castedPrompts,
              chunks.join(""),
              timeStart
            )
          );
        }
      },
      async flush() {
        if (options.onComplete) {
          await options.onComplete(
            await createPromptResponse(
              options,
              castedPrompts,
              chunks.join(""),
              timeStart
            )
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
  timeStart: number,
  tokenCount?: number
): Promise<PromptResponse> {
  const encoder = await getEncoder();
  const { model } = getChatCompletionOptions(options);
  const now = Date.now();
  const allPrompts = prompts.concat(ai(output));

  return {
    model,
    output,
    prompts: allPrompts,
    timestamp: timeStart,
    duration: now - timeStart,
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

function getChatCompletionOptions(
  options?: Partial<ChatCompletionOptions>
): ChatCompletionOptions {
  return {
    apiKey: options?.apiKey || getOpenAIApiKey(),
    frequencyPenalty:
      safeParseNumber(process.env.OPENAI_FREQUENCY_PENALTY) ||
      DEFAULT_OPENAI_FREQUENCY_PENALTY,
    maxTokens:
      safeParseNumber(process.env.OPENAI_MAX_TOKENS) ||
      DEFAULT_OPENAI_MAX_TOKENS,
    model:
      (process.env.OPENAI_MODEL as
        | ChatCompletionOptions["model"]
        | undefined) || DEFAULT_OPENAI_MODEL,
    presencePenalty:
      safeParseNumber(process.env.OPENAI_PRESENCE_PENALTY) ||
      DEFAULT_OPENAI_PRESENCE_PENALTY,
    temperature:
      safeParseNumber(process.env.OPENAI_TEMPERATURE) ||
      DEFAULT_OPENAI_TEMPERATURE,
    topP: safeParseNumber(process.env.OPENAI_TOP_P) || DEFAULT_OPENAI_TOP_P,
    ...options,
  };
}

function getOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(`OPENAI_API_KEY environment variable not set`);
  }

  return key;
}

function safeParseNumber(value: string | undefined): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}
