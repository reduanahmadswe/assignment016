import nodemailer from 'nodemailer';
import { env } from './env.js';

// Create transporter based on environment
const createTransporter = () => {
  // If using Gmail with app password
  if (env.email.host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail', // Use Gmail service directly
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }

  // For other SMTP providers
  return nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

export const transporter = createTransporter();

export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

export default transporter;
