import prisma from '../src/config/db.js';
import { faker } from '@faker-js/faker';

async function main() {
    console.log('Seeding opportunities...');

    const opportunityTypes = ['INTERNSHIP', 'FELLOWSHIP', 'PROGRAM', 'JOB'];
    const statuses = ['open', 'closed'];

    for (let i = 0; i < 50; i++) {
        const title = faker.person.jobTitle() + ' ' + faker.person.jobType();

        // Create a slug similar to the logic in service
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        await prisma.opportunity.create({
            data: {
                title: title,
                slug: slug,
                description: faker.lorem.paragraphs(3),
                type: opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)],
                location: faker.location.city() + ', ' + faker.location.country(),
                duration: Math.floor(Math.random() * 12 + 1) + ' months',
                deadline: faker.date.future(),
                status: 'open', // Mostly open
                banner: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Generic office/work image
                createdAt: faker.date.past()
            }
        });
    }

    console.log('Successfully created 50 opportunities!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
