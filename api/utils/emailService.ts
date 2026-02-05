import nodemailer from 'nodemailer';
import logger from './logger.js';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.EMAIL_FROM || smtpUser || 'no-reply@cvmate.app';

const isEmailConfigured = !!(smtpHost && smtpUser && smtpPass);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    logger.warn('Email transport not configured, skip sending email', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error('Failed to send email', error, { to, subject });
  }
};

export const sendJobApplicationEmail = async (params: {
  recipientEmail: string;
  applicantName: string;
  jobTitle: string;
}) => {
  const { recipientEmail, applicantName, jobTitle } = params;
  const subject = `New application for "${jobTitle}" on CV Mate`;
  const html = `
  <p>Hi,</p>
  <p><strong>${applicantName}</strong> has just applied for your job posting: <strong>${jobTitle}</strong> on CV Mate.</p>
  <p>Please log in to your CV Mate account to review the application details.</p>
  <p>Best regards,<br/>CV Mate Team</p>
  `;

  await sendEmail(recipientEmail, subject, html);
};

