import nodemailer from 'nodemailer';
import transporter from '../../config/mail.config.js';
import { env } from '../../config/env.js';
import { UddoktaPayVerifyResponse } from './payment.types.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const getDynamicTransporter = async () => {
  // Fallback to env (ACTIVE)
  return {
    transporter,
    from: env.email.from,
  };
};

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { transporter: mailer, from } = await getDynamicTransporter();

    await mailer.sendMail({
      from: from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    });
    
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

/**
 * Payment Email Templates
 */
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .email-wrapper { background: #f8fafc; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; }
        .content { padding: 40px 30px; }
        .success-icon { width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; }
        .title { font-size: 24px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 8px; }
        .subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 30px; }
        .greeting { font-size: 16px; color: #475569; margin-bottom: 20px; }
        .info-card { background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); border-left: 4px solid #2563EB; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #475569; font-size: 14px; }
        .info-value { color: #1e293b; font-weight: 500; text-align: right; }
        .amount { font-size: 24px; color: #2563EB; font-weight: 700; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
        .footer a { color: #2563EB; text-decoration: none; font-weight: 500; }
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px; }
          .content { padding: 30px 20px; }
          .info-row { flex-direction: column; gap: 4px; }
          .info-value { text-align: left; }
        }
      </meta>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <h1>ORIYET</h1>
            <p>Education & Event Platform</p>
          </div>
          <div class="content">
            <div class="success-icon">✓</div>
            <h2 class="title">Payment Successful!</h2>
            <p class="subtitle">Your transaction has been processed</p>
            <p class="greeting">Hello <strong>${userName}</strong>,</p>
            <p style="color: #475569; margin-bottom: 24px;">Great news! Your payment has been processed successfully. You're all set for the event.</p>
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Event</span>
                <span class="info-value">${eventTitle}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value amount">৳${amount.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Transaction ID</span>
                <span class="info-value" style="font-family: monospace; font-size: 12px;">${transactionId}</span>
              </div>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">💡 Keep this email for your records</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
            <p>Questions? Contact us at <a href="mailto:support@oriyet.com">support@oriyet.com</a></p>
          </div>
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .email-wrapper { background: #f8fafc; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden; }
        .header::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px; position: relative; z-index: 1; }
        .header p { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; position: relative; z-index: 1; }
        .content { padding: 40px 30px; }
        .celebration { text-align: center; font-size: 64px; margin-bottom: 20px; animation: bounce 1s ease-in-out; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .title { font-size: 28px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 12px; }
        .subtitle { text-align: center; color: #EA580C; font-size: 18px; font-weight: 600; margin-bottom: 24px; }
        .greeting { font-size: 16px; color: #475569; margin-bottom: 16px; text-align: center; }
        .event-card { background: linear-gradient(135deg, #eff6ff 0%, #fef3c7 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid #2563EB; position: relative; }
        .event-card::before { content: '📅'; position: absolute; top: 20px; right: 20px; font-size: 32px; opacity: 0.3; }
        .event-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
        .event-info { margin: 12px 0; }
        .event-label { font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .event-value { color: #1e293b; font-size: 16px; font-weight: 500; margin-top: 4px; }
        .reg-id { background: white; padding: 12px; border-radius: 8px; text-align: center; margin-top: 16px; border: 2px dashed #2563EB; }
        .reg-id-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
        .reg-id-value { font-size: 18px; font-weight: 700; color: #2563EB; font-family: monospace; letter-spacing: 1px; }
        .note { background: #fef3c7; border-left: 4px solid #EA580C; padding: 16px; border-radius: 8px; margin: 24px 0; }
        .note-text { color: #78350f; font-size: 14px; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
        .footer a { color: #2563EB; text-decoration: none; font-weight: 500; }
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px; }
          .content { padding: 30px 20px; }
          .celebration { font-size: 48px; }
          .title { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <h1>ORIYET</h1>
            <p>Education & Event Platform</p>
          </div>
          <div class="content">
            <div class="celebration">🎉</div>
            <h2 class="title">Congratulations!</h2>
            <p class="subtitle">Registration Confirmed</p>
            <p class="greeting">Hello <strong>${userName}</strong>,</p>
            <p style="color: #475569; text-align: center; margin-bottom: 30px;">You're all set! Your registration has been successfully confirmed.</p>
            <div class="event-card">
              <h3 class="event-title">${eventTitle}</h3>
              <div class="event-info">
                <div class="event-label">📅 Date & Time</div>
                <div class="event-value">${eventDate}</div>
              </div>
              <div class="reg-id">
                <div class="reg-id-label">YOUR REGISTRATION ID</div>
                <div class="reg-id-value">${registrationNumber}</div>
              </div>
            </div>
            <div class="note">
              <p class="note-text">⏰ <strong>Don't worry!</strong> We'll send you a reminder 24 hours before the event starts.</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">Get ready for an amazing experience! 🚀</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
            <p>Questions? Contact us at <a href="mailto:support@oriyet.com">support@oriyet.com</a></p>
          </div>
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .email-wrapper { background: #f8fafc; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; }
        .content { padding: 40px 30px; }
        .link-icon { text-align: center; font-size: 64px; margin-bottom: 20px; }
        .title { font-size: 26px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 12px; }
        .subtitle { text-align: center; color: #64748b; font-size: 15px; margin-bottom: 30px; }
        .greeting { font-size: 16px; color: #475569; margin-bottom: 24px; }
        .link-card { background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); border-radius: 16px; padding: 32px; margin: 30px 0; text-align: center; border: 2px solid #7C3AED; }
        .event-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
        .event-details { text-align: left; margin: 20px 0; }
        .detail-row { display: flex; align-items: center; padding: 10px 0; }
        .detail-icon { font-size: 20px; margin-right: 12px; }
        .detail-text { color: #475569; font-size: 15px; }
        .join-button { display: inline-block; background: linear-gradient(135deg, #EA580C 0%, #dc2626 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3); transition: transform 0.2s; }
        .join-button:hover { transform: translateY(-2px); }
        .link-text { background: white; padding: 12px; border-radius: 8px; margin-top: 16px; border: 1px solid #e2e8f0; word-break: break-all; }
        .link-url { color: #2563EB; font-size: 13px; font-family: monospace; }
        .warning-box { background: #fef3c7; border-left: 4px solid #EA580C; padding: 16px; border-radius: 8px; margin: 24px 0; }
        .warning-text { color: #78350f; font-size: 14px; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
        .footer a { color: #2563EB; text-decoration: none; font-weight: 500; }
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px; }
          .content { padding: 30px 20px; }
          .link-card { padding: 24px; }
          .join-button { padding: 14px 36px; font-size: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <h1>ORIYET</h1>
            <p>Education & Event Platform</p>
          </div>
          <div class="content">
            <div class="link-icon">🔗</div>
            <h2 class="title">Your Event Access Link</h2>
            <p class="subtitle">Click the button below to join the event</p>
            <p class="greeting">Hello <strong>${userName}</strong>,</p>
            <p style="color: #475569; margin-bottom: 30px;">Your personalized link to join the event is ready. Save this email for easy access!</p>
            <div class="link-card">
              <h3 class="event-title">${eventTitle}</h3>
              <div class="event-details">
                <div class="detail-row">
                  <span class="detail-icon">📅</span>
                  <span class="detail-text"><strong>Date & Time:</strong> ${eventDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-icon">💻</span>
                  <span class="detail-text"><strong>Platform:</strong> ${platform}</span>
                </div>
              </div>
              <a href="${eventLink}" class="join-button">🚀 Join Event Now</a>
              <div class="link-text">
                <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">Or copy this link:</div>
                <div class="link-url">${eventLink}</div>
              </div>
            </div>
            <div class="warning-box">
              <p class="warning-text">🔒 <strong>Important:</strong> This link is personal and unique to you. Please do not share it with others.</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">See you at the event! 👋</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
            <p>Need help? Contact us at <a href="mailto:support@oriyet.com">support@oriyet.com</a></p>
          </div>
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

/**
 * Payment Email Service Class
 */
export class PaymentEmailService {
  /**
   * Send all success emails after payment verification
   */
  async sendSuccessEmails(registration: any, verifyData: UddoktaPayVerifyResponse) {
    try {
      // Payment confirmation
      await sendPaymentConfirmation(
        registration.user.email,
        registration.user.name,
        registration.event.title,
        Number(verifyData.amount),
        verifyData.transaction_id
      );

      // Registration confirmation
      await sendRegistrationConfirmation(
        registration.user.email,
        registration.user.name,
        registration.event.title,
        new Date(registration.event.startDate).toLocaleString(),
        registration.registrationNumber || ''
      );

      // Event link for online events (check both onlineLink and meetingLink)
      const eventLink = registration.event.onlineLink || registration.event.meetingLink;
      if (registration.event.eventMode !== 'offline' && eventLink) {
        await sendEventLink(
          registration.user.email,
          registration.user.name,
          registration.event.title,
          new Date(registration.event.startDate).toLocaleString(),
          eventLink,
          registration.event.onlinePlatform || registration.event.meetingPlatform || 'Online'
        );
      }
    } catch (error) {
      console.error('[EMAIL] Error sending success emails:', error);
    }
  }
}

export const paymentEmailService = new PaymentEmailService();
