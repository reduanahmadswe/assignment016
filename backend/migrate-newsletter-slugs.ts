import prisma from './src/config/db.js';

// Helper function to generate URL-friendly slug
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}

async function migrateNewsletterSlugs() {
    console.log('🔄 Starting newsletter slug migration...');

    try {
        // Get all newsletters without slugs
        const newsletters = await prisma.newsletter.findMany({
            where: {
                slug: null,
            },
        });

        console.log(`📰 Found ${newsletters.length} newsletters without slugs`);

        for (const newsletter of newsletters) {
            let slug = generateSlug(newsletter.title);

            // Check if slug already exists
            let slugExists = await prisma.newsletter.findFirst({
                where: {
                    slug,
                    id: { not: newsletter.id }
                }
            });

            let counter = 1;
            while (slugExists) {
                slug = `${generateSlug(newsletter.title)}-${counter}`;
                slugExists = await prisma.newsletter.findFirst({
                    where: {
                        slug,
                        id: { not: newsletter.id }
                    }
                });
                counter++;
            }

            // Update newsletter with slug
            await prisma.newsletter.update({
                where: { id: newsletter.id },
                data: { slug },
            });

            console.log(`✅ Updated newsletter "${newsletter.title}" with slug: ${slug}`);
        }

        console.log('✨ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateNewsletterSlugs();
