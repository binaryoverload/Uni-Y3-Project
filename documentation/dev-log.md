# Developer Log

## Week 1 - w/c 22nd Nov
- Implemented basic Node.JS Express app.
- Created basic routes and error-handling.
- Established using [JSend](https://github.com/omniti-labs/jsend) as a standard for API responses.
- Using reference code from previous Java app, implemented JWT authentication (Minus interface with the database).
- Created JWT Authentication middleware to ensure protected routes can only be accessed with bearer token authentication.
- Learnt how to use `express-validator` to validate API input, created middleware to validate `/auth` responses.

## Week 2 - w/c 29th Nov
- Begun planning database entities.
- Modify logging to make request logging consistent with other messages.
- Change validation to a middleware to make writing routes more consistent.
- Create Flyway DB migrations toolkit.
- Setup PG backend
- Create initial DB migration for users, properties and enrolment tokens
- Add user routes and modify auth routes to use DB
- Add password hashing using argon2
- Add models and validation for system properties, enrolment tokens and users

## Week 3 - w/c 6th December
- Add endpoints for system properties, enrolment tokens and users
- Add more enhanced express middleware and error handling
- Start encryption spec for client/server communication
- Add SQL for policies

## Week 4 - w/c 13th December
- Add SQL for clients
- Add models for policies and clients
- Add handling for foreign key constraints
- Document security libs
- Create Golang project for client

## Week 5 - w/c 20th December - Christmas Week 🎄
- 