import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { sendEmail } from '../../utils/email.util.js';
import { adminNotificationEmail, userConfirmationEmail } from './contact.email.js';

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

    const result = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${subject}`,
      html: adminNotificationEmail({ name, email, subject, message }),
    });

    console.log('Admin email result:', result);
  }

  private async sendUserConfirmation(data: { name: string; email: string; subject: string }) {
    const { name, email, subject } = data;

    console.log('📤 Sending user confirmation to:', email);

    const result = await sendEmail({
      to: email,
      subject: 'আমরা আপনার বার্তা পেয়েছি - ORIYET',
      html: userConfirmationEmail({ name, subject }),
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
