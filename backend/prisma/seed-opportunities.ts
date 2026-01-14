
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding opportunities with realistic data...');

    // Clear existing data to remove posts with markdown
    await prisma.opportunity.deleteMany();

    const opportunityTypes = ['INTERNSHIP', 'FELLOWSHIP', 'JAAR', 'PROGRAM', 'JOB'];
    const statuses = ['open', 'closed'];

    const roles = [
        'Frontend Developer',
        'Backend Engineer',
        'Full Stack Developer',
        'UI/UX Designer',
        'Product Manager',
        'Data Scientist',
        'Machine Learning Engineer',
        'DevOps Engineer',
        'QA Engineer',
        'Technical Writer',
        'Business Analyst',
        'Marketing Intern',
        'Content Strategist',
        'HR Specialist',
        'Research Fellow'
    ];

    const companies = [
        'Google', 'Microsoft', 'Amazon', 'Netflix', 'Meta', 'Tesla', 'SpaceX', 'Spotify', 'Uber', 'Airbnb',
        'Pathao', 'Bkash', 'Nagad', 'Chaldal', 'ShopUp', 'Brain Station 23', 'Enosis Solutions'
    ];

    const locations = [
        'Remote', 'Dhaka, Bangladesh', 'Chittagong, Bangladesh', 'Sylhet, Bangladesh',
        'San Francisco, USA', 'London, UK', 'Berlin, Germany', 'Bangalore, India',
        'Singapore', 'Toronto, Canada', 'Hybrid - Dhaka'
    ];

    const banners = [
        'https://drive.google.com/file/d/1u6QLUa_mS1HG82-BGtmaOdtq_2ch89Ts/view?usp=sharing',
        'https://drive.google.com/file/d/16DWut2HR_RHuff53td93OU5o-rkSKks7/view?usp=sharing',
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

    for (let i = 0; i < 50; i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const title = `${role} at ${company}`; // E.g., Frontend Developer at Google

        // Generate a detailed description (Plain text, no markdown)
        const description = `
About the Role
We are looking for a talented ${role} to join our team at ${company}. In this role, you will work closely with cross-functional teams to build and scale innovative solutions.

Key Responsibilities
- Architect, build, and maintain excellent applications with clean code.
- Collaborate with designers to implement intuitive UIs.
- Participate in code reviews and engineering discussions.
- Debug and optimize performance for maximum speed and scalability.

Requirements
- Strong proficiency in JavaScript/TypeScript and modern frameworks.
- Experience with RESTful APIs and database design.
- Excellent problem-solving skills and attention to detail.
- Ability to work in an agile environment.

Perks & Benefits
- Competitive salary and performance bonuses.
- Flexible work hours and remote options.
- Health insurance and wellness programs.
- Professional development budget.

Apply now to be part of our journey!
        `.trim();

        // Unique slug generation
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

        const type = opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const banner = banners[Math.floor(Math.random() * banners.length)];

        // Ensure most are open
        const status = Math.random() > 0.8 ? 'closed' : 'open';

        await prisma.opportunity.create({
            data: {
                title: title,
                slug: slug,
                description: description,
                type: type,
                location: location,
                duration: ['3 months', '6 months', '1 year', 'Permanent'].sort(() => 0.5 - Math.random())[0],
                deadline: faker.date.future({ years: 1 }), // Future date
                status: status,
                banner: banner,
                createdAt: faker.date.past({ years: 1 })
            }
        });

        process.stdout.write('.'); // Progress indicator
    }

    console.log('\n✅ Successfully seeded 50 realistic opportunities!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
