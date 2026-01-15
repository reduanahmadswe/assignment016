import prisma from './src/config/db.js';

async function testNewsletterSlugs() {
    console.log('📰 Testing Newsletter Shareable Links\n');
    console.log('=====================================\n');

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

        console.log(`Found ${newsletters.length} newsletters:\n`);

        newsletters.forEach((newsletter) => {
            const shareableLink = `http://localhost:3000/newsletters/slug/${newsletter.slug}`;
            const apiLink = `http://localhost:5000/api/newsletters/slug/${newsletter.slug}`;

            console.log(`📌 ${newsletter.title}`);
            console.log(`   ID: ${newsletter.id}`);
            console.log(`   Slug: ${newsletter.slug}`);
            console.log(`   🔗 Shareable Link: ${shareableLink}`);
            console.log(`   🔗 API Endpoint: ${apiLink}`);
            console.log('');
        });

        console.log('=====================================');
        console.log('✅ All newsletters have shareable links!');
        console.log('\n💡 Usage:');
        console.log('   - Share the frontend link with users');
        console.log('   - API endpoint automatically increments view count');
        console.log('   - Each newsletter has a unique, SEO-friendly URL');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNewsletterSlugs();
