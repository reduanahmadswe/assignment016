import prisma from './src/config/db.js';

async function testNewsletterSlugs() {
    try {
        const newsletters = await prisma.newsletter.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        newsletters.forEach((newsletter) => {
            const shareableLink = `http://localhost:3000/newsletters/slug/${newsletter.slug}`;
            const apiLink = `http://localhost:5000/api/newsletters/slug/${newsletter.slug}`;

            });

        } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNewsletterSlugs();
