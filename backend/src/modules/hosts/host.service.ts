import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { paginate, getPaginationMeta } from '../../utils/helpers.util.js';

interface CreateHostInput {
  name: string;
  email: string;
  bio?: string;
  profile_image?: string;
  cv_link?: string;
  social_links?: object;
}

export class HostService {
  async createHost(data: CreateHostInput) {
    const host = await prisma.host.create({
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
        profileImage: data.profile_image,
        cvLink: data.cv_link,
      },
    });

    return this.getHostById(host.id);
  }

  async updateHost(hostId: number, data: Partial<CreateHostInput> & { is_active?: boolean }) {
    const host = await prisma.host.findUnique({ where: { id: hostId } });
    if (!host) {
      throw new AppError('Host not found', 404);
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.profile_image !== undefined) updateData.profileImage = data.profile_image;
    if (data.cv_link !== undefined) updateData.cvLink = data.cv_link;
    if (data.social_links !== undefined) updateData.socialLinks = data.social_links ? JSON.stringify(data.social_links) : null;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const updatedHost = await prisma.host.update({
      where: { id: hostId },
      data: updateData,
    });

    return this.getHostById(updatedHost.id);
  }

  async getHostById(hostId: number) {
    const host = await prisma.host.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      throw new AppError('Host not found', 404);
    }

    return host;
  }

  async getAllHosts(page: number = 1, limit: number = 10, search?: string, activeOnly: boolean = false) {
    const { offset } = paginate(page, limit);
    const where: any = {};

    if (activeOnly) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [hosts, total] = await Promise.all([
      prisma.host.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.host.count({ where }),
    ]);

    return {
      hosts,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getHostEvents(hostId: number) {
    const events = await prisma.eventHost.findMany({
      where: {
        hostId,
        event: { isPublished: true },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            eventType: { select: { code: true, label: true } },
            startDate: true,
            eventStatus: { select: { code: true, label: true } },
          },
        },
        role: { select: { code: true, label: true } },
      },
      orderBy: {
        event: { startDate: 'desc' },
      },
    });

    return events.map((eh: any) => ({
      ...eh.event,
      eventType: eh.event.eventType.code,
      eventStatus: eh.event.eventStatus.code,
      role: eh.role.code,
    }));
  }

  async deleteHost(hostId: number) {
    const host = await prisma.host.findUnique({ where: { id: hostId } });
    if (!host) {
      throw new AppError('Host not found', 404);
    }

    await prisma.host.delete({ where: { id: hostId } });
    return { message: 'Host deleted successfully' };
  }
}

export const hostService = new HostService();
