import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function runSeedFile(fileName: string) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🌱 Running: ${fileName}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        execSync(`npx tsx prisma/${fileName}`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log(`\n✅ Successfully completed: ${fileName}\n`);
    } catch (error) {
        console.error(`\n❌ Error running ${fileName}:`, error);
        throw error;
    }
}

async function main() {
    console.log('\n🚀 Starting Complete Database Seeding Process...\n');

    try {
        // 1. First seed basic data (users, pages)
        console.log('📝 Step 1: Seeding basic data (users, pages)...');
        await runSeedFile('seed.ts');

        // 2. Seed blogs
        console.log('📝 Step 2: Seeding blog posts...');
        await runSeedFile('seed-blogs.ts');

        // 3. Seed events
        console.log('📝 Step 3: Seeding events...');
        await runSeedFile('seed-events.ts');

        // 4. Seed newsletters
        console.log('📝 Step 4: Seeding newsletters...');
        await runSeedFile('seed-newsletters.ts');

        // 5. Seed opportunities
        console.log('📝 Step 5: Seeding opportunities...');
        await runSeedFile('seed-opportunities.ts');

        console.log('\n' + '='.repeat(60));
        console.log('🎉 ALL SEEDING COMPLETED SUCCESSFULLY! 🎉');
        console.log('='.repeat(60));
        console.log('\n📊 Database Summary:');

        // Show counts
        const userCount = await prisma.user.count();
        const blogCount = await prisma.blogPost.count();
        const eventCount = await prisma.event.count();
        const newsletterCount = await prisma.newsletter.count();
        const opportunityCount = await prisma.opportunity.count();

        console.log(`   👥 Users: ${userCount}`);
        console.log(`   📝 Blog Posts: ${blogCount}`);
        console.log(`   🎫 Events: ${eventCount}`);
        console.log(`   📰 Newsletters: ${newsletterCount}`);
        console.log(`   💼 Opportunities: ${opportunityCount}`);
        console.log('\n✨ Your database is now fully populated!\n');

    } catch (error) {
        console.error('\n❌ Seeding process failed:', error);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error('❌ Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
