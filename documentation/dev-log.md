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