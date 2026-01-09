import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateSlug, paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { sendApplicationReceivedEmail } from '../../utils/email.util.js';

interface CreateOpportunityInput {
    title: string;
    description?: string;
    type: string;
    location?: string;
    duration?: string;
    deadline?: string;
    banner?: string;
}

interface ApplyOpportunityInput {
    name: string;
    email: string;
    phone?: string;
    cvLink: string;
    imageLink?: string;
    portfolioLink?: string;
}

export class OpportunityService {
    async createOpportunity(data: CreateOpportunityInput) {
        const slug = generateSlug(data.title) + '-' + Date.now().toString(36);
        const opportunity = await prisma.opportunity.create({
            data: {
                ...data,
                slug,
                deadline: data.deadline ? new Date(data.deadline) : null,
            },
        });
        return opportunity;
    }

    async getAllOpportunities(page: number = 1, limit: number = 10, type?: string) {
        const { offset } = paginate(page, limit);
        const where: any = { status: 'open' };
        if (type) where.type = type;

        const [opportunities, total] = await Promise.all([
            prisma.opportunity.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            prisma.opportunity.count({ where }),
        ]);

        return {
            opportunities,
            pagination: getPaginationMeta(total, page, limit),
        };
    }

    async getOpportunityBySlug(slug: string) {
        const opportunity = await prisma.opportunity.findUnique({
            where: { slug },
        });
        if (!opportunity) throw new AppError('Opportunity not found', 404);
        return opportunity;
    }

    async deleteOpportunity(id: number) {
        await prisma.opportunity.delete({ where: { id } });
        return { message: 'Opportunity deleted' };
    }

    async updateOpportunity(id: number, data: Partial<CreateOpportunityInput> & { status?: string }) {
        const updateData: any = { ...data };
        if (data.deadline) updateData.deadline = new Date(data.deadline);

        if (data.title) {
            updateData.slug = generateSlug(data.title) + '-' + Date.now().toString(36);
        }

        const opportunity = await prisma.opportunity.update({
            where: { id },
            data: updateData,
        });
        return opportunity;
    }


    async applyToOpportunity(slug: string, data: ApplyOpportunityInput) {
        const opportunity = await prisma.opportunity.findUnique({ where: { slug } });
        if (!opportunity) throw new AppError('Opportunity not found', 404);

        if (opportunity.status !== 'open') throw new AppError('Opportunity is closed', 400);

        const existingApplication = await prisma.opportunityApplication.findFirst({
            where: {
                opportunityId: opportunity.id,
                email: data.email
            }
        });

        if (existingApplication) {
            throw new AppError('You have already applied for this opportunity.', 400);
        }

        const application = await prisma.opportunityApplication.create({
            data: {
                opportunityId: opportunity.id,
                ...data,
            },
        });

        // Send confirmation email
        await sendApplicationReceivedEmail(
            data.email,
            data.name,
            opportunity.title,
            opportunity.type
        );

        return application;
    }

    async getApplications(opportunityId?: number) {
        const where = opportunityId ? { opportunityId } : {};
        const applications = await prisma.opportunityApplication.findMany({
            where,
            include: { opportunity: true },
            orderBy: { createdAt: 'desc' },
        });
        return applications;
    }

    // Admin: Get all opportunities including closed ones
    async getAdminOpportunities(page: number = 1, limit: number = 10) {
        const { offset } = paginate(page, limit);
        const [opportunities, total] = await Promise.all([
            prisma.opportunity.findMany({
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include: {
                    _count: {
                        select: { applications: true }
                    }
                }
            }),
            prisma.opportunity.count(),
        ]);

        return {
            opportunities,
            pagination: getPaginationMeta(total, page, limit),
        };
    }
}

export const opportunityService = new OpportunityService();
