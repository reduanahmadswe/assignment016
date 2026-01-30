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

export const sendOTPEmail = async (email: string, otp: string, type: 'verification' | 'password_reset'): Promise<boolean> => {
  const subject = type === 'verification'
    ? 'ORIYET - Verify Your Email'
    : 'ORIYET - Password Reset OTP';

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
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; }
        .content { padding: 40px 30px; text-align: center; }
        .icon { font-size: 64px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .description { color: #64748b; font-size: 15px; margin-bottom: 32px; }
        .otp-container { background: linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%); border: 3px dashed #2563EB; border-radius: 16px; padding: 32px; margin: 24px 0; }
        .otp-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .otp-code { font-size: 42px; font-weight: 800; color: #2563EB; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .timer { background: #fef3c7; border-left: 4px solid #EA580C; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: left; }
        .timer-text { color: #78350f; font-size: 14px; }
        .security-note { color: #64748b; font-size: 13px; margin-top: 24px; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px; }
          .content { padding: 30px 20px; }
          .otp-code { font-size: 36px; letter-spacing: 6px; }
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
            <div class="icon">${type === 'verification' ? '🔐' : '🔑'}</div>
            <h2 class="title">${type === 'verification' ? 'Verify Your Email' : 'Reset Your Password'}</h2>
            <p class="description">Enter this code to ${type === 'verification' ? 'complete your email verification' : 'reset your password'}</p>
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            <div class="timer">
              <p class="timer-text">⏰ <strong>Important:</strong> This code will expire in <strong>2 minutes</strong>. Use it quickly!</p>
            </div>
            <p class="security-note">🛡️ If you didn't request this code, please ignore this email and secure your account.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .email-wrapper { background: #f8fafc; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #EA580C 0%, #dc2626 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; }
        .content { padding: 40px 30px; }
        .reminder-icon { text-align: center; font-size: 72px; margin-bottom: 20px; animation: ring 1s ease-in-out infinite; }
        @keyframes ring { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }
        .title { font-size: 26px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 8px; }
        .badge { display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #78350f; padding: 8px 20px; border-radius: 50px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
        .greeting { font-size: 16px; color: #475569; margin-bottom: 16px; text-align: center; }
        .event-card { background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 16px; padding: 28px; margin: 28px 0; border: 2px solid #EA580C; }
        .event-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 16px; text-align: center; }
        .event-time { background: white; padding: 16px; border-radius: 12px; text-align: center; margin: 16px 0; }
        .time-label { font-size: 13px; color: #64748b; margin-bottom: 4px; }
        .time-value { font-size: 18px; font-weight: 700; color: #EA580C; }
        .join-button { display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; margin: 16px 0; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
        .tip-box { background: #dbeafe; border-left: 4px solid #2563EB; padding: 16px; border-radius: 8px; margin: 24px 0; }
        .tip-text { color: #1e40af; font-size: 14px; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px; }
          .content { padding: 30px 20px; }
          .event-card { padding: 20px; }
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
            <div class="reminder-icon">⏰</div>
            <h2 class="title">Event Reminder</h2>
            <div style="text-align: center;"><span class="badge">🔥 Starting Soon</span></div>
            <p class="greeting">Hello <strong>${userName}</strong>,</p>
            <p style="color: #475569; text-align: center; margin-bottom: 28px;">Don't miss out! Your registered event is starting soon.</p>
            <div class="event-card">
              <h3 class="event-title">${eventTitle}</h3>
              <div class="event-time">
                <div class="time-label">📅 EVENT DATE & TIME</div>
                <div class="time-value">${eventDate}</div>
              </div>
              ${eventLink ? `<div style="text-align: center;"><a href="${eventLink}" class="join-button">🚀 Join Event Now</a></div>` : ''}
            </div>
            <div class="tip-box">
              <p class="tip-text">💡 <strong>Pro Tip:</strong> Join a few minutes early to test your setup and avoid missing the start!</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">See you there! 👋</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
          </div>
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .email-wrapper { background: #f8fafc; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%); padding: 40px 30px; text-align: center; position: relative; }
        .header::before { content: '✨'; position: absolute; top: 20px; left: 30px; font-size: 32px; opacity: 0.3; }
        .header::after { content: '🎖️'; position: absolute; top: 20px; right: 30px; font-size: 32px; opacity: 0.3; }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px; position: relative; z-index: 1; }
        .header p { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; position: relative; z-index: 1; }
        .content { padding: 40px 30px; }
        .trophy { text-align: center; font-size: 80px; margin-bottom: 20px; }
        .title { font-size: 28px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 8px; }
        .subtitle { text-align: center; color: #10b981; font-size: 16px; font-weight: 600; margin-bottom: 28px; text-transform: uppercase; letter-spacing: 1px; }
        .greeting { font-size: 16px; color: #475569; margin-bottom: 20px; text-align: center; }
        .cert-card { background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%); border-radius: 16px; padding: 32px; margin: 28px 0; border: 3px solid #7C3AED; position: relative; }
        .cert-card::before { content: ''; position: absolute; top: -10px; right: -10px; width: 80px; height: 80px; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%237C3AED"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>') no-repeat center; opacity: 0.1; }
        .event-name { font-size: 20px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 20px; }
        .cert-id { background: white; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .cert-id-label { font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .cert-id-value { font-size: 16px; font-weight: 700; color: #7C3AED; font-family: monospace; }
        .button-group { text-align: center; margin: 24px 0; }
        .btn-primary { display: inline-block; background: linear-gradient(135deg, #EA580C 0%, #dc2626 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; margin: 8px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3); }
        .btn-secondary { display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; margin: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
        .congrats-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .congrats-text { color: #047857; font-size: 15px; text-align: center; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px; }
          .content { padding: 30px 20px; }
          .cert-card { padding: 24px; }
          .btn-primary, .btn-secondary { display: block; margin: 8px 0; }
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
            <div class="trophy">🏆</div>
            <h2 class="title">Congratulations!</h2>
            <p class="subtitle">✨ Certificate Earned ✨</p>
            <p class="greeting">Hello <strong>${userName}</strong>,</p>
            <p style="color: #475569; text-align: center; margin-bottom: 30px;">We're thrilled to inform you that your certificate is ready!</p>
            <div class="cert-card">
              <h3 class="event-name">${eventTitle}</h3>
              <div class="cert-id">
                <div class="cert-id-label">🎖️ Certificate ID</div>
                <div class="cert-id-value">${certificateId}</div>
              </div>
              <div class="button-group">
                <a href="${certificateUrl}" class="btn-primary">📥 Download Certificate</a>
                <a href="${verificationUrl}" class="btn-secondary">✅ Verify Certificate</a>
              </div>
            </div>
            <div class="congrats-box">
              <p class="congrats-text">🎉 <strong>Well Done!</strong> You've successfully completed the event. Share your achievement with the world!</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">Keep learning and growing! 🚀</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
          </div>
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .email-wrapper { background: #f8fafc; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; }
        .content { padding: 40px 30px; }
        .success-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; }
        .title { font-size: 26px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 8px; }
        .subtitle { text-align: center; color: #10b981; font-size: 14px; font-weight: 600; margin-bottom: 28px; text-transform: uppercase; letter-spacing: 1px; }
        .greeting { font-size: 16px; color: #475569; margin-bottom: 20px; text-align: center; }
        .app-card { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 16px; padding: 28px; margin: 28px 0; border: 2px solid #10b981; }
        .opp-title { font-size: 20px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #64748b; font-size: 14px; }
        .detail-value { color: #1e293b; font-weight: 500; }
        .status-badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 6px 16px; border-radius: 50px; font-size: 13px; font-weight: 700; }
        .info-box { background: #dbeafe; border-left: 4px solid #2563EB; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .info-text { color: #1e40af; font-size: 14px; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px; }
          .content { padding: 30px 20px; }
          .app-card { padding: 20px; }
          .detail-row { flex-direction: column; gap: 4px; }
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
            <div class="success-icon">✅</div>
            <h2 class="title">Application Received!</h2>
            <p class="subtitle">✓ Successfully Submitted</p>
            <p class="greeting">Hello <strong>${userName}</strong>,</p>
            <p style="color: #475569; text-align: center; margin-bottom: 30px;">Thank you for applying! We've received your application and are excited to review it.</p>
            <div class="app-card">
              <h3 class="opp-title">${opportunityTitle}</h3>
              <div class="detail-row">
                <span class="detail-label">🎯 Type</span>
                <span class="detail-value">${opportunityType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📄 Status</span>
                <span class="detail-value"><span class="status-badge">Pending Review</span></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Submitted</span>
                <span class="detail-value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div class="info-box">
              <p class="info-text">👀 Our team will carefully review your application and reach out to you soon with the next steps. Keep an eye on your inbox!</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">🍀 Good luck! We're rooting for you!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
          </div>
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
