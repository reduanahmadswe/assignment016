import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateSlug, paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { sendApplicationReceivedEmail } from '../../utils/email.util.js';
import { lookupService } from '../../services/lookup.service.js';
import { CreateOpportunityInput, UpdateOpportunityInput, ApplyOpportunityInput } from './opportunity.types.js';
import { opportunityTransformer } from './opportunity.transformer.js';

export class OpportunityService {
    async createOpportunity(data: CreateOpportunityInput) {
        // Comprehensive field validation
        const errors: string[] = [];

        // Title validation
        if (!data.title?.trim()) {
            errors.push('Title is required');
        } else if (data.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        } else if (data.title.trim().length > 200) {
            errors.push('Title cannot exceed 200 characters');
        }

        // Description validation
        if (!data.description?.trim()) {
            errors.push('Description is required');
        } else if (data.description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        }

        // Type validation
        if (!data.type) {
            errors.push('Opportunity type is required');
        } else if (!['INTERNSHIP', 'FELLOWSHIP', 'JOB'].includes(data.type.toUpperCase())) {
            errors.push('Invalid opportunity type. Must be INTERNSHIP, FELLOWSHIP, or JOB');
        }

        // Location validation (optional)
        if (data.location && data.location.trim() && data.location.trim().length > 200) {
            errors.push('Location cannot exceed 200 characters');
        }

        // Duration validation (optional)
        if (data.duration && data.duration.trim() && data.duration.trim().length > 100) {
            errors.push('Duration cannot exceed 100 characters');
        }

        // Banner URL validation (optional)
        if (data.banner && data.banner.trim()) {
            if (!data.banner.match(/^https?:\/\/.+/)) {
                errors.push('Banner must be a valid URL starting with http:// or https://');
            } else if (data.banner.length > 500) {
                errors.push('Banner URL is too long');
            }
        }

        // Deadline validation (optional)
        if (data.deadline && data.deadline.trim()) {
            const deadline = new Date(data.deadline);
            if (isNaN(deadline.getTime())) {
                errors.push('Invalid date format for deadline');
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (deadline < today) {
                    errors.push('Deadline must be a future date');
                }
                // Check if deadline is too far in the future (e.g., more than 2 years)
                const twoYearsFromNow = new Date();
                twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
                if (deadline > twoYearsFromNow) {
                    errors.push('Deadline cannot be more than 2 years in the future');
                }
            }
        }

        // If there are validation errors, throw them
        if (errors.length > 0) {
            throw new AppError(errors.join('; '), 400);
        }

        try {
            const slug = generateSlug(data.title!) + '-' + Date.now().toString(36);
            
            const typeId = await lookupService.getOpportunityTypeId(data.type!);
            const statusId = await lookupService.getOpportunityStatusId('open');
            
            const opportunity = await prisma.opportunity.create({
                data: {
                    title: data.title!.trim(),
                    description: data.description!.trim(),
                    slug,
                    typeId,
                    location: data.location?.trim() || null,
                    duration: data.duration?.trim() || null,
                    deadline: data.deadline && data.deadline.trim() ? new Date(data.deadline) : null,
                    banner: data.banner?.trim() || null,
                    statusId,
                },
            });
            return opportunity;
        } catch (error: any) {
            // Handle database errors with user-friendly messages
            if (error.code === 'P2002') {
                throw new AppError('An opportunity with this title already exists', 400);
            }
            if (error.code === 'P2003') {
                throw new AppError('Invalid opportunity type or status selected', 400);
            }
            if (error.code === 'P2000') {
                // Extract field name from error message if available
                const fieldName = error.meta?.column_name || error.meta?.target;
                if (fieldName) {
                    const fieldMap: Record<string, string> = {
                        'title': 'Title',
                        'description': 'Description',
                        'location': 'Location',
                        'duration': 'Duration',
                        'banner': 'Banner URL'
                    };
                    const displayName = fieldMap[fieldName] || fieldName;
                    throw new AppError(`${displayName} is too long. Please reduce the length`, 400);
                }
                throw new AppError('One or more fields exceed the maximum allowed length', 400);
            }
            throw error;
        }
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
        // Comprehensive field validation
        const errors: string[] = [];

        // Title validation
        if (data.title !== undefined) {
            if (!data.title?.trim()) {
                errors.push('Title cannot be empty');
            } else if (data.title.trim().length < 3) {
                errors.push('Title must be at least 3 characters long');
            } else if (data.title.trim().length > 200) {
                errors.push('Title cannot exceed 200 characters');
            }
        }

        // Description validation
        if (data.description !== undefined) {
            if (!data.description?.trim()) {
                errors.push('Description cannot be empty');
            } else if (data.description.trim().length < 10) {
                errors.push('Description must be at least 10 characters long');
            }
        }

        // Type validation
        if (data.type !== undefined) {
            if (!data.type) {
                errors.push('Opportunity type is required');
            } else if (!['INTERNSHIP', 'FELLOWSHIP', 'JOB'].includes(data.type.toUpperCase())) {
                errors.push('Invalid opportunity type. Must be INTERNSHIP, FELLOWSHIP, or JOB');
            }
        }

        // Location validation (optional)
        if (data.location && data.location.trim() && data.location.trim().length > 200) {
            errors.push('Location cannot exceed 200 characters');
        }

        // Duration validation (optional)
        if (data.duration && data.duration.trim() && data.duration.trim().length > 100) {
            errors.push('Duration cannot exceed 100 characters');
        }

        // Banner URL validation (optional)
        if (data.banner && data.banner.trim()) {
            if (!data.banner.match(/^https?:\/\/.+/)) {
                errors.push('Banner must be a valid URL starting with http:// or https://');
            } else if (data.banner.length > 500) {
                errors.push('Banner URL is too long');
            }
        }

        // Deadline validation (optional)
        if (data.deadline && data.deadline.trim()) {
            const deadline = new Date(data.deadline);
            if (isNaN(deadline.getTime())) {
                errors.push('Invalid date format for deadline');
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (deadline < today) {
                    errors.push('Deadline must be a future date');
                }
                // Check if deadline is too far in the future
                const twoYearsFromNow = new Date();
                twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
                if (deadline > twoYearsFromNow) {
                    errors.push('Deadline cannot be more than 2 years in the future');
                }
            }
        }

        // If there are validation errors, throw them
        if (errors.length > 0) {
            throw new AppError(errors.join('; '), 400);
        }

        try {
            const updateData: any = {};
            
            if (data.title !== undefined) updateData.title = data.title.trim();
            if (data.description !== undefined) updateData.description = data.description.trim();
            if (data.type !== undefined) updateData.typeId = await lookupService.getOpportunityTypeId(data.type);
            if (data.location !== undefined) updateData.location = data.location?.trim() || null;
            if (data.duration !== undefined) updateData.duration = data.duration?.trim() || null;
            if (data.deadline !== undefined) updateData.deadline = (data.deadline && data.deadline.trim()) ? new Date(data.deadline) : null;
            if (data.banner !== undefined) updateData.banner = data.banner?.trim() || null;
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
        } catch (error: any) {
            // Handle database errors with user-friendly messages
            if (error.code === 'P2025') {
                throw new AppError('Opportunity not found', 404);
            }
            if (error.code === 'P2002') {
                throw new AppError('An opportunity with this title already exists', 400);
            }
            if (error.code === 'P2003') {
                throw new AppError('Invalid opportunity type or status selected', 400);
            }
            if (error.code === 'P2000') {
                // Extract field name from error message if available
                const fieldName = error.meta?.column_name || error.meta?.target;
                if (fieldName) {
                    const fieldMap: Record<string, string> = {
                        'title': 'Title',
                        'description': 'Description',
                        'location': 'Location',
                        'duration': 'Duration',
                        'banner': 'Banner URL'
                    };
                    const displayName = fieldMap[fieldName] || fieldName;
                    throw new AppError(`${displayName} is too long. Please reduce the length`, 400);
                }
                throw new AppError('One or more fields exceed the maximum allowed length', 400);
            }
            throw error;
        }
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
