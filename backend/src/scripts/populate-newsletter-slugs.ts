import prisma from '../config/db.js';

// Helper function to generate URL-friendly slug
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}

async function populateNewsletterSlugs() {
    try {
        // Find all newsletters without slugs
        const newslettersWithoutSlugs = await prisma.newsletter.findMany({
            where: {
                OR: [
                    { slug: null },
                    { slug: '' }
                ]
            }
        });

        if (newslettersWithoutSlugs.length === 0) {
            return;
        }

        // Update each newsletter with a unique slug
        for (const newsletter of newslettersWithoutSlugs) {
            let slug = generateSlug(newsletter.title);

            // Check if slug already exists and make it unique
            let slugExists = await prisma.newsletter.findUnique({ where: { slug } });
            let counter = 1;
            while (slugExists) {
                slug = `${generateSlug(newsletter.title)}-${counter}`;
                slugExists = await prisma.newsletter.findUnique({ where: { slug } });
                counter++;
            }

            await prisma.newsletter.update({
                where: { id: newsletter.id },
                data: { slug }
            });

            }

        } catch (error) {
        console.error('❌ Error populating newsletter slugs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
populateNewsletterSlugs();
