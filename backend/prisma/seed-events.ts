import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting event seeding...");

    const events = [
        {
            title: "Full Stack Web Development Bootcamp",
            slug: "full-stack-bootcamp-2026",
            description: "Master Modern Web Development from Scratch to Advanced. Learn React, Node.js, and more.",
            content: "<p>Deep dive into modern web development practices.</p>",
            thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
            eventType: "Bootcamp",
            eventMode: "Online",
            startDate: new Date("2026-02-01T10:00:00Z"),
            endDate: new Date("2026-04-30T18:00:00Z"),
            registrationDeadline: new Date("2026-01-31T23:59:59Z"),
            isFree: false,
            price: 1,
            currency: "BDT",
            maxParticipants: 50,
            currentParticipants: 12,
            registrationStatus: "open",
            eventStatus: "upcoming",
            onlinePlatform: "Google Meet",
            onlineLink: "https://meet.google.com/abc-defg-hij",
            isPublished: true,
            hasCertificate: true,
        },
        {
            title: "AI & Machine Learning Summit",
            slug: "ai-ml-summit-2026",
            description: "Explore the future of Artificial Intelligence with industry leaders.",
            content: "<p>Join us for a two-day summit on AI trends.</p>",
            thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
            eventType: "Summit",
            eventMode: "Hybrid",
            venueDetails: "BICC, Dhaka",
            startDate: new Date("2026-03-15T09:00:00Z"),
            endDate: new Date("2026-03-16T17:00:00Z"),
            registrationDeadline: new Date("2026-03-10T23:59:59Z"),
            isFree: false,
            price: 1,
            currency: "BDT",
            maxParticipants: 200,
            currentParticipants: 85,
            registrationStatus: "open",
            eventStatus: "upcoming",
            isPublished: true,
            hasCertificate: true,
        },
        {
            title: "Data Science with Python Workshop",
            slug: "data-science-workshop-2026",
            description: "Hands-on workshop to learn Data Analysis and Visualization using Python.",
            content: "<p>Practical session on Pandas, NumPy, and Matplotlib.</p>",
            thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
            eventType: "Workshop",
            eventMode: "Online",
            startDate: new Date("2026-02-10T14:00:00Z"),
            endDate: new Date("2026-02-10T18:00:00Z"),
            registrationDeadline: new Date("2026-02-08T23:59:59Z"),
            isFree: false,
            price: 1,
            currency: "BDT",
            maxParticipants: 100,
            currentParticipants: 45,
            registrationStatus: "open",
            eventStatus: "upcoming",
            onlinePlatform: "Zoom",
            isPublished: true,
            hasCertificate: true,
        },
        {
            title: "Cyber Security Awareness Seminar",
            slug: "cyber-security-seminar-2026",
            description: "Learn how to protect yourself and your organization from cyber threats.",
            content: "<p>Expert talks on latest cyber security trends.</p>",
            thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
            eventType: "Seminar",
            eventMode: "Offline",
            venueDetails: "KIB Complex, Dhaka",
            startDate: new Date("2026-04-05T10:00:00Z"),
            endDate: new Date("2026-04-05T13:00:00Z"),
            registrationDeadline: new Date("2026-04-01T23:59:59Z"),
            isFree: true,
            price: 0,
            currency: "BDT",
            maxParticipants: 300,
            currentParticipants: 150,
            registrationStatus: "open",
            eventStatus: "upcoming",
            isPublished: true,
            hasCertificate: true,
        },
        {
            title: "StartUp Pitch Deck Masterclass",
            slug: "startup-pitch-masterclass-2026",
            description: "Learn how to craft a winning pitch deck for your startup.",
            content: "<p>Guidance from successful founders and VCs.</p>",
            thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
            eventType: "Masterclass",
            eventMode: "Online",
            startDate: new Date("2026-05-20T19:00:00Z"),
            endDate: new Date("2026-05-20T21:00:00Z"),
            registrationDeadline: new Date("2026-05-18T23:59:59Z"),
            isFree: false,
            price: 1,
            currency: "BDT",
            maxParticipants: 80,
            currentParticipants: 30,
            registrationStatus: "open",
            eventStatus: "upcoming",
            onlinePlatform: "Zoom",
            isPublished: true,
            hasCertificate: true,
        },
    ];

    for (const event of events) {
        const existing = await prisma.event.findUnique({
            where: { slug: event.slug }
        });

        if (!existing) {
            await prisma.event.create({
                data: event
            });
            console.log(`✅ Created event: ${event.title}`);
        } else {
            await prisma.event.update({
                where: { slug: event.slug },
                data: { price: event.price }
            });
            console.log(`ℹ️ Updated event price: ${event.title}`);
        }
    }

    console.log("🎉 Event seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
