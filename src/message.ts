import { AIMessage, ChatMessage, SystemMessage, UserMessage } from "./types";

export function system(content: string, metadata?: any): SystemMessage {
  return message("system", content, metadata);
}

export function user(content: string, metadata?: string): UserMessage {
  return message("user", content, metadata);
}

export function ai(content: string, metadata?: any): AIMessage {
  return message("ai", content, metadata);
}

function message<T extends ChatMessage>(
  role: T["role"],
  content: string,
  metadata?: any
): T {
  if (!metadata) {
    return {
      role,
      content,
    } as T;
  }

  return {
    role,
    content,
    metadata,
  } as T;
}
