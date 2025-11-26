import nodemailer from 'nodemailer';

import config from '../config';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

type EmailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  from: string;
};

let transporter: nodemailer.Transporter | null = null;
let transporterSignature: string | null = null;

const buildSignature = (config: EmailConfig) =>
  `${config.host}|${config.port}|${config.user}|${config.secure}`;

export const logEmail = (message: string, meta?: Record<string, unknown>) => {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
  process.stderr.write(`[email] ${message}${suffix}\n`);
};

const getEmailConfig = (): EmailConfig | null => {
  const emailConfig = config.email as EmailConfig | undefined;
  // Primary: use EMAIL_* config from env ok
  if (
    emailConfig &&
    emailConfig.host &&
    typeof emailConfig.port === 'number' &&
    !Number.isNaN(emailConfig.port) &&
    emailConfig.user &&
    emailConfig.pass
  ) {
    return {
      host: emailConfig.host,
      port: emailConfig.port,
      user: emailConfig.user,
      pass: emailConfig.pass,
      secure:
        typeof emailConfig.secure === 'boolean'
          ? emailConfig.secure
          : emailConfig.port === 465,
      from: emailConfig.from ?? emailConfig.user,
    } satisfies EmailConfig;
  }

  // Fallback: Gmail App Password via GOOGLE_APP_PASSWORD + GOOGLE_APP_EMAIL/EMAIL_USER
  const gmailPass = process.env.GOOGLE_APP_PASSWORD?.replace(/\s+/g, '').trim();
  const gmailUser = (
    process.env.EMAIL_USER || process.env.GOOGLE_APP_EMAIL
  )?.trim();
  if (gmailPass && gmailUser) {
    return {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      user: gmailUser,
      pass: gmailPass,
      from: process.env.EMAIL_FROM?.trim() || gmailUser,
    } satisfies EmailConfig;
  }

  return null;
};

const createTransporter = async (): Promise<nodemailer.Transporter | null> => {
  const emailConfig = getEmailConfig();
  if (!emailConfig) {
    logEmail('Missing email configuration; skipping send');
    return null;
  }

  const signature = buildSignature(emailConfig);

  if (!transporter || transporterSignature !== signature) {
    try {
      transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
      });

      await transporter.verify();
      transporterSignature = signature;
    } catch (error) {
      transporterSignature = null;
      transporter = null;
      logEmail('Failed to initialize transporter', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  return transporter;
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions) => {
  const emailConfig = getEmailConfig();
  if (!emailConfig) {
    logEmail('Cannot send email; missing configuration', { to, subject });
    return;
  }

  const transporter = await createTransporter();
  if (!transporter) {
    logEmail('Transporter unavailable; email not sent', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html,
      text,
      replyTo,
    });
  } catch (error) {
    logEmail('Failed to send email', {
      to,
      subject,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
