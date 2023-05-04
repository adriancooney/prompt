const PREFIX = "[prompt]";
const isLoggingEnabled = !!process.env.PROMPT_DEBUG;

export function log(...args: any[]) {
  if (isLoggingEnabled) {
    console.log(PREFIX, ...args);
  }
}

export function debug(...args: any[]) {
  if (isLoggingEnabled) {
    console.debug(PREFIX, ...args);
  }
}

export function error(...args: any[]) {
  if (isLoggingEnabled) {
    console.error(PREFIX, ...args);
  }
}
