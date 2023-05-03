export async function text(stream: ReadableStream): Promise<string> {
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

export function textStream(content: string): ReadableStream {
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
