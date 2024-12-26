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
  getNextTaskResolver,
  getTaskResultByGenIDResolver,
  postTaskResolver,
  postTaskResultResolver,
  removeTaskCompleteResolver
} from '../resolvers/gol';
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
    t.nonNull.string('genId')
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
    t.nonNull.list.nonNull.string('cols')
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
    t.nonNull.string('genId')
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
    t.nonNull.list.nonNull.string('cols')
  },
  description: "The columns in the GOL board row."
})

export const BoardRowsInput = inputObjectType({
  name: 'BoardRowsInput',
  definition(t) {
    t.nonNull.list.nonNull.list.nonNull.string('data')
  },
  description: "A subset of rows from the whole GOL board where generate new cells"
});

export const GOLQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getNextTask', {
      type: 'Task',
      resolve: getNextTaskResolver
    });
    t.field('getTaskResultByGenID', {
      type: list('TaskResult'),
      args: {
        genId: nonNull(stringArg())
      },
      resolve: getTaskResultByGenIDResolver
    });
  },
});

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
    t.nonNull.field('postTask', {
      type: 'Task',
      args: {
        genId: nonNull(stringArg()),
        row: nonNull(intArg()),
        length: nonNull(intArg()),
        rows: nonNull(BoardRowsInput)
      },
      resolve: postTaskResolver
    });
    t.nonNull.field('postTaskResult', {
      type: 'TaskResult',
      args: {
        genId: nonNull(stringArg()),
        row: nonNull(intArg()),
        length: nonNull(intArg()),
        rows: nonNull(BoardRowsInput)
      },
      resolve: postTaskResultResolver
    });
    t.nonNull.field('removeTaskComplete', {
      type: 'RemovalResult',
      args: {
        genId: nonNull(stringArg())
      },
      resolve: removeTaskCompleteResolver
    });
  },
})

// export const Subscription = extendType({
//   type: "Subscription",
//   definition(t) {
//     t.field(Subjects.ClientCSConnected, {
//       type: 'ConnectedClient',
//       args: {
//         sourceIp: nonNull(stringArg())
//       },
//       subscribe: withFilter(
//         (_root, _args, ctx) => ctx.pubsub.asyncIterator(Subjects.ClientCSConnected),
//         (clientConnect: ClientCSConnectedEvent, variables) => {
//           return (
//             clientConnect.data.sourceIp === variables.sourceIp
//           );
//         }),
//       resolve: subcribeConnectedCSResolver
//     });
//     t.field(Subjects.ClientCSDisconnected, {
//       type: 'DisconnectedClient',
//       args: {
//         sourceIp: nonNull(stringArg())
//       },
//       subscribe: withFilter(
//         (_root, _args, ctx) => ctx.pubsub.asyncIterator(Subjects.ClientCSDisconnected),
//         (clientDisconnect: ClientCSDisconnectedEvent, variables) => {
//           return (
//             clientDisconnect.data.sourceIp === variables.sourceIp
//           );
//         }),
//       resolve: subcribeDisconnectedCSResolver
//     });
//     t.field(Subjects.RequestCSCreated, {
//       type: 'RequestCS',
//       subscribe(_root, _args, ctx) {
//         return ctx.pubsub.asyncIterator(Subjects.RequestCSCreated)
//       },
//       resolve: subcribeRequestCSResolver
//     });
//     t.field(Subjects.AcquireCSCreated, {
//       type: 'AcquireCS',
//       subscribe(_root, _args, ctx) {
//         return ctx.pubsub.asyncIterator(Subjects.AcquireCSCreated)
//       },
//       resolve: subcribeAcquireCSResolver
//     });

//   },
// });


