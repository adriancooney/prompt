import { ai, system, user } from "./message";
import { prompt, promptStream } from "./prompt";
import { fetchChatCompletion, fetchChatCompletionStream } from "./openai";
import { text, textStream } from "../tests/util";

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
          "estimatedTokens": 39,
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
          "estimatedTokens": 16,
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
          "estimatedTokens": 12,
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
