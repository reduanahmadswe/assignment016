import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // User Roles
    await prisma.userRole.createMany({
        data: [
            { code: 'user', label: 'User' },
            { code: 'admin', label: 'Administrator' },
        ],
        skipDuplicates: true,
    });

    // Auth Providers
    await prisma.authProvider.createMany({
        data: [
            { code: 'local', label: 'Local' },
            { code: 'google', label: 'Google OAuth' },
        ],
        skipDuplicates: true,
    });

    // Event Types
    await prisma.eventType.createMany({
        data: [
            { code: 'seminar', label: 'Seminar' },
            { code: 'workshop', label: 'Workshop' },
            { code: 'webinar', label: 'Webinar' },
            { code: 'bootcamp', label: 'Bootcamp' },
            { code: 'conference', label: 'Conference' },
            { code: 'hackathon', label: 'Hackathon' },
        ],
        skipDuplicates: true,
    });

    // Event Modes
    await prisma.eventMode.createMany({
        data: [
            { code: 'online', label: 'Online' },
            { code: 'offline', label: 'Offline' },
            { code: 'hybrid', label: 'Hybrid' },
        ],
        skipDuplicates: true,
    });

    // Event Statuses
    await prisma.eventStatus.createMany({
        data: [
            { code: 'upcoming', label: 'Upcoming' },
            { code: 'ongoing', label: 'Ongoing' },
            { code: 'completed', label: 'Completed' },
            { code: 'cancelled', label: 'Cancelled' },
        ],
        skipDuplicates: true,
    });

    // Registration Statuses
    await prisma.registrationStatus.createMany({
        data: [
            { code: 'open', label: 'Open' },
            { code: 'closed', label: 'Closed' },
            { code: 'full', label: 'Full' },
        ],
        skipDuplicates: true,
    });

    // Event Registration Statuses
    await prisma.eventRegistrationStatus.createMany({
        data: [
            { code: 'pending', label: 'Pending' },
            { code: 'confirmed', label: 'Confirmed' },
            { code: 'cancelled', label: 'Cancelled' },
            { code: 'refunded', label: 'Refunded' },
        ],
        skipDuplicates: true,
    });

    // Payment Statuses
    await prisma.paymentStatus.createMany({
        data: [
            { code: 'not_required', label: 'Not Required' },
            { code: 'pending', label: 'Pending' },
            { code: 'completed', label: 'Completed' },
            { code: 'failed', label: 'Failed' },
            { code: 'cancelled', label: 'Cancelled' },
            { code: 'expired', label: 'Expired' },
            { code: 'refunded', label: 'Refunded' },
        ],
        skipDuplicates: true,
    });

    // Payment Gateways
    await prisma.paymentGateway.createMany({
        data: [
            { code: 'uddoktapay', label: 'UddoktaPay' },
            { code: 'stripe', label: 'Stripe' },
            { code: 'paypal', label: 'PayPal' },
        ],
        skipDuplicates: true,
    });

    // Blog Statuses
    await prisma.blogStatus.createMany({
        data: [
            { code: 'draft', label: 'Draft' },
            { code: 'published', label: 'Published' },
            { code: 'archived', label: 'Archived' },
        ],
        skipDuplicates: true,
    });

    // Opportunity Statuses
    await prisma.opportunityStatus.createMany({
        data: [
            { code: 'open', label: 'Open' },
            { code: 'closed', label: 'Closed' },
        ],
        skipDuplicates: true,
    });

    // Opportunity Types
    await prisma.opportunityType.createMany({
        data: [
            { code: 'INTERNSHIP', label: 'Internship' },
            { code: 'FELLOWSHIP', label: 'Fellowship' },
            { code: 'PROGRAM', label: 'Program' },
            { code: 'SCHOLARSHIP', label: 'Scholarship' },
        ],
        skipDuplicates: true,
    });

    // Application Statuses
    await prisma.applicationStatus.createMany({
        data: [
            { code: 'pending', label: 'Pending' },
            { code: 'reviewed', label: 'Reviewed' },
            { code: 'accepted', label: 'Accepted' },
            { code: 'rejected', label: 'Rejected' },
        ],
        skipDuplicates: true,
    });

    // OTP Types
    await prisma.otpType.createMany({
        data: [
            { code: 'verification', label: 'Email Verification' },
            { code: 'password_reset', label: 'Password Reset' },
            { code: 'password_change', label: 'Password Change' },
            { code: '2fa', label: 'Two-Factor Authentication' },
            { code: 'login', label: 'Login Verification' },
        ],
        skipDuplicates: true,
    });

    // Host Roles
    await prisma.hostRole.createMany({
        data: [
            { code: 'host', label: 'Host' },
            { code: 'speaker', label: 'Speaker' },
            { code: 'moderator', label: 'Moderator' },
            { code: 'panelist', label: 'Panelist' },
            { code: 'guest', label: 'Guest' },
        ],
        skipDuplicates: true,
    });

    // Online Platforms
    await prisma.onlinePlatform.createMany({
        data: [
            { code: 'zoom', label: 'Zoom' },
            { code: 'google_meet', label: 'Google Meet' },
            { code: 'microsoft_teams', label: 'Microsoft Teams' },
            { code: 'other', label: 'Other' },
        ],
        skipDuplicates: true,
    });

    }

main()
    .catch((e) => {
        console.error('❌ Error seeding lookup tables:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
