import { text } from "../tests/util";
import { fetchChatCompletionStream } from "./openai";

describe("openai", () => {
  describe("fetchChatCompletionStream", () => {
    it("returns stream of chunks", async () => {
      const res = await fetchChatCompletionStream([
        {
          role: "system",
          content: "You are a helpful AI assistant",
        },
        {
          role: "user",
          content: "How many kg is 1 litre of water?",
        },
      ]);

      const result = await text(res);

      expect(result).toEqual(expect.any(String));
    });
  });
});
