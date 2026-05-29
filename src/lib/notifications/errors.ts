export class NotificationSkippedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationSkippedError";
  }
}

export class NotificationDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationDeliveryError";
  }
}
