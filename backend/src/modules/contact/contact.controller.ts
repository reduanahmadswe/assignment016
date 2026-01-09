import { Request, Response, NextFunction } from 'express';
import { contactService } from './contact.service.js';

export class ContactController {
  async submitContactForm(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, subject, message } = req.body;

      const result = await contactService.submitContactMessage({
        name,
        email,
        subject,
        message,
      });

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: { id: result.id },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;

      const result = await contactService.getAllMessages(page, limit, isRead);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      const result = await contactService.markAsRead(id);

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      const result = await contactService.deleteMessage(id);

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const contactController = new ContactController();
