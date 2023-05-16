import { system, user } from "./message";
import { prompt, promptStream } from "./prompt";
import { text } from "../tests/util";
import { ChatMessage, PromptResponse } from "./types";

const SHORT_STORY = `
As the sun shone down on the quaint little cafe, a woman sat outside with a brown dog by her side. She sipped her coffee and watched as people bustled by, going about their day. The dog lay contentedly at her feet, occasionally lifting his head to sniff the air.
The woman was lost in thought, her eyes gazing off into the distance. She had a faraway look in her eyes, as if she was lost in a memory. The dog seemed to sense this and nudged her hand with his nose, as if to say, "I'm here for you."
The woman smiled and reached down to pet the dog's head. She felt a sense of comfort in his presence, as if he was a constant companion in her life. She took another sip of her coffee and let out a contented sigh.
As she sat there, lost in thought, the world around her seemed to fade away. The sounds of the city became distant and muffled, and all that remained was the warm sun on her skin and the gentle touch of the dog's fur.
For a moment, she felt at peace. She closed her eyes and let out a deep breath, feeling the weight of the world lift off her shoulders. The dog leaned into her, as if to say, "I'm here for you, always."
And in that moment, the woman knew that no matter what life threw her way, she would always have the love and companionship of her faithful brown dog.
`;

describe("prompt (integration)", () => {
  jest.setTimeout(120000);

  it.each([
    [
      system("You are a helpful AI assistant that replies with short answers"),
      user("What are the main ingredients in Guinness?"),
    ],
    [
      system("You are an imaginative writer"),
      user(
        `Rewrite the following short story but replace all occurences of 'woman' with 'cat':\n\n${SHORT_STORY}`
      ),
    ],
  ])(
    "token counts for stream and non-stream are similar",
    async (...prompts: ChatMessage[]) => {
      const options = {
        temperature: 0,
        model: "gpt-3.5-turbo",
      } as const;

      const [promptA, promptB] = await Promise.all([
        prompt(prompts, options),
        new Promise<PromptResponse>((resolve, reject) =>
          promptStream(prompts, {
            ...options,
            onComplete: resolve,
          })
            .then(text)
            .catch(reject)
        ),
      ]);

      console.log({ promptA, promptB });

      expect(
        Math.abs(promptA.estimatedTokens - promptB.estimatedTokens)
      ).toBeLessThan(15);
    }
  );

  it("streams", async () => {
    const prompt = await new Response(
      await promptStream([user("Hello world")])
    ).text();

    expect(prompt.trim().length).toBeGreaterThan(1);
    expect(prompt).toEqual(expect.any(String));
  });
});
