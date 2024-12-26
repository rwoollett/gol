import { eq, sortBy } from "lodash";
import { FieldResolver } from "nexus";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { sortAndDeduplicateDiagnostics } from "typescript";

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
        genId: genId.toString()
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

export const postTaskResolver: FieldResolver<
  "Mutation", "postTask"
> = async (_, { genId, row, length, rows }, { prisma, pubsub }) => {

  const newTask = await prisma.task.create({
    data: {
      genId,
      row,
      length,
    }
  });

  const boardRows = rows.data.map(async (cols, index) => {
    console.log('board row:',index, cols);
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


// export const connectClientCSResolver: FieldResolver<
//   "Mutation", "connectClientCS"
// > = async (_, { sourceIp, processId }, { prisma, pubsub }) => {

//   const connectedAt = new Date().toISOString();
//   await prisma.client.update({
//     where: {
//       ip: sourceIp
//     },
//     data: {
//       ip: sourceIp,
//       connected: true,
//       connectedAt: connectedAt,
//       processId
//     }
//   });


//   pubsub && pubsub.publish(Subjects.ClientCSConnected,
//     {
//       subject: Subjects.ClientCSConnected,
//       data: { sourceIp, connectedAt, processId }
//     } as ClientCSConnectedEvent);

//   return { sourceIp, connectedAt, processId }
// };

// export const disconnectClientCSResolver: FieldResolver<
//   "Mutation", "disconnectClientCS"
// > = async (_, { sourceIp }, { prisma, pubsub }) => {

//   const disconnectedAt = new Date().toISOString();
//   await prisma.client.update({
//     where: {
//       ip: sourceIp
//     },
//     data: {
//       ip: sourceIp,
//       connected: false,
//       processId: null,
//       disconnectedAt: disconnectedAt
//     }
//   });


//   pubsub && pubsub.publish(Subjects.ClientCSDisconnected,
//     {
//       subject: Subjects.ClientCSDisconnected,
//       data: { sourceIp, disconnectedAt }
//     } as ClientCSDisconnectedEvent);

//   return { sourceIp, disconnectedAt }
// };

// export const createRequestCSResolver: FieldResolver<
//   "Mutation", "createRequestCS"
// > = async (_, { sourceIp, originalIp, parentIp, relayed }, { pubsub }) => {
//   const requestedAt = new Date().toISOString();

//   pubsub && pubsub.publish(Subjects.RequestCSCreated,
//     {
//       subject: Subjects.RequestCSCreated,
//       data: { sourceIp, originalIp, parentIp, requestedAt, relayed }
//     } as RequestCSCreatedEvent);

//   return { sourceIp, originalIp, parentIp, requestedAt, relayed }
// };


// export const createAcquireCSResolver: FieldResolver<
//   "Mutation", "createAcquireCS"
// > = async (_, { ip, sourceIp }, { pubsub }) => {
//   const acquiredAt = new Date().toISOString();

//   pubsub && pubsub.publish(Subjects.AcquireCSCreated,
//     {
//       subject: Subjects.AcquireCSCreated,
//       data: { ip, sourceIp, acquiredAt }
//     } as AcquireCSCreatedEvent);

//   return { ip, sourceIp, acquiredAt }
// };

// export const subcribeConnectedCSResolver = (payload: ClientCSConnectedEvent) => {
//   const { sourceIp, processId, connectedAt } = payload.data;
//   return { sourceIp, processId, connectedAt };
// };

// export const subcribeDisconnectedCSResolver = (payload: ClientCSDisconnectedEvent) => {
//   const { sourceIp, disconnectedAt } = payload.data;
//   return { sourceIp, disconnectedAt };
// };

// export const subcribeRequestCSResolver = (payload: RequestCSCreatedEvent) => {
//   const { data: requestCS } = payload;
//   return {
//     sourceIp: requestCS.sourceIp,
//     originalIp: requestCS.originalIp,
//     parentIp: requestCS.parentIp,
//     requestedAt: requestCS.requestedAt,
//     relayed: requestCS.relayed
//   };
// };

// export const subcribeAcquireCSResolver = (payload: AcquireCSCreatedEvent) => {
//   const { data: acquireCS } = payload;
//   return {
//     ip: acquireCS.ip,
//     sourceIp: acquireCS.sourceIp,
//     acquiredAt: acquireCS.acquiredAt
//   };
// };

