import { ai, system, user } from "./message";
import { prompt, promptStream } from "./prompt";
import { fetchChatCompletion, fetchChatCompletionStream } from "./openai";

jest.mock("./openai");

const fetchChatCompletionMock = jest.mocked(fetchChatCompletion);
const fetchChatCompletionStreamMock = jest.mocked(fetchChatCompletionStream);

describe("prompt", () => {
  afterEach(() => {
    fetchChatCompletionMock.mockReset();
  });

  describe("prompt", () => {
    it("handles sending multiple messages", async () => {
      fetchChatCompletionMock.mockResolvedValueOnce("Who's there?");

      const question = "Knock Knock?";
      const result = await prompt([
        system("You are a helpful AI assistant."),
        ai("Good morning, how can I help?"),
        user(question),
      ]);

      expect(result).toMatchInlineSnapshot(`
        {
          "output": "Who's there?",
          "prompts": [
            {
              "content": "You are a helpful AI assistant.",
              "role": "system",
            },
            {
              "content": "Good morning, how can I help?",
              "role": "ai",
            },
            {
              "content": "Knock Knock?",
              "role": "user",
            },
            {
              "content": "Who's there?",
              "role": "ai",
            },
          ],
          "timestamp": 1672531200000,
        }
      `);
    });

    it("converts input strings to user messages", async () => {
      fetchChatCompletionMock.mockResolvedValueOnce("Who's there?");

      const result = await prompt(["Knock knock?"]);

      expect(result).toMatchInlineSnapshot(`
        {
          "output": "Who's there?",
          "prompts": [
            {
              "content": "Knock knock?",
              "role": "user",
            },
            {
              "content": "Who's there?",
              "role": "ai",
            },
          ],
          "timestamp": 1672531200000,
        }
      `);
    });
  });

  describe("promptStream", () => {
    it("returns a stream", async () => {
      fetchChatCompletionStreamMock.mockResolvedValue(
        textStream("Hello back!")
      );

      const res = await promptStream([user("Hello world!")]);

      expect(await text(res)).toEqual("Hello back!");
    });

    it("handles stream complete", async () => {
      fetchChatCompletionStreamMock.mockResolvedValue(textStream("Wow"));

      const response = await new Promise((resolve, reject) => {
        promptStream([user("Hello world!")], {
          onComplete: resolve,
        })
          .then(text)
          .catch(reject);
      });

      expect(response).toMatchInlineSnapshot(`
        {
          "output": "Wow",
          "prompts": [
            {
              "content": "Hello world!",
              "role": "user",
            },
            {
              "content": "Wow",
              "role": "ai",
            },
          ],
          "timestamp": 1672531200000,
        }
      `);
    });
  });
});

async function text(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const chunks = [];

  try {
    while (true) {
      const { value, done } = await reader.read();

      chunks.push(decoder.decode(value));

      if (done) {
        return chunks.join("");
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function textStream(content: string): ReadableStream {
  let done = false;
  const encoder = new TextEncoder();
  return new ReadableStream({
    pull(controller) {
      if (done) {
        controller.close();
      } else {
        controller.enqueue(encoder.encode(content));
        done = true;
      }
    },
  });
}
