import { PrismaClient } from "@prisma/client";

(async () => {
  const prismaTest = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DOCKER_DATABASE_URL
      }
    }
  });
  await prismaTest.$executeRaw`
  TRUNCATE TABLE "Task" RESTART IDENTITY CASCADE;
  `;
  await prismaTest.$executeRaw`
  TRUNCATE TABLE "TaskResult" RESTART IDENTITY CASCADE;
  `;
  
  prismaTest.$disconnect();

})();

export { };