-- DropForeignKey
ALTER TABLE "BoardRow" DROP CONSTRAINT "BoardRow_taskId_fkey";

-- DropForeignKey
ALTER TABLE "BoardRowResult" DROP CONSTRAINT "BoardRowResult_taskResultId_fkey";

-- AddForeignKey
ALTER TABLE "BoardRow" ADD CONSTRAINT "BoardRow_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardRowResult" ADD CONSTRAINT "BoardRowResult_taskResultId_fkey" FOREIGN KEY ("taskResultId") REFERENCES "TaskResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
