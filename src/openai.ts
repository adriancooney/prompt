const DEFAULT_OPEN_AI_FREQUENCY_PENALTY = 0;
const DEFAULT_OPEN_AI_MAX_TOKENS = 1000;
const DEFAULT_OPEN_AI_MODEL = "gpt-3.5-turbo";
const DEFAULT_OPEN_AI_PRESENCE_PENALTY = 0;
const DEFAULT_OPEN_AI_TEMPERATURE = 0.7;
const DEFAULT_OPEN_AI_TOP_P = 1;

export type ChatCompletionMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatCompletionOptions = {
  apiKey: string;
  frequencyPenalty: number;
  maxTokens: number;
  model: "gpt-3.5-turbo" | "gpt-4";
  presencePenalty: number;
  temperature: number;
  topP: number;
};

export async function fetchChatCompletion(
  messages: ChatCompletionMessage[],
  options?: Partial<ChatCompletionOptions>
): Promise<string> {
  const res = await fetchChatCompletionResponse(messages, options);
  const text = await res.text();

  const json = JSON.parse(text) as {
    choices: {
      message: {
        role: "assistant";
        content: string;
      };
    }[];
  };

  return json.choices[0].message.content;
}

export async function fetchChatCompletionStream(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  options?: Partial<ChatCompletionOptions>
): Promise<ReadableStream> {
  const res = await fetchChatCompletionResponse(messages, options, true);

  if (!res.body) {
    throw new Error("OpenAI API response has no body");
  }

  return res.body;
}

async function fetchChatCompletionResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  options: Partial<ChatCompletionOptions> = {},
  stream: boolean = false
): Promise<Response> {
  const fullOptions = getChatCompletionOptions(options);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${fullOptions.apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      frequency_penalty: fullOptions.frequencyPenalty,
      max_tokens: fullOptions.maxTokens,
      model: fullOptions.model,
      presence_penalty: fullOptions.presencePenalty,
      temperature: fullOptions.temperature,
      top_p: fullOptions.topP,
      stream,
    }),
  });

  if (!res.ok) {
    const text = await res.text();

    throw new Error(`Failed to fetch OpenAI API: ${text.slice(0, 1000)}`);
  }

  return res;
}

function getOpenAiApiKey(): string {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(`OPENAI_API_KEY environment variable not set`);
  }

  return key;
}

function getChatCompletionOptions(
  options?: Partial<ChatCompletionOptions>
): ChatCompletionOptions {
  return {
    apiKey: getOpenAiApiKey(),
    frequencyPenalty:
      safeParseNumber(process.env.OPEN_AI_FREQUENCY_PENALTY) ||
      DEFAULT_OPEN_AI_FREQUENCY_PENALTY,
    maxTokens:
      safeParseNumber(process.env.OPEN_AI_MAX_TOKENS) ||
      DEFAULT_OPEN_AI_MAX_TOKENS,
    model:
      (process.env.OPEN_AI_MODEL as
        | ChatCompletionOptions["model"]
        | undefined) || DEFAULT_OPEN_AI_MODEL,
    presencePenalty:
      safeParseNumber(process.env.OPEN_AI_PRESENCE_PENALTY) ||
      DEFAULT_OPEN_AI_PRESENCE_PENALTY,
    temperature:
      safeParseNumber(process.env.OPEN_AI_TEMPERATURE) ||
      DEFAULT_OPEN_AI_TEMPERATURE,
    topP: safeParseNumber(process.env.OPEN_AI_TOP_P) || DEFAULT_OPEN_AI_TOP_P,
    ...options,
  };
}

function safeParseNumber(value: string | undefined): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}
