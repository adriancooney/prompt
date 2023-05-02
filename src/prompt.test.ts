import { ai, system, user } from "./message";
import { prompt } from "./prompt";
import { fetchChatCompletion } from "./openai";

jest.mock("./openai");

const fetchChatCompletionMock = jest.mocked(fetchChatCompletion);

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
});
