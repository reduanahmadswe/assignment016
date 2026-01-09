
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real Unsplash images for tech/education
const blogTemplates = [
    {
        title: "The Future of Web Development: AI Agents & Beyond",
        excerpt: "Explore how AI is shifting the paradigm from writing code to orchestrating intelligent agents in modern web development.",
        content: `
      <p>The landscape of web development is undergoing a seismic shift. We are moving from a world where developers write every line of code to one where we orchestrate intelligent agents to build complex systems.</p>
      <h2>The Rise of Agentic Coding</h2>
      <p>AI agents are not just autocomplete tools; they are capable of reasoning, planning, and executing multi-step tasks. In 2026, we expect to see...</p>
      <h3>Key Trends:</h3>
      <ul>
        <li><strong>Autonomous Debugging:</strong> Agents that can identify and fix runtime errors in real-time.</li>
        <li><strong>Generative UI:</strong> Interfaces that adapt dynamically to user behavior.</li>
      </ul>
      <p>As developers, our role is evolving into 'System Architects' who guide these powerful tools.</p>
    `,
        tags: "web-development,ai,future,tech",
        thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Mastering React Server Components in 2026",
        excerpt: "A comprehensive guide to understanding RSCs, streaming hydration, and how to build blazing fast applications.",
        content: `
      <p>React Server Components (RSC) have fundamentally changed how we build React applications. By shifting the heavy lifting to the server, we can achieve zero-bundle-size components.</p>
      <h2>Why RSC Matters</h2>
      <p>Traditional SPAs suffered from large JavaScript bundles. RSCs allow you to render static content on the server while keeping interactive islands on the client.</p>
      <p>This hybrid approach leverages the best of both worlds: the SEO and performance of server rendering with the interactivity of client-side React.</p>
    `,
        tags: "react,javascript,frontend,performance",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "10 Proven Tips for Remote Work Life Balance",
        excerpt: "Strategies to stay productive, avoid burnout, and maintain a healthy lifestyle while working from home.",
        content: `
      <p>Working from home offers freedom, but it also blurs the lines between professional and personal life. Here is how to reclaim your balance.</p>
      <h2>1. Definite Work Hours</h2>
      <p>Just because you <em>can</em> work at midnight doesn't mean you <em>should</em>. Set a specific start and end time for your day.</p>
      <h2>2. Dedicated Workspace</h2>
      <p>Your bed is not your desk. creating a physical separation helps your brain switch modes.</p>
    `,
        tags: "career,remote-work,productivity,lifestyle",
        thumbnail: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "The Industrial Revolution 4.0: Blockchain & Supply Chain",
        excerpt: "How distributed ledger technology is creating transparent, tamper-proof supply chains across the globe.",
        content: `
      <p>Blockchain is often synonymous with cryptocurrency, but its real value lies in trustless verification. In supply chain management, this is revolutionary.</p>
      <p>From tracking coffee beans to verifying pharmaceutical authenticity, blockchain ensures that data cannot be altered once recorded.</p>
    `,
        tags: "blockchain,tech,innovation,industry",
        thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Modern UI/UX Trends: Glassmorphism & Bento Grids",
        excerpt: "An analysis of the visual styles dominating 2026—from frosted glass effects to structured bento layouts.",
        content: `
      <p>Design is cyclical. We are seeing a resurgence of depth and texture in UI design, moving away from flat design.</p>
      <h2>The Bento Grid Revolution</h2>
      <p>Popularized by Apple and others, bento grids offer a modular, responsive way to showcase content. They are visually pleasing and highly functional on mobile devices.</p>
    `,
        tags: "design,ui,ux,creative",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Edge Computing: Processing at the Speed of Light",
        excerpt: "Why centralized clouds are becoming too slow for the next generation of IoT and real-time apps.",
        content: `
      <p>Latency is the new bottleneck. Sending data to a central server halfway across the world is too slow for self-driving cars or robotic surgery.</p>
      <p>Edge computing moves the processing power to the 'edge' of the network—routers, gateways, and local servers—drastically reducing response times.</p>
    `,
        tags: "cloud,edge-computing,iot,infrastructure",
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Python vs JavaScript: The Ultimate Showdown",
        excerpt: "Comparing the two giants of the programming world. Which one should you choose for your next project?",
        content: `
      <p>It is the classic debut: Python or JavaScript? The answer depends entirely on what you want to build.</p>
      <ul>
        <li><strong>Choose Python if:</strong> You are into Data Science, AI, ML, or backend scripting.</li>
        <li><strong>Choose JavaScript if:</strong> You want to build interactive web applications, frontends, or full-stack Node.js apps.</li>
      </ul>
    `,
        tags: "programming,python,javascript,career",
        thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Cybersecurity 101: Securing Your API",
        excerpt: "Essential security practices for backend developers. OWASP Top 10, JWTs, and Rate Limiting explained.",
        content: `
      <p>Security is not a feature; it is a necessity. A single vulnerability can compromise your entire user base.</p>
      <h2>Common Vulnerabilities</h2>
      <p>SQL Injection, Broken Authentication, and Exposed Data are still common. Learn how to sanitize inputs and enforce strict access controls.</p>
    `,
        tags: "security,coding,devops,safety",
        thumbnail: "https://images.unsplash.com/photo-1614064641938-3bcee529cfc4?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Microservices Architecture: A Practical Guide",
        excerpt: "From monolith to microservices. Learn how to decouple your application for scalability and resilience.",
        content: `
      <p>Scaling a monolith is like trying to upgrade a moving train. Microservices allow you to upgrade individual cars without stopping the train.</p>
      <p>However, microservices introduce complexity in deployment, networking, and data consistency. Is it worth it? Let's discuss.</p>
    `,
        tags: "backend,microservices,architecture,system-design",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "The Art of Technical Writing for Developers",
        excerpt: "Why communication is the most underrated skill in engineering and how to improve your documentation.",
        content: `
      <p>You might write the most elegant code in the world, but if no one understands it, it is useless.</p>
      <p>Technical writing helps you clarify your thoughts, onboard new team members, and build a personal brand. Start by writing READMEs that actually help.</p>
    `,
        tags: "career,soft-skills,writing,communication",
        thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop"
    }
];

async function main() {
    console.log('🌱 Starting blog seeding...');

    // Ensure there is at least one user to be the author
    const author = await prisma.user.findFirst();
    if (!author) {
        console.warn('⚠️ No user found! Please seed users first. Skipping blog seeding.');
        return;
    }

    const TOTAL_POSTS = 500;

    for (let i = 0; i < TOTAL_POSTS; i++) {
        // Cycle through templates
        const template = blogTemplates[i % blogTemplates.length];

        // Create unique slug
        // e.g. the-future-of-web-dev-1, the-future-of-web-dev-11
        const uniqueSuffix = i + 1;
        // Simple slugify
        const baseSlug = template.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const slug = `${baseSlug}-${uniqueSuffix}`;

        // Add some variation to views and dates
        const randomDaysAgo = Math.floor(Math.random() * 365);
        const publishDate = new Date();
        publishDate.setDate(publishDate.getDate() - randomDaysAgo);

        const post = {
            title: `${template.title} ${uniqueSuffix > 10 ? '(Vol. ' + uniqueSuffix + ')' : ''}`, // Add variation to title
            slug: slug,
            excerpt: template.excerpt,
            content: template.content,
            thumbnail: template.thumbnail,
            tags: template.tags,
            authorId: author.id,
            status: 'published',
            publishedAt: publishDate,
            views: Math.floor(Math.random() * 5000) + 100, // Random view count 100-5100
            metaTitle: template.title,
            metaDescription: template.excerpt
        };

        await prisma.blogPost.upsert({
            where: { slug: slug },
            update: post,
            create: post,
        });

        if ((i + 1) % 50 === 0) {
            console.log(`✅ Processed ${i + 1} / ${TOTAL_POSTS} posts...`);
        }
    }

    console.log(`🎉 Successfully seeded ${TOTAL_POSTS} blog posts with real content!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
