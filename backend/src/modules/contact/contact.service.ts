import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { sendEmail } from '../../utils/email.util.js';

interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactService {
  async submitContactMessage(data: ContactInput) {
    const { name, email, subject, message } = data;

    // Validate input
    if (!name || !email || !subject || !message) {
      throw new AppError('All fields are required', 400);
    }

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    console.log('📧 Contact message saved to DB, ID:', contactMessage.id);

    // Send email to admin
    try {
      await this.sendAdminNotification({ name, email, subject, message });
      console.log('✅ Admin notification email sent');
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error);
    }

    // Send auto-reply to user
    try {
      await this.sendUserConfirmation({ name, email, subject });
      console.log('✅ User confirmation email sent');
    } catch (error) {
      console.error('❌ Failed to send user confirmation:', error);
    }

    return {
      message: 'Thank you for contacting us! We will get back to you soon.',
      id: contactMessage.id,
    };
  }

  private async sendAdminNotification(data: ContactInput) {
    const { name, email, subject, message } = data;
    
    const adminEmail = process.env.CONTACT_EMAIL || 'team.oriyet@gmail.com';

    console.log('📤 Sending admin notification to:', adminEmail);

    const htmlContent = `
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
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p>This message was sent via ORIYET Contact Form</p>
              <p>Reply directly to ${email} to respond</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${subject}`,
      html: htmlContent,
    });

    console.log('Admin email result:', result);
  }

  private async sendUserConfirmation(data: { name: string; email: string; subject: string }) {
    const { name, email, subject } = data;

    console.log('📤 Sending user confirmation to:', email);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #004aad 0%, #0066cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #004aad; margin: 20px 0; }
          .button { display: inline-block; background: #004aad; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ORIYET</div>
            <p>Educational Events & Opportunities</p>
          </div>
          <div class="content">
            <h2 style="color: #004aad;">প্রিয় ${name},</h2>
            <p>আপনার বার্তার জন্য ধন্যবাদ। আমরা আপনার মেসেজ পেয়েছি এবং অতি শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
            
            <div class="message-box">
              <strong>আপনার বিষয়:</strong><br>
              ${subject}
            </div>

            <p>আমরা সাধারণত ২৪ ঘণ্টার মধ্যে সকল মেসেজের উত্তর দিয়ে থাকি। জরুরি বিষয়ে আমাদের সাথে সরাসরি যোগাযোগ করতে পারেন:</p>
            
            <p>
              📧 Email: team.oriyet@gmail.com<br>
              📞 Phone: +880 1700-000000
            </p>

            <a href="https://oriyet.com" class="button">Visit Our Website</a>

            <div class="footer">
              <p><strong>ORIYET</strong> - Your Gateway to Knowledge and Growth</p>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: email,
      subject: 'আমরা আপনার বার্তা পেয়েছি - ORIYET',
      html: htmlContent,
    });

    console.log('User confirmation email result:', result);
  }

  async getAllMessages(page: number = 1, limit: number = 20, isRead?: boolean) {
    const skip = (page - 1) * limit;

    const where = isRead !== undefined ? { isRead } : {};

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: number) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    return { message: 'Message marked as read' };
  }

  async deleteMessage(id: number) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return { message: 'Message deleted successfully' };
  }
}

export const contactService = new ContactService();
