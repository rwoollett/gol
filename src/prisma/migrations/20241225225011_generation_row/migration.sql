/*
  Warnings:

  - A unique constraint covering the columns `[genId,row]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[genId,row]` on the table `TaskResult` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Task_genId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Task_genId_row_key" ON "Task"("genId", "row");

-- CreateIndex
CREATE UNIQUE INDEX "TaskResult_genId_row_key" ON "TaskResult"("genId", "row");
