import { prompt, system, user } from "./prompt";

describe("prompt", () => {
  describe("prompt", () => {
    it("works", async () => {
      const question = "Hello world!";

      expect(
        await prompt([
          system(
            "You are a helpful AI assistant. You are given a set of documents"
          ),
          question,
        ])
      ).toMatchInlineSnapshot(`"Hello world!"`);
    });
  });
});
