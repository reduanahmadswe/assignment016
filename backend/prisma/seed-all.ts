import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function runSeedFile(fileName: string) {
    }`);
    }\n`);

    try {
        execSync(`npx tsx prisma/${fileName}`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        } catch (error) {
        console.error(`\n❌ Error running ${fileName}:`, error);
        throw error;
    }
}

async function main() {
    try {
        // 1. First seed basic data (users, pages)
        ...');
        await runSeedFile('seed.ts');

        // 2. Seed blogs
        await runSeedFile('seed-blogs.ts');

        // 3. Seed events
        await runSeedFile('seed-events.ts');

        // 4. Seed newsletters
        await runSeedFile('seed-newsletters.ts');

        // 5. Seed opportunities
        await runSeedFile('seed-opportunities.ts');

        );
        );
        // Show counts
        const userCount = await prisma.user.count();
        const blogCount = await prisma.blogPost.count();
        const eventCount = await prisma.event.count();
        const newsletterCount = await prisma.newsletter.count();
        const opportunityCount = await prisma.opportunity.count();

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
