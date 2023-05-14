import { data as encoderRawData } from "./encoder-data.compressed";
import { data as encoderRawBpe } from "./encoder-bpe.compressed";
import { createEncoder } from "./encoder";

export interface Encoder {
  encode: (text: string) => number[];
  decode: (data: number[]) => string;
}

let _encoder: Encoder;

export async function getEncoder(): Promise<Encoder> {
  if (!_encoder) {
    const encoderData = JSON.parse(await decompressBlob(encoderRawData));
    const encoderBpe = await decompressBlob(encoderRawBpe);
    _encoder = createEncoder(encoderData, encoderBpe);
  }

  return _encoder;
}

async function decompressBlob(data: string) {
  const base64Data = await new Blob([data], { type: "text/plain" }).text();
  const gzipBlob = b64toBlob(base64Data, "application/gzip");

  // @ts-ignore
  const decompressionStream = new DecompressionStream("gzip");
  const decompressedStream = gzipBlob.stream().pipeThrough(decompressionStream);

  return await new Response(decompressedStream).text();
}

function b64toBlob(data: string, contentType: string, sliceSize = 512): Blob {
  const byteCharacters = atob(data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export function getEstimatedTokenCount(
  { encode }: Encoder,
  text: string
): number {
  return encode(text).length;
}

/**
 * Caveats: Always uses GPT-3 encoding regardless of model
 *
 * From OpenAI docs: (https://platform.openai.com/docs/guides/chat/introduction)
 *
 * # Counting tokens for chat API calls
 * Below is an example function for counting tokens for messages passed to gpt-3.5-turbo-0301.
 * The exact way that messages are converted into tokens may change from model to model. So when future model  * versions are released, the answers returned by this function may be only approximate. The ChatML  * documentation explains how messages are converted into tokens by the OpenAI API, and may be useful for  * writing your own function.
 *
 * ```py
 * def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0301"):
 *   """Returns the number of tokens used by a list of messages."""
 *   try:
 *       encoding = tiktoken.encoding_for_model(model)
 *   except KeyError:
 *       encoding = tiktoken.get_encoding("cl100k_base")
 *   if model == "gpt-3.5-turbo-0301":  # note: future models may deviate from this
 *       num_tokens = 0
 *       for message in messages:
 *           num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
 *           for key, value in message.items():
 *               num_tokens += len(encoding.encode(value))
 *               if key == "name":  # if there's a name, the role is omitted
 *                   num_tokens += -1  # role is always required and always 1 token
 *       num_tokens += 2  # every reply is primed with <im_start>assistant
 *       return num_tokens
 *   else:
 *       raise NotImplementedError(f"""num_tokens_from_messages() is not presently implemented for model  * {model}.
 *   See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are  * converted to tokens.""")
 * ```
 */
export function getChatEstimatedTokenCount(
  encoder: Encoder,
  messages: { name?: string; content: string }[]
): number {
  return (
    messages.reduce(
      (acc, message) =>
        acc + 4 + getChatMessageEstimatedTokenCount(encoder, message),
      0
    ) + 2 // every reply is primed with <im_start>assistant
  );
}

function getChatMessageEstimatedTokenCount(
  encoder: Encoder,
  message: {
    name?: string;
    content: string;
  }
): number {
  return (
    // If there's a name, count the token for the name otherwise the role is used (always 1 token)
    (message.name ? getEstimatedTokenCount(encoder, message.name) : 1) +
    getEstimatedTokenCount(encoder, message.content)
  );
}
