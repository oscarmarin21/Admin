export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface MailService {
  sendMail(options: SendMailOptions): Promise<void>;
}

