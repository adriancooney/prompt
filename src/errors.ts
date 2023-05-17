export class OpenAIError extends Error {
  type: string;
  code: string | null;

  constructor(type: string, code: string | null, message: string) {
    super(message);
    this.type = type;
    this.code = code;
  }
}

export class OpenAIModelOverloadedError extends OpenAIError {}
