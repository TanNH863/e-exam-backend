import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  const saltOrRounds = 10;
  const hashedPassword = await bcrypt.hash('123123123', saltOrRounds);

  const teacher = await prisma.user.upsert({
    where: { email: 'tannh16@teacher.gmail.com' },
    update: {}, 
    create: {
      email: 'tannh16@teacher.gmail.com',
      passwordHash: hashedPassword, // Make sure this matches your schema's exact field name!
      fullName: 'Nguyen Huu Tan',
      role: 'TEACHER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'tannh16@admin.gmail.com' },
    update: {}, 
    create: {
      email: 'tannh16@admin.gmail.com',
      passwordHash: hashedPassword,
      fullName: 'Nguyen Huu Tan',
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'tannh16@student.gmail.com' },
    update: {}, 
    create: {
      email: 'tannh16@student.gmail.com',
      passwordHash: hashedPassword,
      fullName: 'Nguyen Huu Tan',
      role: 'STUDENT',
    },
  });

  console.log(`✅ Seeded teacher successfully: ${teacher.email}`);
  console.log(`✅ Seeded admin successfully: ${admin.email}`);
  console.log(`✅ Seeded student successfully: ${student.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });