import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import { debug } from "./debug";
import { OpenAIError, OpenAIModelOverloadedError } from "./errors";

const SERVER_OVERLOADED_ERROR_MATCHER = /overloaded/i;

export type ChatCompletionMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatCompletionOptions = {
  apiKey: string;
  model: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4";
  frequencyPenalty?: number;
  maxTokens?: number;
  presencePenalty?: number;
  temperature?: number;
  topP?: number;
};

export async function fetchChatCompletion(
  messages: ChatCompletionMessage[],
  options: ChatCompletionOptions
): Promise<{ output: string; tokenCount: number }> {
  const res = await fetchChatCompletionResponse(messages, options);
  const text = await res.text();

  const json = JSON.parse(text) as {
    choices: {
      message: {
        role: "assistant";
        content: string;
      };
    }[];
    usage: {
      total_tokens: number;
    };
  };

  return {
    output: json.choices[0].message.content,
    tokenCount: json.usage.total_tokens,
  };
}

export async function fetchChatCompletionStream(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  options: ChatCompletionOptions
): Promise<ReadableStream> {
  const res = await fetchChatCompletionResponse(messages, options, true);

  if (!res.body) {
    throw new Error("OpenAI API response has no body, cannot create stream");
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        try {
          if (event.type === "event") {
            const data = event.data;

            if (data === "[DONE]") {
              controller.close();
              return;
            }

            const json = JSON.parse(data);
            const token = json.choices[0].delta.content;

            controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          controller.error(err);
        }
      }

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return readable;
}

async function fetchChatCompletionResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  options: ChatCompletionOptions,
  stream: boolean = false
): Promise<Response> {
  const { apiKey, ...fullOptions } = options;

  debug(`>> POST https://api.openai.com/v1/chat/completions`, {
    ...fullOptions,
    stream,
    messages,
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

    debug(
      `!! POST https://api.openai.com/v1/chat/completions failed ${res.status} ${res.statusText}`,
      { text }
    );

    try {
      const { error } = JSON.parse(text) as {
        error: {
          message: string;
          type: string;
          code: string | null;
        };
      };

      if (error.message.match(SERVER_OVERLOADED_ERROR_MATCHER)) {
        throw new OpenAIModelOverloadedError(
          error.type,
          error.code,
          error.message
        );
      }

      throw new OpenAIError(error.type, error.code, error.message);
    } catch (err) {
      throw new OpenAIError(
        "unknown",
        null,
        `Failed to fetch OpenAI API: ${text.slice(0, 1000)}`
      );
    }
  }

  debug(
    `<< POST https://api.openai.com/v1/chat/completions ${res.status} ${res.statusText}`
  );

  return res;
}
