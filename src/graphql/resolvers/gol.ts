import { FieldResolver } from "nexus";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { BoardByGenerationEvent } from "../../events/boardByGenerationEvent";
import { Subjects } from "../../events";

/**
 * Task Manager role granted
 */
let TMRole = false;

/**
 * Get Task by generation id (genId)
 * 
 * Find the first task from a set of task with the genID and incremented row number.
 * When retrieved the ack field is updated to true. This task does not need to be found 
 * again. It will be processed by end user and posted back into TaskResult.
 *  
 * @param genId 
 * @param prisma 
 * @returns task 
 */
export const getNextTaskResolver: FieldResolver<
  "Query",
  "getNextTask"
> = async (_, { }, { prisma }) => {

  try {
    const task = await prisma.task.findFirst({
      select: {
        id: true,
        genId: true,
        row: true,
        length: true,
        allocated: true,
        rows: {
          select: {
            id: true,
            order: true,
            taskId: true,
            cols: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      where:
      {
        allocated: false
      },
      orderBy: [
        {
          row: 'asc'
        }
      ]
    });

    if (task) {
      await prisma.task.update({
        data: {
          allocated: true
        },
        where: {
          id: task.id,
        }
      });
    }

    return task;

  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == 'P2025'
    ) {
      console.log(
        '\u001b[1;31m' +
        'PrismaClientKnownRequestError is catched' +
        '(Error name: ' +
        error.name +
        ')' +
        '\u001b[0m'
      );
    }
    return null;
  };
};

export const getTaskResultByGenIDResolver: FieldResolver<
  "Query",
  "getTaskResultByGenID"
> = async (_, { genId }, { prisma }) => {

  try {
    const taskResult = await prisma.taskResult.findMany({
      select: {
        id: true,
        genId: true,
        row: true,
        length: true,
        rows: {
          select: {
            id: true,
            order: true,
            taskResultId: true,
            cols: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      where:
      {
        genId: genId
      },
      orderBy: [
        {
          row: 'asc'
        }
      ]
    });

    return taskResult;

  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == 'P2025'
    ) {
      console.log(
        '\u001b[1;31m' +
        'PrismaClientKnownRequestError is catched' +
        '(Error name: ' +
        error.name +
        ')' +
        '\u001b[0m'
      );
    }
    return null;
  };
};

export const countTaskResultByGenIDResolver: FieldResolver<
  "Query",
  "countTaskResultByGenID"
> = async (_, { genId }, { prisma }) => {

  try {
    const taskResult = await prisma.taskResult.findMany({
      where:
      {
        genId: genId
      }
    });

    return taskResult.length;

  } catch (error) {
    return 0;
  };
};

export const postTaskResolver: FieldResolver<
  "Mutation", "postTask"
> = async (_, { genId, row, length, rows }, { prisma, pubsub }) => {

  if (!TMRole) {
    throw new Error("Task Manager role not granted");
  }

  const newTask = await prisma.task.create({
    data: {
      genId,
      row,
      length,
    }
  });

  const boardRows = rows.data.map(async (cols, index) => {

    const boardRow = await prisma.boardRow.create({
      data: {
        order: index,
        taskId: newTask.id,
        cols: [...cols]
      }
    });
    return boardRow;
  });

  return {
    id: newTask.id,
    genId,
    row,
    length,
    allocated: newTask.allocated,
    rows: boardRows
  }
};

export const postTaskResultResolver: FieldResolver<
  "Mutation", "postTaskResult"
> = async (_, { genId, row, length, rows }, { prisma, pubsub }) => {

  const newTaskResult = await prisma.taskResult.create({
    data: {
      genId,
      row,
      length,
    }
  });

  const boardRowResults = rows.data.map(async (cols, index) => {
    const boardRow = await prisma.boardRowResult.create({
      data: {
        order: index,
        taskResultId: newTaskResult.id,
        cols: [...cols]
      }
    });
    return boardRow;
  });

  return {
    id: newTaskResult.id,
    genId,
    row,
    length,
    rows: boardRowResults
  }
};

export const removeTaskCompleteResolver: FieldResolver<
  "Mutation", "removeTaskComplete"
> = async (_, { genId }, { prisma }) => {

  const removeMany = await prisma.task.deleteMany({
    where: {
      genId: genId,
      allocated: true
    }
  });

  const removeManyResult = await prisma.taskResult.deleteMany({
    where: {
      genId: genId
    }
  });

  return { message: `Removed ${removeMany.count + removeManyResult.count} records successfully` };
};

export const signinTMRoleResolver: FieldResolver<
  "Mutation", "signinTMRole"
> = async (_, { nodeId, nodeName }, { }) => {

  if (TMRole) {
    return {
      granted: false, message: "Unsuccessfully granted to become task manager. You can become a task worker.",
      nodeId, nodeName
    }
  } else {
    TMRole = true;
    return {
      granted: true, message: "Successfully granted to become task manager.",
      nodeId, nodeName
    };
  }
};

export const signoutTMRoleResolver: FieldResolver<
  "Mutation", "signoutTMRole"
> = async (_, { nodeId }, { }) => {

  if (TMRole) {
    TMRole = false;
    return {
      granted: false, message: "Successfully signed out from task manager role. Goodbye and please cleanup any task resouces created.",
      nodeId, nodeName: ""
    }
  } else {
    return {
      granted: false, message: "Unsuccessful sign out. You are not the current task manager.",
      nodeId, nodeName: ""
    };
  }
};

export const postBoardByGenIDResolver: FieldResolver<
  "Mutation", "postBoardByGenID"
> = async (_, { genId, rows, cols, board }, { pubsub }) => {

  const boardOutput = board.data.map((cols, index) => {
    return cols;
  });

  pubsub && pubsub.publish(Subjects.BoardByGeneration,
    {
      subject: Subjects.BoardByGeneration,
      data: { genId, rows, cols, board: boardOutput }
    } as BoardByGenerationEvent);

  return { genId, rows, cols, board: boardOutput }
};

export const subcribeBoardGenerateResolver = (payload: BoardByGenerationEvent) => {
  const { data: { genId, rows, cols, board } } = payload;
  return { genId, rows, cols, board };
};

