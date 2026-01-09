import nodemailer from 'nodemailer';
import transporter from '../config/mail.config.js';
import { env } from '../config/env.js';
import prisma from '../config/db.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const getDynamicTransporter = async () => {
  /*
  // DYNAMIC CONFIG FROM DB (DISABLED FOR NOW)
  // Try to get from database first
  const setting = await (prisma as any).systemSetting.findUnique({
    where: { key: 'email' },
  });

  if (setting && setting.value) {
    try {
      const dbConfig = JSON.parse(setting.value);
      if (dbConfig.smtpHost && dbConfig.smtpUser) {
        return {
          transporter: nodemailer.createTransport({
            host: dbConfig.smtpHost,
            port: parseInt(dbConfig.smtpPort) || 587,
            secure: parseInt(dbConfig.smtpPort) === 465,
            auth: {
              user: dbConfig.smtpUser,
              pass: dbConfig.smtpPassword,
            },
          }),
          from: dbConfig.fromEmail || env.email.from,
        };
      }
    } catch (error) {
      console.error('Failed to parse email settings from DB', error);
    }
  }
  */

  // Fallback to env (ACTIVE)
  return {
    transporter,
    from: env.email.from,
  };
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    console.log('📧 Subject:', options.subject);
    
    const { transporter: mailer, from } = await getDynamicTransporter();

    console.log('📧 Using email from:', from);

    await mailer.sendMail({
      from: from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    });
    
    console.log('✅ Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

export const sendOTPEmail = async (email: string, otp: string, type: 'verification' | 'password_reset'): Promise<boolean> => {
  const subject = type === 'verification'
    ? 'ORIYET - Verify Your Email'
    : 'ORIYET - Password Reset OTP';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>${type === 'verification' ? 'Verify Your Email' : 'Reset Your Password'}</h2>
          <p>Use the following OTP code to ${type === 'verification' ? 'verify your email address' : 'reset your password'}:</p>
          <div class="otp-box">
            <span class="otp-code">${otp}</span>
          </div>
          <p>This code will expire in <strong>2 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

export const sendRegistrationConfirmation = async (
  email: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  registrationNumber: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Registration Confirmed! 🎉</h2>
          <p>Hello ${userName},</p>
          <p>Your registration has been confirmed for:</p>
          <div class="info-box">
            <h3 style="margin-top: 0;">${eventTitle}</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Registration ID:</strong> ${registrationNumber}</p>
          </div>
          <p>We'll send you a reminder before the event starts.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Registration Confirmed: ${eventTitle}`,
    html
  });
};

export const sendPaymentConfirmation = async (
  email: string,
  userName: string,
  eventTitle: string,
  amount: number,
  transactionId: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Payment Successful! ✅</h2>
          <span class="success-badge">PAID</span>
          <p>Hello ${userName},</p>
          <p>Your payment has been processed successfully.</p>
          <div class="info-box">
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Amount:</strong> ৳${amount.toFixed(2)}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Payment Confirmation`,
    html
  });
};

export const sendEventReminder = async (
  email: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventLink?: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-badge { background: #ffc107; color: #333; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Event Reminder ⏰</h2>
          <span class="reminder-badge">STARTING SOON</span>
          <p>Hello ${userName},</p>
          <p>This is a reminder that your registered event is starting soon!</p>
          <div class="info-box">
            <h3 style="margin-top: 0;">${eventTitle}</h3>
            <p><strong>Date & Time:</strong> ${eventDate}</p>
            ${eventLink ? `<a href="${eventLink}" class="btn">Join Event</a>` : ''}
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Reminder: ${eventTitle} Starting Soon!`,
    html
  });
};

export const sendCertificateEmail = async (
  email: string,
  userName: string,
  eventTitle: string,
  certificateId: string,
  certificateUrl: string,
  verificationUrl: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .certificate-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 5px; }
        .btn-secondary { background: #6c757d; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Congratulations! 🎓</h2>
          <span class="certificate-badge">CERTIFICATE EARNED</span>
          <p>Hello ${userName},</p>
          <p>Congratulations on completing <strong>${eventTitle}</strong>!</p>
          <p>Your certificate has been generated successfully.</p>
          <div class="info-box">
            <p><strong>Certificate ID:</strong> ${certificateId}</p>
            <a href="${certificateUrl}" class="btn">Download Certificate</a>
            <a href="${verificationUrl}" class="btn btn-secondary">Verify Certificate</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Your Certificate for ${eventTitle}`,
    html
  });
};

export const sendEventLink = async (
  email: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventLink: string,
  platform: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-size: 18px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Your Event Link 🔗</h2>
          <p>Hello ${userName},</p>
          <p>Here's your link to join the event:</p>
          <div class="info-box">
            <h3 style="margin-top: 0;">${eventTitle}</h3>
            <p><strong>Date & Time:</strong> ${eventDate}</p>
            <p><strong>Platform:</strong> ${platform}</p>
            <a href="${eventLink}" class="btn">Join Event</a>
          </div>
          <p><small>This link is personal and should not be shared with others.</small></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Event Link: ${eventTitle}`,
    html
  });
};

export const sendPaymentFailure = async (
  email: string,
  userName: string,
  eventTitle: string,
  reason?: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .error-badge { background: #dc3545; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Payment Failed ❌</h2>
          <span class="error-badge">FAILED</span>
          <p>Hello ${userName},</p>
          <p>Unfortunately, your payment for <strong>${eventTitle}</strong> could not be processed.</p>
          ${reason ? `<div class="info-box"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
          <p>Please try again or contact our support if the issue persists.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${env.frontendUrl}/events" class="btn">Browse Events</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Payment Failed for ${eventTitle}`,
    html,
  });
};

export const sendPaymentCancellation = async (
  email: string,
  userName: string,
  eventTitle: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-badge { background: #ffc107; color: #333; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Payment Cancelled</h2>
          <span class="warning-badge">CANCELLED</span>
          <p>Hello ${userName},</p>
          <p>Your payment for <strong>${eventTitle}</strong> has been cancelled.</p>
          <div class="info-box">
            <p>No charges have been made to your account.</p>
            <p>You can try registering again whenever you're ready.</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${env.frontendUrl}/events" class="btn">Browse Events</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Payment Cancelled`,
    html,
  });
};

export const sendRefundNotification = async (
  email: string,
  userName: string,
  eventTitle: string,
  amount: number,
  reason: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .refund-badge { background: #17a2b8; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #17a2b8; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Refund Processed 💰</h2>
          <span class="refund-badge">REFUNDED</span>
          <p>Hello ${userName},</p>
          <p>Your payment for <strong>${eventTitle}</strong> has been refunded.</p>
          <div class="info-box">
            <p><strong>Refund Amount:</strong> ৳${amount.toFixed(2)}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Processing Time:</strong> 7-10 business days</p>
          </div>
          <p>The refund will be credited back to your original payment method.</p>
          <p>Your registration has been cancelled and any certificates issued have been revoked.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Refund Processed for ${eventTitle}`,
    html,
  });
};

export const sendApplicationReceivedEmail = async (
  email: string,
  userName: string,
  opportunityTitle: string,
  opportunityType: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #28a745; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORIYET</h1>
        </div>
        <div class="content">
          <h2>Application Received! 📝</h2>
          <span class="success-badge">SUBMITTED</span>
          <p>Hello ${userName},</p>
          <p>Thank you for applying to <strong>${opportunityTitle}</strong>!</p>
          <div class="info-box">
            <h3 style="margin-top: 0;">Application Details</h3>
            <p><strong>Opportunity:</strong> ${opportunityTitle}</p>
            <p><strong>Type:</strong> ${opportunityType}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          <p>Our team will review your application and get back to you soon regarding the next steps.</p>
          <p>Good luck!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `ORIYET - Application Received: ${opportunityTitle}`,
    html,
  });
};
