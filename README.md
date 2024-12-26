<h1 align="center">Game of Life (GOL) Service with GraphQL</h1>

<br />
The GOL GraphQL service uses Nexus schema and Prisma for the SQL database.

The GOL service uses a Bulletin type of Database to holds tasks that are allocate to clients on 
the network to complete and send back results.
The mutations and updates to task with task result mutations is where the GOL board is made.
It will be the client applications to perform the rules on the task they acquire.
The client application is responsible for obtaining a CSToken and read notes under a critical section lock.

The GOL service is made to be used in a Web application to display the board play for GOL.

<br/>

# To use with a Docker Compose system

Make docker image in project root folder with: 
```
docker build -t gol-dev:v1.0 -f Dockerfile .
```

The docker compose can run the docker image gol-dev:v1.0.
Run docker compose with:
```
docker-compose up
```

The compose runtime will also need to generate:
- Redis cache (used for pubsub of events for apollo subscriptions as consumer of published events)
- PostGres database
- Network for the images to be running on
- The CSToken qraphql service (optional). The GOL board can be also be created with GOL mutations.

## Postgres database instance
When running doocker-compose, the Postgres database can be pushed from the local Postgres database.
In development a local Postgres instance is used, which is then pushed to the docker runtime instance.
```
npx prisma db push
```
Also the databases can be seeded with:
``` 
npx prisma db seed
```

Use the .env file to set the URL variable and use the env variable in ./src/prisma/schema.prisma and ./src/prisma/seed.ts.
## schema.prisma
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

```
## seed.ts
```
  const prismaTest = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_TEST_URL
      }
    }
  });
```

# Generate code for CPP
Applications written for accessing the GOL apollo query service in C++ can use CaffQL

## Use CaffQL to generate CPP code 
Depends on the application CaffQL to be built in a separate folder.
The git repo can be cloned from (https://github.com/caffeinetv/CaffQL)

Then within the git repo folder (../CaffQL):
```
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local -G "Unix Makefiles" . -B ./build-release
cmake --build build-release --target all
```

## CaffQL command line: 
Using the caffql in the cstoken project folder:
```
../CaffQL/build-release/caffql --schema IntrospectionQuery.json --output GOLService.hpp --namespace golql
```

<br />

# 🚀 Available Scripts

In the project directory, you can run:
<br />


## ⚡️ dev

```
npm run dev
```

The application depends on a local Postgres database and an instance of Reddis.
If not present the dev command will error.

Runs the app in the development mode.\
Open [http://localhost:3002/api/graphql](http://localhost:3002/graphql) to view playground.

## Setup Redis cache for dev if not using docker-compose
```
docker run --rm --name test-redis -p 6379:6379 redis:6.2-alpine redis-server --loglevel warning --requirepass <your password here>
```

## Setup a Postgres for dev if not using docker-compose
Use a docker container to ease setup of postgres.
Sometimes users will have local postgres installed. It is not required and a docker container can be used.\
An env variable like this required: DATABASE_URL="postgresql://postgres:password@localhost:5432/gol?schema=public"

Check the port for connection, "-p <local port>:<image instance exposed port>" in the run command below.\
Usually 5432:5432 is always used. Postgres uses 5432 as the default exposed port in the running container.
Other local postgres instance could be using port 5432, so review your setup.

```
docker pull postgres:14.6    
docker run --name cstoken -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
```
When postgres instance is running in docker container the database can be created with:
```
npx prisma db push
```
The file prisma.schema uses env variable DATABASE_URL.

Seed the database for sample client information.
```
npx prisma db seed
```
The file prisma/seed.ts use ENV variable DATABASE_TEST_URL. It can point to the same postgre instance
above in DATABASE_URL if you want the test and dev instance to be the same database.

<br />

```
npm run generate
```

Runs the nexus prisma code generator.

<br />

## 🧪 test

```
npm run test
```
Launches the test runner.

<br />

## 🦾 Start

Will do the same as npm run dev. Uses ts-node instead of ts-node-dev. 
```
npm run start
```

Starts the app for production uses.\

<br />

# 🧬 Project structure

This is the structure of the files in the project:

```sh
    │
    ├── src                     # source files
    │   ├── api
    │   │   ├── tests           # Tests for GraphQL resolvers
    │   │   │   ├── __helpers.ts
    │   │   │   ├── blogs.test.ts
    │   │   │   └── posts.test.ts   
    │   │   ├── context.ts      # Nexus schema for local Apollo GraphQL
    │   │   └── server.ts       # Entry point to server
    │   ├── events              # Folder for message events
    │   ├── generated           # Apollo code generation of typedef and hooks from *.graphql files.
    │   ├── graphql             # GraphQL typedefs and reducers
    │   │   ├── resolvers       # Local schema resolvers for qraphql
    │   │   │   └── gol.ts      # Service resolvers for apollo ql   
    │   │   ├── types           # store's actions
    │   │   │   ├── gol.ts      # Objects for Apollo QL. Uses prisma database objects for client inforation
    │   │   │   └── index.ts    # index for all typedefs (used in schema.ts)
    │   │   └── schema.ts       # Apollo Server local schema for CSToken service tables (Postgres database)
    │   ├── lib                 # Apollo client/server and Prisma client
    │   │   └── prismaClient.ts # Prisma client
    │   ├── prisma
    │   │   ├── migrations
    │   │   ├── schema.prisma   # Prisma SQL schema
    │   │   └── seed.ts         # Seed file for tests on dev SQL source
    │   └── codegen.ts      # Grapgh ql queries hooks and types generator codegen runner
    ├── .dockerignore
    ├── .eslintrc.js
    ├── .gitignore
    ├── docker-compose.yml
    ├── Dockerfile
    ├── GOLService.graphql  # Introspection the GOL graphql service for JSON output
    ├── jest-config.js
    ├── package.json
    ├── README.md
    └── tsconfig.json
```
