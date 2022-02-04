# Cylab (Backend Project)

 ## Description
This project mimics the Crack the Box and Capture the Flag concept with some additional features.

The backend is built using [NestJS](https://github.com/nestjs/nest) framework that uses [TypeScript](https://www.typescriptlang.org/) as a language in modular structure.

---
## Note
This project is set to utilize docker. Even though you can install and run the project locally, we highly recommend using docker for consistency and to run smoothly in any machine.

---
## Prerequisites
### - Docker (recommended)
1. Install [Docker](https://www.docker.com/get-started)
2. Verify that Docker and Docker Compose is installed by running `docker version` and `docker-compose version`
3. Further more, verify that docker daemon is running by running `docker run hello-world` you should see a hello world print from the pulled docker container.(use sudo if required)
### - Locally
1. Install [Nodejs](https://nodejs.org/en/) LTS version.
2. Verify that Node and NPM (the node package manager) are correctly installed by running ```node --version``` and ```npm --version```
3. Install [PostgreSQL](https://www.postgresql.org/) version 14
4. Confirm that PostgreSQL is correctly installed by running ```psql --version```

---
## Setup
- After installing the necessary tools, you just need to clone the project to your local machine.
- You can clone the project the normal (Github) way, or use [SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

---
## Running the app
### - Docker
1. While in root directory of the project, run `npm run docker` to run the whole stack (both the application and the database in one go).
2. First run will take a while to pull the test and dev DBs and build the image.
3. When everything is up and running, run `curl 127.0.0.1:3001/api` in terminal to verify that the server is up and running (you should get "Hello World!").
4. To rebuild the application, on a separate terminal in the application directory, type `npm run docker:down` to turn off the docker containers. If you want to drop the database as well use `npm run docker:down:v` to drop volumes. Then run `npm run docker:build`

### - Locally
1. While in root directory of the project, run ```npm install``` to install all the project dependencies.
2. Connect to postgreSQL by either the command line or a database interface such as [TablePlus](https://tableplus.com/).
3. Create the databases "ctb-db" and "ctb-test-db".
4. Run ```npm run start:dev``` to run the server locally.
5. When everything is up and running, run `curl 127.0.0.1:3001/api` in terminal to verify that the server is up and running (you should get "Hello World!").

---
## Available Scripts
- ```npm run start:dev```

This command runs the server in development and mode and watches for changes. You can also build the app using ```npm run build``` and run in debug mode or production mode using ```npm run start:debug``` or ```npm run start:prod```.


- ```npm run lint```

This command runs elsint to catch lint mistakes and fix it for you, you can also use ```npm run lint:no-fix``` to let it warn you without fixing these issues.


- ```npm run test```

This runs all the test suites in the project in the **Docker** container. There are different veriaties of this command, for example we have ```npm run test:watch``` to watch the test for any changes and re-run them. Or ```npm run test:cov``` for coverage and ```npm run test:debug``` to run in debug mode.

These commands can also be executed locally by prefixing the command with 'local:', for instance ```npm run local:test``` or ```npm run local:test:watch```.


- ```npm run migrate:generate```

This command checks the entities (models) you have in the project and checks for differences agains your database, and it will generate migrations to apply these differences.

- ```npm run migrate:run```

This command runs in the **Docker** container to apply migration changes in the database. You can also revert these changes by running ```npm run migrate:revert```.

**Note**: Same thing applies here. You can run it locally by prefixing with local: (example: ```npm run local:migrate:run```).


- ```npm run seed:run```

This command runs the seeders to inject data into your database. You can run a specific seeder class by running ```npm run seed:run:class CLASS_NAME```.

Local prefix also applies here, ```npm run local:seed:run``` or ```npm run local:seed:run:class CLASS_NAME```.

- ```npm run docker```

This command is to spin up the docker containers for both the application and all needed databases.

You can take it down by running ```npm run docker:down```.
