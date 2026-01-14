
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMAGES = [
    'https://drive.google.com/file/d/1u6QLUa_mS1HG82-BGtmaOdtq_2ch89Ts/view?usp=sharing',
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

const TITLES = [
    "The Future of Artificial Intelligence in Education 2026",
    "Mastering Full Stack Development: A Comprehensive Roadmap",
    "Cybersecurity Trends: How to Protect Your Digital Assets",
    "The Rise of Quantum Computing and Its Impact",
    "Sustainable Technology: Green Coding and Cloud efficiency",
    "Blockchain Beyond Crypto: Enterprise Solutions",
    "Data Science vs Machine Learning: Which Career Path is Right?",
    "Modern UI/UX Design Principles for 2026",
    "Cloud Computing Services: AWS vs Azure vs Google Cloud",
    "The Evolution of Programming Languages: Latest Trends"
];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTable() {
    return `
    <div class="overflow-x-auto my-8 border rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Metric</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Year</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Growth</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">Adoption Rate</td>
                    <td class="px-6 py-4 whitespace-nowrap">45%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-green-600 font-bold">+12%</td>
                </tr>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">Efficiency Score</td>
                    <td class="px-6 py-4 whitespace-nowrap">7.8/10</td>
                    <td class="px-6 py-4 whitespace-nowrap text-green-600 font-bold">+1.5</td>
                </tr>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">Market Value</td>
                    <td class="px-6 py-4 whitespace-nowrap">$2.4B</td>
                    <td class="px-6 py-4 whitespace-nowrap text-green-600 font-bold">$3.1B</td>
                </tr>
            </tbody>
        </table>
    </div>
    `;
}

function getDirectUrl(url: string) {
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        let fileId = '';
        const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch) fileId = fileMatch[1];

        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
    }
    return url;
}

function generateLongContent(title: string, embeddedImage: string) {
    const includeTable = Math.random() > 0.5;
    const directEmbeddedImage = getDirectUrl(embeddedImage);

    return `
        <p class="lead text-xl text-gray-600 mb-8">
            In the rapidly evolving landscape of technology, <strong>${title}</strong> has emerged as a critical topic of discussion. 
            This comprehensive guide explores the nuances, implications, and future trajectory of this phenomenon.
        </p>

        <h2 class="text-2xl font-bold mb-4 mt-8">Introduction to the Paradigm Shift</h2>
        <p class="mb-4">
            We are standing on the precipice of a new era. The traditional methods are being challenged by innovative approaches that promise greater efficiency and scalability. 
            As we delve deeper into this subject, it becomes evident that understanding the core principles is paramount for success in the modern digital ecosystem.
        </p>
        <p class="mb-4">
            Experts suggest that the integration of advanced methodologies will not only streamline operations but also unlock new avenues for growth. 
            This article aims to dissect these components and provide a clear roadmap for implementation.
        </p>

        <figure class="my-10 relative rounded-xl overflow-hidden shadow-lg">
            <img src="${directEmbeddedImage}" alt="Visual representation of ${title}" class="w-full object-cover h-[400px]" />
            <figcaption class="text-center text-gray-500 mt-3 text-sm italic border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                Figure 1: A visual breakdown illustrating the core concepts of ${title}.
            </figcaption>
        </figure>

        <h2 class="text-2xl font-bold mb-4 mt-8">Key Drivers of Change</h2>
        <p class="mb-4">
            Several factors are propelling this transformation. Firstly, the exponential growth of data has necessitated more robust processing capabilities. 
            Secondly, consumer expectations have shifted towards hyper-personalization and real-time responsiveness.
        </p>
        <p class="mb-4">
            To address these challenges, organizations are adopting agile frameworks and leveraging cutting-edge tools. 
            This strategic pivot is not merely a trend but a fundamental restructuring of how value is delivered.
        </p>

        ${includeTable ? `<h3 class="text-xl font-bold mb-4 mt-8">Comparative Analysis</h3><p>The following table illustrates the projected growth and metrics associated with adopting these new standards:</p>${generateTable()}` : ''}

        <h2 class="text-2xl font-bold mb-4 mt-8">Strategic Implementation</h2>
        <p class="mb-4">
            Implementing these strategies requires a holistic approach. It is not enough to simply upgrade technology; cultural alignment is equally important. 
            Teams must be empowered to experiment, fail fast, and learn rapidly.
        </p>
        <ul class="list-disc list-inside mb-6 space-y-2 bg-blue-50 p-6 rounded-lg">
            <li><strong>Continuous Learning:</strong> Stay updated with the latest industry developments.</li>
            <li><strong>Cross-functional Collaboration:</strong> Break down silos to foster innovation.</li>
            <li><strong>Data-Driven Decision Making:</strong> Leverage analytics to guide strategy.</li>
            <li><strong>User-Centric Design:</strong> Prioritize the end-user experience in every initiative.</li>
        </ul>

        <h2 class="text-2xl font-bold mb-4 mt-8">Future Outlook</h2>
        <p class="mb-4">
            Looking ahead, the trajectory is clear. Those who adapt will thrive, while laggards risk obsolescence. 
            The covergence of AI, IoT, and other emerging tech will create synergies that we are only beginning to understand.
        </p>
        <p class="mb-4">
            In conclusion, <strong>${title}</strong> represents more than just a technological upgrade; it is a catalyst for broader organizational evolution. 
            By embracing these changes today, we pave the way for a more efficient and innovative tomorrow.
        </p>
    `;
}

async function main() {
    console.log('🌱 Starting blog seeding with realistic content...');

    // Clear existing blogs
    await prisma.blogPost.deleteMany();

    // Ensure there is at least one user to be the author
    const author = await prisma.user.findFirst();
    if (!author) {
        console.warn('⚠️ No user found! please seed users first.');
        return;
    }

    const TOTAL_POSTS = 50; // Generate 50 high-quality posts

    for (let i = 0; i < TOTAL_POSTS; i++) {
        const titleBase = getRandomItem(TITLES);
        const title = `${titleBase} - Part ${i + 1}`;
        const thumbnail = getRandomItem(IMAGES);
        const embeddedImage = getRandomItem(IMAGES);

        // Generate Slug
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + `-${Date.now()}-${i}`;

        const content = generateLongContent(title, embeddedImage);

        await prisma.blogPost.create({
            data: {
                title: title,
                slug: slug,
                excerpt: `An in-depth look at ${titleBase}. Discover the key trends, challenges, and opportunities that are defining the future of this field.`,
                content: content,
                thumbnail: thumbnail,
                authorId: author.id,
                status: 'published',
                publishedAt: new Date(),
                views: Math.floor(Math.random() * 10000),
                tags: 'tech, innovation, future, education',
                metaTitle: title,
                metaDescription: `Read about ${titleBase} and its impact on the industry.`
            }
        });

        process.stdout.write('.');
    }

    console.log(`\n🎉 Successfully seeded ${TOTAL_POSTS} long, realistic blog posts!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
