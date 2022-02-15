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
- Document package structure
- Implement TCP server on backend

## Week 6 - w/c 27th December
- Improve backend logging format
- Backend: Implement TCP encryption, packet decoding and packet encoding.

## Week 7 - w/c 3rd January
- Client: Implement configuration and encryption
- Setup TCP client on the Client application
- Added TCP decoding to the client.
- Created a design for front-end listing pages and navigation
- Implemented design using Tailwind CSS, Nuxt.JS and Vue.JS

# Week 8 - w/c 10th January
- Frontend: Create users and policies table components
- Client: Create packet handling and TCP flow

# Week 9 - w/c 17th January
- Backend: Improve database error handling and schema
- Client: Add ability for client to register with server
- Client: Add heart-beating between client and backend
- Client: Add OS information collector and include this in heartbeats
- Frontend: Add authentication middleware
- Frontend: Edit styles to be more responsive 
- Frontend: Add navigation buttons
- Frontend: Search filter on tables and format dates

# Week 11 - w/c 31st January
- Frontend: Request data from backend, Add action buttons to tables, create frontend
- Document policy structure
- Client: Add storage for policy item
- Client: Add evaluation for command and package policy types

# Week 12 - w/c 7th February
- Backend: Send policies in heart-beats
- Client: Parse policies from heart-beats, store policies in a map instead of list for de-duplication and only evaluate policies which haven't been applied to the client.
