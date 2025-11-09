import nodemailer from 'nodemailer';
import type { MailService, SendMailOptions } from '../../application/ports/mail-service.js';
import { env } from '../../config/env.js';

export class NodemailerMailService implements MailService {
  private readonly transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password,
    },
  });

  async sendMail(options: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: `Admin Platform <${env.smtp.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}

