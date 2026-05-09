import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await bcrypt.hash("Admin123@", 10);

  await prisma.admin.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {},
    create: {
      email: "admin@example.com",
      fullName: "Main Admin",
      passwordHash,
      role: "admin",
      isPrimary: true,
      isActive: true,
    },
  });

  await prisma.admin.upsert({
    where: {
      email: "wesam.syrai.2@gmail.com",
    },
    update: {},
    create: {
      email: "wesam.syrai.2@gmail.com",
      fullName: "Second Admin",
      passwordHash,
      role: "admin",
      isPrimary: false,
      isActive: true,
    },
  });

  console.log("Main admin seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
