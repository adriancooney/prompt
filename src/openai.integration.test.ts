import { text } from "../tests/util";
import { fetchChatCompletionStream } from "./openai";

describe("openai", () => {
  describe("fetchChatCompletionStream", () => {
    it("returns stream of chunks", async () => {
      const res = await fetchChatCompletionStream(
        [
          {
            role: "system",
            content: "You are a helpful AI assistant",
          },
          {
            role: "user",
            content: "How many kg is 1 litre of water?",
          },
        ],
        {
          apiKey: process.env.OPENAI_API_KEY as string,
          model: "gpt-3.5-turbo",
        }
      );

      const result = await text(res);

      expect(result).toEqual(expect.any(String));
    });
  });
});
