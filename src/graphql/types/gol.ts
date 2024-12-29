import {
  inputObjectType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from 'nexus';
import { extendType } from 'nexus'
import {
  countTaskResultByGenIDResolver,
  getNextTaskResolver,
  getTaskResultByGenIDResolver,
  postBoardByGenIDResolver,
  postTaskResolver,
  postTaskResultResolver,
  removeTaskCompleteResolver,
  signinTMRoleResolver,
  signoutTMRoleResolver,
  subcribeBoardGenerateResolver
} from '../resolvers/gol';
import { Subjects } from '../../events';
// import {
//   ClientCSConnectedEvent,
//   ClientCSDisconnectedEvent,
//   Subjects
// } from "../../events";
// import { withFilter } from 'graphql-subscriptions';

/**
 * Task
 */
export const Task = objectType({
  name: 'Task',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('genId')
    t.nonNull.int('row')
    t.nonNull.int('length')
    t.nonNull.boolean('allocated', {
      description: "When found with query getNextTask as findFirst this is marked true."
    })
    t.nonNull.list.field('rows', {
      type: 'BoardRow',
      description: "Subset of GOL rows in generation"
    })
  },
  description: "Task of generating new cells in a subset of rows in GOL."
});

/**
 * BoardRow
 */
export const BoardRow = objectType({
  name: 'BoardRow',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('order')
    t.nonNull.int('taskId')
    t.nonNull.list.nonNull.int('cols')
  },
  description: "The columns in the GOL board row."
})

/**
 * Task
 */
export const TaskResult = objectType({
  name: 'TaskResult',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('genId')
    t.nonNull.int('row')
    t.nonNull.int('length')
    t.nonNull.list.field('rows', {
      type: 'BoardRowResult',
      description: "Subset of GOL rows in generation"
    })
  },
  description: "Task Result of generating new cells in a subset of rows in GOL."
});

/**
 * BoardRow
 */
export const BoardRowResult = objectType({
  name: 'BoardRowResult',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('order')
    t.nonNull.int('taskResultId')
    t.nonNull.list.nonNull.int('cols')
  },
  description: "The columns in the GOL board row."
})

export const BoardRowsInput = inputObjectType({
  name: 'BoardRowsInput',
  definition(t) {
    t.nonNull.list.nonNull.list.nonNull.int('data')
  },
  description: "A subset of rows, or the complete rows from the GOL board for one generate."
});

export const BoardOutput = objectType({
  name: 'BoardOutput',
  definition(t) {
    t.nonNull.int('genId')
    t.nonNull.int('rows')
    t.nonNull.int('cols')
    t.nonNull.list.nonNull.list.nonNull.int('board')
  },
  description: "A subset of rows, or the complete rows from the GOL board for one generate."
});

export const GOLQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getNextTask', {
      type: 'Task',
      args: {
        nodeId: nonNull(stringArg()),
      },
      resolve: getNextTaskResolver
    });
    t.field('getTaskResultByGenID', {
      type: list('TaskResult'),
      args: {
        genId: nonNull(intArg())
      },
      resolve: getTaskResultByGenIDResolver
    });
    t.field('countTaskResultByGenID', {
      type: 'Int',
      args: {
        genId: nonNull(intArg())
      },
      resolve: countTaskResultByGenIDResolver
    });
  },
});

export const TaskManagerRole = objectType({
  name: 'TaskManagerRole',
  definition(t) {
    t.nonNull.boolean('granted')
    t.nonNull.string('message')
    t.nonNull.string('nodeId')
    t.nonNull.string('nodeName')
  },
  description: "Task Manager role is allocated to one client to act as task creater for GOL generations."
})

export const RemovalResult = objectType({
  name: 'RemovalResult',
  definition(t) {
    t.nonNull.string('message')
  },
  description: "Removal result."
})

export const GOLMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('signinTMRole', {
      type: 'TaskManagerRole',
      args: {
        nodeId: nonNull(stringArg()),
        nodeName: nonNull(stringArg())
      },
      resolve: signinTMRoleResolver
    });
    t.nonNull.field('signoutTMRole', {
      type: 'TaskManagerRole',
      args: {
        nodeId: nonNull(stringArg()),
      },
      resolve: signoutTMRoleResolver
    });
    t.nonNull.field('postTask', {
      type: 'Task',
      args: {
        genId: nonNull(intArg()),
        row: nonNull(intArg()),
        length: nonNull(intArg()),
        rows: nonNull(BoardRowsInput)
      },
      resolve: postTaskResolver
    });
    t.nonNull.field('postTaskResult', {
      type: 'TaskResult',
      args: {
        genId: nonNull(intArg()),
        row: nonNull(intArg()),
        length: nonNull(intArg()),
        rows: nonNull(BoardRowsInput)
      },
      resolve: postTaskResultResolver
    });
    t.nonNull.field('removeTaskComplete', {
      type: 'RemovalResult',
      args: {
        genId: nonNull(intArg())
      },
      resolve: removeTaskCompleteResolver
    });
    t.nonNull.field('postBoardByGenID', {
      type: 'BoardOutput',
      args: {
        genId: nonNull(intArg()),
        rows: nonNull(intArg()),
        cols: nonNull(intArg()),
        board: nonNull(BoardRowsInput)
      },
      resolve: postBoardByGenIDResolver
    });

  },
})

export const Subscription = extendType({
  type: "Subscription",
  definition(t) {
    t.field(Subjects.BoardByGeneration, {
      type: 'BoardOutput',
      subscribe(_root, _args, ctx) {
        return ctx.pubsub.asyncIterator(Subjects.BoardByGeneration)
      },
      resolve: subcribeBoardGenerateResolver
    });

  },
});


