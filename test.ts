import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const activities = await prisma.activity.findMany();
  console.log(activities);
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});