import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateSlug, paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { sendApplicationReceivedEmail } from '../../utils/email.util.js';
import { lookupService } from '../../services/lookup.service.js';
import { CreateOpportunityInput, UpdateOpportunityInput, ApplyOpportunityInput } from './opportunity.types.js';
import { opportunityTransformer } from './opportunity.transformer.js';

export class OpportunityService {
    async createOpportunity(data: CreateOpportunityInput) {
        const slug = generateSlug(data.title) + '-' + Date.now().toString(36);
        
        const typeId = await lookupService.getOpportunityTypeId(data.type);
        const statusId = await lookupService.getOpportunityStatusId('open');
        
        const opportunity = await prisma.opportunity.create({
            data: {
                title: data.title,
                description: data.description,
                slug,
                typeId,
                location: data.location,
                duration: data.duration,
                deadline: data.deadline ? new Date(data.deadline) : null,
                banner: data.banner,
                statusId,
            },
        });
        return opportunity;
    }

    async getAllOpportunities(page: number = 1, limit: number = 10, type?: string) {
        const { offset } = paginate(page, limit);
        const where: any = { status: { code: 'open' } };
        if (type) where.type = { code: type };

        const [opportunities, total] = await Promise.all([
            prisma.opportunity.findMany({
                where,
                include: {
                    type: { select: { code: true } },
                    status: { select: { code: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            prisma.opportunity.count({ where }),
        ]);

        return {
            opportunities: opportunityTransformer.transformList(opportunities),
            pagination: getPaginationMeta(total, page, limit),
        };
    }

    async getOpportunityBySlug(slug: string) {
        const opportunity = await prisma.opportunity.findUnique({
            where: { slug },
            include: {
                type: { select: { code: true } },
                status: { select: { code: true } },
            },
        });
        if (!opportunity) throw new AppError('Opportunity not found', 404);
        
        return opportunityTransformer.transform(opportunity);
    }

    async deleteOpportunity(id: number) {
        await prisma.opportunity.delete({ where: { id } });
        return { message: 'Opportunity deleted' };
    }

    async updateOpportunity(id: number, data: UpdateOpportunityInput) {
        const updateData: any = {};
        
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.type !== undefined) updateData.typeId = await lookupService.getOpportunityTypeId(data.type);
        if (data.location !== undefined) updateData.location = data.location;
        if (data.duration !== undefined) updateData.duration = data.duration;
        if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
        if (data.banner !== undefined) updateData.banner = data.banner;
        if (data.status !== undefined) updateData.statusId = await lookupService.getOpportunityStatusId(data.status);

        if (data.title) {
            updateData.slug = generateSlug(data.title) + '-' + Date.now().toString(36);
        }

        const opportunity = await prisma.opportunity.update({
            where: { id },
            data: updateData,
            include: {
                type: { select: { code: true } },
                status: { select: { code: true } },
            },
        });
        
        return opportunityTransformer.transform(opportunity);
    }


    async applyToOpportunity(slug: string, data: ApplyOpportunityInput) {
        const opportunity = await prisma.opportunity.findUnique({ 
            where: { slug },
            include: { status: true }
        });
        if (!opportunity) throw new AppError('Opportunity not found', 404);

        if (opportunity.status.code !== 'open') throw new AppError('Opportunity is closed', 400);

        const existingApplication = await prisma.opportunityApplication.findFirst({
            where: {
                opportunityId: opportunity.id,
                email: data.email
            }
        });

        if (existingApplication) {
            throw new AppError('You have already applied for this opportunity.', 400);
        }

        const pendingStatusId = await lookupService.getApplicationStatusId('pending');

        const application = await prisma.opportunityApplication.create({
            data: {
                opportunityId: opportunity.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                cvLink: data.cvLink,
                imageLink: data.imageLink,
                portfolioLink: data.portfolioLink,
                statusId: pendingStatusId,
            },
        });

        // Get opportunity type for email
        const oppType = await prisma.opportunityType.findUnique({ 
            where: { id: opportunity.typeId } 
        });

        // Send confirmation email
        await sendApplicationReceivedEmail(
            data.email,
            data.name,
            opportunity.title,
            oppType?.code || 'opportunity'
        );

        return application;
    }

    async getApplications(opportunityId?: number) {
        const where = opportunityId ? { opportunityId } : {};
        const applications = await prisma.opportunityApplication.findMany({
            where,
            include: { 
                opportunity: {
                    include: {
                        type: { select: { code: true } },
                        status: { select: { code: true } },
                    },
                },
                status: { select: { code: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        
        // Transform response
        return applications.map(app => ({
            ...app,
            status: app.status.code,
            opportunity: {
                ...app.opportunity,
                type: app.opportunity.type.code,
                status: app.opportunity.status.code,
            },
        }));
    }

    // Admin: Get all opportunities including closed ones
    async getAdminOpportunities(page: number = 1, limit: number = 10) {
        const { offset } = paginate(page, limit);
        const [opportunities, total] = await Promise.all([
            prisma.opportunity.findMany({
                include: {
                    type: { select: { code: true } },
                    status: { select: { code: true } },
                    _count: {
                        select: { applications: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            prisma.opportunity.count(),
        ]);

        return {
            opportunities: opportunityTransformer.transformList(opportunities),
            pagination: getPaginationMeta(total, page, limit),
        };
    }
}

export const opportunityService = new OpportunityService();
