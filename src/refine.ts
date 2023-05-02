import { system, user } from "./message";
import { prompt } from "./prompt";
import { ChatMessage, PromptResponse } from "./types";

export async function refine(
  question: string,
  prompts: ChatMessage[]
): Promise<PromptResponse> {
  return await prompt([
    system(`
      Given the following conversation and a follow up question, rephrase the follow up
      question to be a standalone question.
    `),
    ...prompts,
    user(`
      Follow Up Input: ${question}
      Standalone question:
    `),
  ]);
}
