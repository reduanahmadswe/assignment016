import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const upcomingEvents = [
  {
    title: "AI & Machine Learning Workshop 2025",
    slug: "ai-ml-workshop-2025",
    description: "Learn the fundamentals of Artificial Intelligence and Machine Learning. This hands-on workshop covers neural networks, deep learning, and practical applications with Python and TensorFlow.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    eventType: "workshop",
    eventMode: "offline",
    venueDetails: JSON.stringify({ name: "ORIYET Training Center, Dhanmondi, Dhaka" }),
    startDate: new Date("2026-01-05T10:00:00"),
    endDate: new Date("2026-01-05T16:00:00"),
    registrationDeadline: new Date("2026-01-04T23:59:00"),
    price: 500,
    maxParticipants: 30,
    currentParticipants: 0,
    eventStatus: "upcoming",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "Web Development Bootcamp - React & Next.js",
    slug: "web-dev-bootcamp-react-nextjs",
    description: "Intensive 2-day bootcamp on modern web development with React and Next.js. Build real-world projects and learn best practices from industry experts.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    eventType: "workshop",
    eventMode: "offline",
    venueDetails: JSON.stringify({ name: "Tech Hub, Banani, Dhaka" }),
    startDate: new Date("2026-01-10T09:00:00"),
    endDate: new Date("2026-01-11T17:00:00"),
    registrationDeadline: new Date("2026-01-08T23:59:00"),
    price: 1500,
    maxParticipants: 25,
    currentParticipants: 0,
    eventStatus: "upcoming",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "Digital Marketing Masterclass",
    slug: "digital-marketing-masterclass-2025",
    description: "Master SEO, Social Media Marketing, Google Ads, and Content Marketing strategies. Perfect for entrepreneurs and marketing professionals.",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    eventType: "seminar",
    eventMode: "hybrid",
    venueDetails: JSON.stringify({ name: "ORIYET Conference Hall, Gulshan, Dhaka" }),
    onlineLink: "https://meet.google.com/abc-defg-hij",
    onlinePlatform: "google_meet",
    startDate: new Date("2026-01-15T14:00:00"),
    endDate: new Date("2026-01-15T18:00:00"),
    registrationDeadline: new Date("2026-01-14T23:59:00"),
    price: 300,
    maxParticipants: 100,
    currentParticipants: 0,
    eventStatus: "upcoming",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "Cybersecurity Fundamentals Webinar",
    slug: "cybersecurity-fundamentals-webinar",
    description: "Free online webinar covering essential cybersecurity concepts, threat prevention, and best practices for protecting your digital assets.",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop",
    eventType: "webinar",
    eventMode: "online",
    onlineLink: "https://zoom.us/j/123456789",
    onlinePlatform: "zoom",
    startDate: new Date("2026-01-20T19:00:00"),
    endDate: new Date("2026-01-20T21:00:00"),
    registrationDeadline: new Date("2026-01-20T18:00:00"),
    price: 0,
    maxParticipants: 500,
    currentParticipants: 0,
    eventStatus: "upcoming",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "Data Science Career Workshop",
    slug: "data-science-career-workshop-2025",
    description: "Explore career opportunities in Data Science. Learn about required skills, job market trends, and how to build a successful career path in this growing field.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    eventType: "workshop",
    eventMode: "offline",
    venueDetails: JSON.stringify({ name: "Innovation Lab, Uttara, Dhaka" }),
    startDate: new Date("2026-01-25T10:00:00"),
    endDate: new Date("2026-01-25T15:00:00"),
    registrationDeadline: new Date("2026-01-24T23:59:00"),
    price: 200,
    maxParticipants: 40,
    currentParticipants: 0,
    eventStatus: "upcoming",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
];

const pastEvents = [
  {
    title: "Python Programming Basics",
    slug: "python-programming-basics-dec-2025",
    description: "Introduction to Python programming for beginners. Covered variables, data types, loops, functions, and basic object-oriented programming concepts.",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop",
    eventType: "workshop",
    eventMode: "offline",
    venueDetails: JSON.stringify({ name: "ORIYET Training Center, Dhanmondi, Dhaka" }),
    startDate: new Date("2025-12-15T10:00:00"),
    endDate: new Date("2025-12-15T16:00:00"),
    registrationDeadline: new Date("2025-12-14T23:59:00"),
    price: 300,
    maxParticipants: 25,
    currentParticipants: 0,
    eventStatus: "completed",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "Freelancing Success Seminar",
    slug: "freelancing-success-seminar-dec-2025",
    description: "Learn how to build a successful freelancing career. Topics covered: finding clients, pricing strategies, portfolio building, and time management.",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
    eventType: "seminar",
    eventMode: "hybrid",
    venueDetails: JSON.stringify({ name: "Digital World, Mirpur, Dhaka" }),
    onlineLink: "https://meet.google.com/xyz-abcd-efg",
    onlinePlatform: "google_meet",
    startDate: new Date("2025-12-10T14:00:00"),
    endDate: new Date("2025-12-10T17:00:00"),
    registrationDeadline: new Date("2025-12-09T23:59:00"),
    price: 0,
    maxParticipants: 150,
    currentParticipants: 0,
    eventStatus: "completed",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "UI/UX Design Fundamentals",
    slug: "ui-ux-design-fundamentals-dec-2025",
    description: "Comprehensive workshop on user interface and user experience design. Hands-on sessions with Figma and design thinking methodologies.",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    eventType: "workshop",
    eventMode: "offline",
    venueDetails: JSON.stringify({ name: "Creative Hub, Banani, Dhaka" }),
    startDate: new Date("2025-12-05T09:00:00"),
    endDate: new Date("2025-12-05T17:00:00"),
    registrationDeadline: new Date("2025-12-04T23:59:00"),
    price: 800,
    maxParticipants: 20,
    currentParticipants: 0,
    eventStatus: "completed",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "Cloud Computing with AWS",
    slug: "cloud-computing-aws-nov-2025",
    description: "Introduction to Amazon Web Services. Covered EC2, S3, Lambda, and deployment strategies for scalable applications.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop",
    eventType: "webinar",
    eventMode: "online",
    onlineLink: "https://zoom.us/j/987654321",
    onlinePlatform: "zoom",
    startDate: new Date("2025-11-25T19:00:00"),
    endDate: new Date("2025-11-25T21:30:00"),
    registrationDeadline: new Date("2025-11-25T18:00:00"),
    price: 0,
    maxParticipants: 300,
    currentParticipants: 0,
    eventStatus: "completed",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
  {
    title: "Mobile App Development with Flutter",
    slug: "mobile-app-flutter-nov-2025",
    description: "Build cross-platform mobile applications using Flutter and Dart. Created a complete app from scratch during this intensive workshop.",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop",
    eventType: "workshop",
    eventMode: "offline",
    venueDetails: JSON.stringify({ name: "Tech Academy, Mohammadpur, Dhaka" }),
    startDate: new Date("2025-11-15T10:00:00"),
    endDate: new Date("2025-11-16T16:00:00"),
    registrationDeadline: new Date("2025-11-14T23:59:00"),
    price: 1200,
    maxParticipants: 30,
    currentParticipants: 0,
    eventStatus: "completed",
    isPublished: true,
    isCertificateAvailable: true,
    hasCertificate: true,
    eventContactEmail: "support@oriyet.com",
    eventContactPhone: "+880 1718-485840",
  },
];

async function main() {
  console.log("🚀 Creating demo events...\n");

  // Create upcoming events
  console.log("📅 Creating 5 upcoming events...");
  for (const event of upcomingEvents) {
    const existing = await prisma.event.findFirst({ where: { slug: event.slug } });
    if (existing) {
      console.log(`  ⏭️  Skipped (exists): ${event.title}`);
      continue;
    }
    await prisma.event.create({ data: event });
    console.log(`  ✅ Created: ${event.title}`);
  }

  // Create past events
  console.log("\n📅 Creating 5 past events...");
  for (const event of pastEvents) {
    const existing = await prisma.event.findFirst({ where: { slug: event.slug } });
    if (existing) {
      console.log(`  ⏭️  Skipped (exists): ${event.title}`);
      continue;
    }
    await prisma.event.create({ data: event });
    console.log(`  ✅ Created: ${event.title}`);
  }

  console.log("\n🎉 Demo events created successfully!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
