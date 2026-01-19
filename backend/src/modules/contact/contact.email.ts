interface AdminNotificationData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface UserConfirmationData {
  name: string;
  subject: string;
}

export const adminNotificationEmail = (data: AdminNotificationData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #004aad 0%, #0066cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .field { margin-bottom: 20px; }
    .label { font-weight: bold; color: #004aad; margin-bottom: 5px; }
    .value { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #004aad; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">From:</div>
        <div class="value">${data.name}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
      </div>
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${data.subject}</div>
      </div>
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
      </div>
      <div class="footer">
        <p>This message was sent via ORIYET Contact Form</p>
        <p>Reply directly to: <a href="mailto:${data.email}">${data.email}</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const userConfirmationEmail = (data: UserConfirmationData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .icon { font-size: 48px; text-align: center; margin: 20px 0; }
    .message-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Message Received!</h1>
    </div>
    <div class="content">
      <div class="icon">📧</div>
      <h2 style="text-align: center; color: #10b981;">Thank You for Contacting Us</h2>
      <p>Hello ${data.name},</p>
      <p>We have received your message and appreciate you taking the time to reach out to us.</p>
      <div class="message-box">
        <strong>Subject:</strong> ${data.subject}
      </div>
      <p>Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
      <p>If your matter is urgent, please feel free to contact us directly at:</p>
      <p style="text-align: center;">
        <strong>Email:</strong> team.oriyet@gmail.com<br>
        <strong>Phone:</strong> +880 1234-567890
      </p>
      <div class="footer">
        <p>Best regards,<br><strong>ORIYET Team</strong></p>
        <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
