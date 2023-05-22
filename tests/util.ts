export async function text(stream: ReadableStream): Promise<string> {
  return new Response(stream).text();
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
