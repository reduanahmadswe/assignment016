import { Request, Response } from 'express';
import { certificateService } from './certificate.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class CertificateController {
  generateCertificate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { registration_id } = req.body;
    const result = await certificateService.generateCertificate(registration_id, req.user!.id);
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
    const result = await certificateService.verifyCertificate(
      req.params.certificateId,
      req.ip,
      req.get('User-Agent')
    );
    res.json({
      success: true,
      data: result,
    });
  });

  getUserCertificates = asyncHandler(async (req: AuthRequest, res: Response) => {
    const certificates = await certificateService.getUserCertificates(req.user!.id);
    res.json({
      success: true,
      data: certificates,
    });
  });

  getCertificateById = asyncHandler(async (req: Request, res: Response) => {
    const certificate = await certificateService.getCertificateById(req.params.certificateId);
    res.json({
      success: true,
      data: certificate,
    });
  });

  // Download PDF on-the-fly
  downloadCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { stream, fileName } = await certificateService.downloadCertificate(req.params.certificateId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    stream.pipe(res);
    stream.end();
  });
}

export const certificateController = new CertificateController();
