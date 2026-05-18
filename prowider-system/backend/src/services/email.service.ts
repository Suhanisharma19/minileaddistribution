import nodemailer from 'nodemailer';

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  SMTP_SECURE,
  SMTP_IGNORE_TLS,
} = process.env;

function getTransport() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Email SMTP is not configured. Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.'
    );
  }

  const port = Number(SMTP_PORT);
  const secure = SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      // Useful for dev/self-signed certs
      rejectUnauthorized: !(SMTP_IGNORE_TLS ? SMTP_IGNORE_TLS === 'true' : false),
    },
  });
}

export async function sendEmail(payload: EmailPayload) {
  const from = SMTP_FROM || SMTP_USER;

  const transport = getTransport();

  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

