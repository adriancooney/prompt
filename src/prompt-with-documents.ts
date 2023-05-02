import {
  ChatMessage,
  PromptResponse,
  SystemMessage,
  prompt,
  system,
  user,
} from "./prompt";

type DocumentsMessage = Omit<SystemMessage, "metadata"> & {
  metadata: {
    documents: string[];
  };
};

export async function promptWithDocuments(
  documents: string[],
  question: string,
  prompts?: (ChatMessage | DocumentsMessage)[]
): Promise<PromptResponse> {
  const promptsWithoutDocuments =
    prompts?.filter((prompt) => !("documents" in prompt.metadata)) || [];

  return await prompt([
    system(
      `
      Given the following extracted parts of a long document and a question, create a final answer.
      If you don't know the answer, just say that you don't know. Don't try to make up an answer. Please include references if any.

      ${documents.join("\n\n")}
    `,
      {
        documents,
      }
    ),
    ...promptsWithoutDocuments,
    user(`Question: ${question}`),
  ]);
}
