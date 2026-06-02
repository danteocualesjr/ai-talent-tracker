export class NotificationSkipped extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationSkipped";
  }
}
