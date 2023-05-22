# `prompt`

A lightweight interface to OpenAI's Chat-based LLMs

#### Features

- Edge compatible
- Streaming support (via `ReadableStream`)
  - Includes accurate token count estimation.
  - `onToken` and `onComplete` callbacks.

---

Input your prompts as a series of messages from the 3 possible roles: `system`, `ai` ("assistant") or `user`. `prompt` will read your OpenAI API key from `process.env.OPENAI_API_KEY`.

```ts
import { prompt, system, user } from "@adriancooney/prompt";

const response = await prompt([
  system("You are a helpful AI assistant"),
  user("If you drop a bowl of detergent, is it really a mess?"),
]);

console.log(response);

// {
//   model: 'gpt-4',
//   output: 'If you drop a bowl of detergent, it can be considered a mess in the sense that it requires cleaning up. Although detergent is a cleaning agent, it can create slippery surfaces, pose a risk to children or pets who may ingest it, and potentially damage certain materials. It is important to clean up any spilled detergent promptly to avoid potential hazards.',
//   prompts: [
//     { role: 'system', content: 'You are a helpful AI assistant' },
//     {
//       role: 'user',
//       content: 'If you drop a bowl of detergent, is it really a mess?'
//     },
//     {
//       role: 'ai',
//       content: 'If you drop a bowl of detergent, it can be considered a mess in the sense that it requires cleaning up. Although detergent is a cleaning agent, it can create slippery surfaces, pose a risk to children or pets who may ingest it, and potentially damage certain materials. It is important to clean up any spilled detergent promptly to avoid potential hazards.'
//     }
//   ],
//   timestamp: 1684781024503,
//   duration: 13577,
//   estimatedTokens: 100
// }
```

The response object contains the following properties:

- `output` - The full text output receive from the model. (`string`)
- `model` - The OpenAI Chat Completion model used. (`gpt-4` or `gpt-3.5-turbo` (default))
- `prompts` - The input array of messages and the output `ai` message. (`ChatMessage[]`)
- `timestamp` - The time the completion operation started at. (`number` ms)
- `duration` - The time it took to complete the operation. (`number` ms)
- `estimatedTokens` - The amount of tokens the operation used. Exact value when called via `prompt`, an accurate estimate when called via `promptStream`. (`number`)

Sending another message to the chat is a matter of appending the `prompts` returned from previous calls:

```ts
import { prompt, system, user } from "@adriancooney/prompt";

const { prompts } = await prompt([
  system("You are a helpful AI assistant"),
  user("If you drop a bowl of detergent, is it really a mess?"),
]);

const { output } = await prompt([
  ...prompts,
  user("Can you repeat your answer in a Batman monologue?"),
]);

console.log(output);

// *dramatic Batman voice* In the shadows of the night, a fallen bowl of detergent
// lurks. Though it cleans, it brings chaos, danger to unsuspecting victims. We must
// act swiftly to vanquish this foe, for the sake of Gotham's children and creatures.
// The darkness awaits, but justice will prevail..
```

To stream your response from an Edge function in Next.js, use the `promptStream` method. It's options are the same with the addition of two callbacks, `onToken` and `onComplete`.

```ts
export const runtime = "edge";

export async function POST(request: Request) {
  return await promptStream(
    [
      system("You are a helpful AI assistant"),
      user("If you drop a bowl of detergent, is it really a mess?"),
    ],
    {
      onToken(token, response) {
        console.log(token);
      },

      onComplete(response) {
        await sql`
          INSERT INTO messages(content, estimated_tokens) VALUES(${response.output}, ${response.estimatedTokens});
        `;
      },
    }
  );
}
```

Configure the prompt:

```ts
await prompt(
  [
    system("You are a helpful AI assistant"),
    user("If you drop a bowl of detergent, is it really a mess?"),
  ],
  {
    apiKey: "...", // defaults process.env.OPENAI_API_KEY
    model: "gpt-3.5-turbo", // defaults process.env.OPENAI_MODEL
    frequencyPenalty: 1, // defaults process.env.OPENAI_FREQUENCY_PENALTY
    presencePenalty: 1, // defaults process.env.OPENAI_PRESENCE_PENALTY
    maxTokens: 7, // defaults process.env.OPENAI_MAX_TOKENS
    temperature: 0, // defaults process.env.OPENAI_TEMPERATURE
    topP: 1, // defaults process.env.OPENAI_TOP_P
  }
);
```

If an error is called, an `OpenAIError` will be thrown and a `OpenAIModelOverloadedError` when the server is overloaded.

```ts
import {
  prompt,
  system,
  user,
  OpenAIError,
  OpenAIModelOverloadedError,
} from "@adriancooney/prompt";

try {
  await prompt([
    // ...
  ]);
} catch (err) {
  if (err instanceof OpenAIModelOverloadedError) {
    console.log(
      "Open AI is overloaded and ignoring us! Please try again later."
    );
  }

  if (err instanceof OpenAIError) {
    console.log(err);
  }

  throw err;
}
```
