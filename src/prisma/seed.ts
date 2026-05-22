import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedData() {
  console.log('🌱 Starting data seeding...');

  const seedData = [
    {
      model: 'examStatus',
      data: [
        { id: 1, status: 'DRAFT' },
        { id: 2, status: 'PUBLISHED' },
        { id: 3, status: 'COMPLETED' }
      ]
    },
    {
      model: 'questionType',
      data: [
        { id: 1, type: 'MULTIPLE CHOICE' },
        { id: 2, type: 'SHORT ANSWER' },
        { id: 3, type: 'MULTIPLE ANSWER' },
        { id: 4, type: 'TRUE or FALSE' }
      ]
    },
    {
      model: 'submissionStatus',
      data: [
        { id: 1, status: 'IN PROGRESS' },
        { id: 2, status: 'COMPLETED' },
        { id: 3, status: 'GRADED' }
      ]
    }
  ];

  for (const { model, data } of seedData) {
    data.map(item => 
      prisma[model].upsert({
        where: { id: item.id },
        update: {},
        create: item
    }));
    console.log(`✅ Seeded ${model} successfully!`);
  }  
}

async function main() {
  console.log('🌱 Starting database seeding...');

  const users = [
    { id: 'TC00001', prefix: 'TC', email: 'tannh16@teacher.gmail.com', fullName: 'Nguyen Huu Tan', role: 'teacher' },
    { id: 'AD00001', prefix: 'AD', email: 'tannh16@admin.gmail.com', fullName: 'Nguyen Huu Tan', role: 'admin' },
    { id: 'ST00001', prefix: 'ST', email: 'tannh16@student.gmail.com', fullName: 'Nguyen Huu Tan', role: 'student' },
  ];

  const saltOrRounds = 10;
  const hashedPassword = await bcrypt.hash('123123123', saltOrRounds);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        prefix: user.prefix,
        email: user.email,
        passwordHash: hashedPassword,
        fullName: user.fullName,
      },
    });

    await prisma[user.role].upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id },
    });

    console.log(`✅ Seeded ${user.role} successfully: ${user.id}`);
  }
}

seedData();
main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });