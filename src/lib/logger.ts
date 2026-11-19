const isDev = process.env.NODE_ENV === "development";

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(message, error);
    } else {
      // Di production, log hanya pesan tanpa detail stack trace
      console.error(`[LANTAS] ${message}`);
    }
  },
  warn: (message: string) => {
    if (isDev) console.warn(message);
  },
  info: (message: string) => {
    if (isDev) console.info(message);
  },
};
