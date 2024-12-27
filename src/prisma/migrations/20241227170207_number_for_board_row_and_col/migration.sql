/*
  Warnings:

  - The `cols` column on the `BoardRow` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cols` column on the `BoardRowResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `genId` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `genId` column on the `TaskResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BoardRow" DROP COLUMN "cols",
ADD COLUMN     "cols" INTEGER[];

-- AlterTable
ALTER TABLE "BoardRowResult" DROP COLUMN "cols",
ADD COLUMN     "cols" INTEGER[];

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "genId",
ADD COLUMN     "genId" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TaskResult" DROP COLUMN "genId",
ADD COLUMN     "genId" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Task_genId_row_key" ON "Task"("genId", "row");

-- CreateIndex
CREATE UNIQUE INDEX "TaskResult_genId_row_key" ON "TaskResult"("genId", "row");
