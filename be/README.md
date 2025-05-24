# Skill's APP

## Description

Skill's App, developed with NestJS, is the ultimate application designed specifically for software developers to guide them in advancing their skills. With Skill's Application, one can generate a personalized pdf based on the skillset you wish to learn which would act as a guide in your learning journey.

Key benefits of the application is that instead of manually crafting skill documents, the application automates the process, saving users significant time. Users can easily update their skill tags and regenerate PDFs, ensuring their documents are always up-to-date with minimal effort.

<!-- An admin can:  

    - pass an excel file with details of all the skills and their requirements of how to learn them which is then processed and is used from the database
    - fetch job status using the job id which is displayed after uploading an excel file
    - fetch list of all the jobs that can be seen and filtered based on job type or using its job Id
    - change visibility and order number of the skills that would appear in the pdf when exported
    - load matrix of skills based on the tags passed as an argument
    - generate a pdf which will have all the information related to skills based on the tags passed  

A logged in user can:  

    - rate themselves for a skill which is mentioned
    - get all the available main skills based on their role in the employee table
    - generate their skill matrix based on their main skills -->

## Project setup

```bash
$ npm install

#or

$ npm i
```

## Build project

```bash
$ npm run build
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Running migration scripts

- Make sure before running the migrations build the project.

- Run migrations

```bash
npm run migration:run
```

- Generate migrations

```bash
npm run migration:generate -- src/migrations/<<NameOfTheMigration>>
```

- Revert migrations

```bash
npm run migration:revert
```

## Seeding the database

- Make sure before seeding the migrations are run.

```bash
npm run seed
```

## Postman

- Import the postman collection from be/documents/postman.

## Swagger

- http://localhost:4000/api