-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "genId" VARCHAR(50) NOT NULL,
    "row" INTEGER NOT NULL DEFAULT -1,
    "length" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardRow" (
    "id" SERIAL NOT NULL,
    "cols" TEXT[],
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "BoardRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskResult" (
    "id" SERIAL NOT NULL,
    "genId" VARCHAR(50) NOT NULL,
    "row" INTEGER NOT NULL DEFAULT -1,
    "length" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardRowResult" (
    "id" SERIAL NOT NULL,
    "cols" TEXT[],
    "taskResultId" INTEGER NOT NULL,

    CONSTRAINT "BoardRowResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_genId_key" ON "Task"("genId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskResult_genId_key" ON "TaskResult"("genId");

-- AddForeignKey
ALTER TABLE "BoardRow" ADD CONSTRAINT "BoardRow_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardRowResult" ADD CONSTRAINT "BoardRowResult_taskResultId_fkey" FOREIGN KEY ("taskResultId") REFERENCES "TaskResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
