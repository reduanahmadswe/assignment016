
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOPICS = [
    'Research AI',
    'Bootcamp',
    'Software Engineering',
    'AI Engineering',
    'Chemistry',
    'Physics',
    'Higher Study',
    'Machine Learning',
    'Data Science',
    'Web Development',
    'Cyber Security',
    'Cloud Computing',
    'Blockchain',
    'IoT',
    'Robotics'
];

const EVENT_TYPES = ['Workshop', 'Seminar', 'Bootcamp', 'Webinar', 'Conference', 'Hackathon'];

const IMAGES = [
    'https://drive.google.com/file/d/1u6QLUa_mS1HG82-BGtmaOdtq_2ch89Ts/view?usp=sharing',
    'https://drive.google.com/file/d/116DWut2HR_RHuff53td93OU5o-rkSKks7/view?usp=sharing',
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

const GUESTS = [
    {
        name: "Dr. Ayesha Rahman",
        email: "ayesha@example.com",
        bio: "Professor of Computer Science, BUET. Expert in AI and Machine Learning.",
        role: "speaker",
        pictureLink: "https://randomuser.me/api/portraits/women/44.jpg",
        website: "https://ayesha-rahman.com"
    },
    {
        name: "Mr. Rahim Uddin",
        email: "rahim@example.com",
        bio: "Senior Software Engineer at Google. 10+ years of industry experience.",
        role: "speaker",
        pictureLink: "https://randomuser.me/api/portraits/men/32.jpg",
        cvLink: "https://linkedin.com/in/rahim"
    },
    {
        name: "Sarah Khan",
        email: "sarah@example.com",
        bio: "Data Scientist at Amazon. Specialized in Big Data technologies.",
        role: "guest",
        pictureLink: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
        name: "Dr. Kamal Hossain",
        email: "kamal@example.com",
        bio: "Physics Researcher at CERN. Quantum Computing enthusiast.",
        role: "speaker",
        pictureLink: "https://randomuser.me/api/portraits/men/11.jpg"
    }
];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function generateGuests() {
    const guest1 = getRandomItem(GUESTS);
    let guest2 = getRandomItem(GUESTS);
    while (guest1 === guest2) {
        guest2 = getRandomItem(GUESTS);
    }
    return JSON.stringify([guest1, guest2]);
}

async function createEvent(
    index: number,
    status: 'upcoming' | 'completed' | 'cancelled',
    mode: 'Online' | 'Offline' | 'Hybrid',
    dateOffsetDays: number
) {
    const topic = getRandomItem(TOPICS);
    const type = getRandomItem(EVENT_TYPES);
    const title = `${topic} ${type} ${2025 + Math.floor(index / 20)} - Session ${index}`;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${index}`; // Ensure unique slug

    const startDate = addDays(new Date(), dateOffsetDays);
    const endDate = new Date(startDate.getTime() + getRandomInt(2, 6) * 60 * 60 * 1000); // 2-6 hours duration
    const regDeadline = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before

    let venueDetails = null;
    let onlineLink = null;
    let onlinePlatform = null;

    if (mode === 'Online' || mode === 'Hybrid') {
        onlinePlatform = getRandomItem(['Zoom', 'Google Meet', 'Microsoft Teams']);
        onlineLink = `https://meet.google.com/meet-${index}`;
    }

    if (mode === 'Offline' || mode === 'Hybrid') {
        venueDetails = JSON.stringify({
            name: getRandomItem(['BICC, Dhaka', 'KIB Complex', 'Dhaka University', 'BUET Auditorium', 'North South University']),
            address: "Dhaka, Bangladesh",
            mapLink: "https://maps.google.com/..."
        });
    }

    const isFree = Math.random() > 0.5;
    const price = isFree ? 0 : getRandomInt(1, 10);

    const event = {
        title,
        slug,
        description: `Join us for an immersive ${type.toLowerCase()} on ${topic}. This event will cover fundamental to advanced concepts suitable for students and professionals.`,
        content: `
      <h2>About This Event</h2>
      <p>This ${topic} ${type} is designed to provide deep insights into the subject matter.</p>
      <h3>What you will learn:</h3>
      <ul>
        <li>Core concepts of ${topic}</li>
        <li>Real-world applications</li>
        <li>Industry best practices</li>
        <li>Career guidance and opportunities</li>
      </ul>
      <p>Don't miss this opportunity to network with experts and like-minded individuals.</p>
    `,
        thumbnail: getRandomItem(IMAGES),
        category: topic,
        eventType: type,
        eventMode: mode,
        venueDetails: venueDetails?.includes('{') ? venueDetails : (venueDetails ? JSON.stringify({ name: venueDetails }) : null), // Ensure consistency
        onlineLink,
        onlinePlatform,
        startDate,
        endDate,
        registrationDeadline: regDeadline,
        isFree,
        price,
        currency: "BDT",
        maxParticipants: getRandomInt(50, 500),
        currentParticipants: getRandomInt(0, 50),
        registrationStatus: status === 'cancelled' ? 'closed' : (new Date() > regDeadline ? 'closed' : 'open'),
        eventStatus: status,
        guests: generateGuests(),
        isPublished: true,
        hasCertificate: true,
        isCertificateAvailable: true,
        participantInstructions: "Please join 10 minutes before the session starts. Keep your microphone muted.",
        autoSendMeetingLink: true
    };

    await prisma.event.create({ data: event });
    console.log(`Created ${status} event [${mode}]: ${title}`);
}

async function main() {
    console.log("Starting seeding...");

    // Clear existing events
    await prisma.event.deleteMany({});
    console.log("✅ Cleared existing events");

    // 15 Upcoming (10 Online, 5 Offline)
    console.log("Seeding Upcoming Events...");
    for (let i = 0; i < 10; i++) {
        await createEvent(i, 'upcoming', 'Online', getRandomInt(5, 60)); // Future 5-60 days
    }
    for (let i = 0; i < 5; i++) {
        await createEvent(i + 10, 'upcoming', 'Offline', getRandomInt(5, 60));
    }

    // 5 Cancelled (Can be future dates but cancelled status)
    console.log("Seeding Cancelled Events...");
    for (let i = 0; i < 5; i++) {
        await createEvent(i + 15, 'cancelled', 'Online', getRandomInt(5, 30));
    }

    // 15 Past/Completed
    console.log("Seeding Past Events...");
    for (let i = 0; i < 15; i++) {
        await createEvent(i + 20, 'completed', getRandomItem(['Online', 'Offline']), getRandomInt(-100, -1)); // Past 1-100 days
    }

    // 15 More Completed (to make total 30 past/completed)
    console.log("Seeding Completed Events...");
    for (let i = 0; i < 15; i++) {
        await createEvent(i + 35, 'completed', getRandomItem(['Online', 'Offline']), getRandomInt(-200, -101)); // Past 101-200 days
    }

    console.log("Seeding Finished!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
