export class WebhookDto {
  // Keep generic — Fapshi payloads can vary; adapt as needed.
  id?: string;
  type?: string;
  data?: any;
}
