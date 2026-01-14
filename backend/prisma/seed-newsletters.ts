
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PDF_LINKS = [
    'https://drive.google.com/file/d/1LVisw08dTD-t2OhC5BO2YH8r4v7MML8_/view?usp=sharing',
    'https://drive.google.com/file/d/1VTgQUbnTUP-fUz3tkc9ABzsVapT24jar/view?usp=sharing'
];

const THUMBNAILS = [
    'https://drive.google.com/file/d/1lCE3PaeaTl6qqpdusyuQDxxu9OT8-W8K/view?usp=sharing',
    'https://drive.google.com/file/d/1AAUb40cd5JC_VBfVY1_LaeJgVQ04DS6T/view?usp=sharing',
    'https://drive.google.com/file/d/1_HoaiK4aFjbaafvyRWVSKce1dZtgsVZc/view?usp=sharing',
    'https://drive.google.com/file/d/1MALlWZo7rq0IE2dikYsVsm1je0v-0mLV/view?usp=sharing',
    'https://drive.google.com/file/d/1M9e-jXdUePFVk_zTdjPKSE-y8XUa8Dqq/view?usp=sharing',
    'https://drive.google.com/file/d/1PlJyuj_MMbKR96X5DAvnNrupCUms9D-g/view?usp=sharing',
    'https://drive.google.com/file/d/1BSyz7AxPkITIw5DL-fECOub80HBViqp4/view?usp=sharing',
    'https://drive.google.com/file/d/1h6KX5Jt-tjUlHpGF6OjQ5_8O_G9AVoTt/view?usp=sharing',
    'https://drive.google.com/file/d/1kVGRvF-aAbiFyYVW8zdO6uchfNGoh33W/view?usp=sharing',
    'https://drive.google.com/file/d/1XMKW8bVmD_4WOJLOEjqNwSUui-3iOVhT/view?usp=sharing',
    'https://drive.google.com/file/d/1z4hpzpCQRGeh2z8K7uV0LDk_3lepY9Iw/view?usp=sharing',
    'https://drive.google.com/file/d/17NmndZg_RblF95gNvmvkxK8VxBHHedob/view?usp=sharing',
    'https://drive.google.com/file/d/1AjxvbA358NhiT2N1Vn81SDQI4nc88JoO/view?usp=sharing',
    'https://drive.google.com/file/d/1nERwBTnbWpPNmJD-GGOo_u_yFMDjHgPs/view?usp=sharing',
    'https://drive.google.com/file/d/1LlRoyrtc3XvIfCgNhvqewZqzDZ9ZyYB3/view?usp=sharing',
    'https://drive.google.com/file/d/1TE0AjlLGezIs8jzk-mfqIJRo4cMCV46v/view?usp=sharing',
    'https://drive.google.com/file/d/1Xf5GPlrUfiXziPb95pgmYtKVafmCDRbA/view?usp=sharing'
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2024, 2025, 2026];

async function main() {
    console.log('🌱 Starting newsletter seeding...');

    // Clear existing newsletters
    await prisma.newsletter.deleteMany();

    // Generate ~20 newsletters
    const TOTAL_NEWSLETTERS = 20;

    for (let i = 0; i < TOTAL_NEWSLETTERS; i++) {
        const year = YEARS[Math.floor((i / 12)) % YEARS.length];
        const month = MONTHS[i % 12];
        const pdfLink = PDF_LINKS[i % PDF_LINKS.length];
        const thumbnail = THUMBNAILS[i % THUMBNAILS.length];

        const title = `ORIYET Digest - ${month} ${year} Edition`;
        const description = `This edition covers the latest updates in research, innovation, and academic opportunities for ${month} ${year}. Includes exclusive interviews and scholarship listings.`;

        // Calculate dates
        // Start date: 1st of the month
        const startDate = new Date(year, i % 12, 1);
        // End date: last day of the month
        const endDate = new Date(year, i % 12 + 1, 0);

        await prisma.newsletter.create({
            data: {
                title,
                description,
                thumbnail,
                pdfLink,
                startDate,
                endDate,
                isPublished: true,
                views: Math.floor(Math.random() * 500) + 50,
                downloads: Math.floor(Math.random() * 200) + 10,
                createdAt: new Date() // Current timestamp
            }
        });

        process.stdout.write('.');
    }

    console.log(`\n🎉 Successfully seeded ${TOTAL_NEWSLETTERS} newsletters!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
