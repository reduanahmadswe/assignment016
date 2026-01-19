export const passwordChangeOTPEmail = (userName: string, otp: string) => `
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
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORIYET</h1>
    </div>
    <div class="content">
      <h2>Password Change Request</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to change your password. Use the following OTP code to verify your identity:</p>
      <div class="otp-box">
        <span class="otp-code">${otp}</span>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <div class="warning">
        <strong>⚠️ Security Notice:</strong> If you didn't request this password change, please ignore this email and your password will remain unchanged.
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetSuccessEmail = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
    .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORIYET</h1>
    </div>
    <div class="content">
      <div class="success-icon">✅</div>
      <h2 style="text-align: center; color: #10b981;">Password Changed Successfully</h2>
      <p>Hello ${userName},</p>
      <p>Your password has been successfully changed. You can now use your new password to log in to your account.</p>
      <div class="info-box">
        <strong>📅 Changed on:</strong> ${new Date().toLocaleString('en-US', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}
      </div>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
      </div>
      <div class="info-box" style="background: #fff3cd; border-left-color: #ffc107; margin-top: 30px;">
        <strong>⚠️ Security Reminder:</strong> If you did not make this change, please contact our support team immediately.
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
