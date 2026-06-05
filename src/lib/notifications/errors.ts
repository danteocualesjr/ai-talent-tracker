export class NotificationSkippedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationSkippedError";
  }
}
