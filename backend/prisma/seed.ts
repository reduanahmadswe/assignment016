import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting database seeding...");

    // Get role and auth provider IDs
    const adminRole = await prisma.userRole.findUnique({ where: { code: 'admin' } });
    const userRole = await prisma.userRole.findUnique({ where: { code: 'user' } });
    const localAuth = await prisma.authProvider.findUnique({ where: { code: 'local' } });

    if (!adminRole || !userRole || !localAuth) {
      throw new Error('Lookup tables not seeded! Run seed-lookups.ts first.');
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const existingAdmin = await prisma.user.findFirst({
      where: { email: "admin@oriyet.com" }
    });

    if (!existingAdmin) {
      const admin = await prisma.user.create({
        data: {
          email: "admin@oriyet.com",
          password: hashedPassword,
          name: "Admin",
          roleId: adminRole.id,
          isVerified: true,
          isActive: true,
          authProviderId: localAuth.id,
        },
      });
      console.log("✅ Created admin user:", admin.email);
    } else {
      console.log("ℹ️ Admin user already exists:", existingAdmin.email);
    }

    // Create demo user
    const demoPassword = await bcrypt.hash("Demo@123", 12);
    const existingDemo = await prisma.user.findFirst({
      where: { email: "demo@example.com" }
    });

    if (!existingDemo) {
      const demo = await prisma.user.create({
        data: {
          email: "demo@example.com",
          password: demoPassword,
          name: "Demo User",
          roleId: userRole.id,
          isVerified: true,
          isActive: true,
          authProviderId: localAuth.id,
        },
      });
      console.log("✅ Created demo user:", demo.email);
    } else {
      console.log("ℹ️ Demo user already exists:", existingDemo.email);
    }

    // Create default pages
    const pages = [
      {
        title: "Contact Us",
        slug: "contact",
        content: "<h1>Contact Us</h1><p>Get in touch with ORIYET team.</p>",
        isPublished: true,
      },
    ];

    for (const pageData of pages) {
      const existingPage = await prisma.page.findFirst({
        where: { slug: pageData.slug }
      });

      if (!existingPage) {
        const page = await prisma.page.create({
          data: pageData,
        });
        console.log("✅ Created page:", page.slug);
      } else {
        console.log("ℹ️ Page already exists:", existingPage.slug);
      }
    }

    console.log("\n🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
