import { Request, Response, NextFunction } from 'express';
import { opportunityService } from './opportunity.service.js';

export class OpportunityController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const opportunity = await opportunityService.createOpportunity(req.body);
            res.status(201).json({
                success: true,
                data: opportunity,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const type = req.query.type as string;
            const result = await opportunityService.getAllOpportunities(page, limit, type);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const opportunity = await opportunityService.getOpportunityBySlug(req.params.slug);
            res.status(200).json({
                success: true,
                data: opportunity,
            });
        } catch (error) {
            next(error);
        }
    }

    async apply(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await opportunityService.applyToOpportunity(req.params.slug, req.body);
            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const result = await opportunityService.updateOpportunity(id, req.body);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            await opportunityService.deleteOpportunity(id);
            res.status(200).json({
                success: true,
                message: 'Opportunity deleted',
            });
        } catch (error) {
            next(error);
        }
    }

    async getApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const opportunityId = req.query.opportunityId ? parseInt(req.query.opportunityId as string) : undefined;
            const result = await opportunityService.getApplications(opportunityId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAdminAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await opportunityService.getAdminOpportunities(page, limit);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const opportunityController = new OpportunityController();
