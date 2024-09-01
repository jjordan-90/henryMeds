## Henry Meds Backend Exercise
Overview
This API provides endpoints for managing appointment scheduling, including provider availability submission, appointment slot retrieval, appointment reservation, and appointment confirmation.

** When testing the API, in order to bypass the auth mechanism, the Request headers MUST contain an Authorization key/value pair. The value doesn't matter, so long as it is present. I created mock data with the providerId: 1234, which should be used when submitting time slots. In order to test the expiration of reservations that are not confirmed within the time slot, the server must remain running for the entire 30 minutes. **


Design Choices
Technology Stack
Express.js: Used for building the RESTful API due to its minimalistic and flexible nature.
TypeScript: Chosen for its static typing, which helps catch errors early and improves code maintainability.
Date Management: The Javascript Date object was used for speed of delivery, but a library like date-fns should be used in a production environment as time-zones might be an issue.

Endpoints
POST /appointments 
Allows providers to submit their available slots. Validates input to ensure proper slot format and consistency.

GET /appointments/{providerId} 
Retrieves available slots for a given provider. Pagination parameters are required in query params. Having default pagination values enable clients to write buggy code (skip and top or using a key and length, etc). I added optional start and end date parameters in case a client wanted to search for a specific slot.

POST /appointments/{appointmentId}/reservations 
Clients can reserve an appointment slot. Includes logic to handle slot availability and reservation timing. When an appointment is reserved a timer is started with the expiration limit. If the reservation is not confirmed within the limit the reservation status is changed to expired.

PUT /reservations/{reservationId}/confirm 
Clients confirm their reservation, transitioning the appointment to a confirmed state.

Data Handling
In-Memory Storage: For simplicity and ease of development, in-memory storage is used. This approach will be replaced with a database in a production environment for persistent storage.

Expiration Handling 
Reservations expire after 30 minutes if not confirmed. This is managed by the node-schedule package. This would most likely be an area of improvement for a production deployment.

Error Handling
Due to time constraints I did not create any custom exceptions. In a production environment there would be specific exceptions for each scenario encountered. The global error handler is also woefully under-developed - this would be much more robust in production.

Validation
Basic input validation is performed to ensure that appointment slots and reservations are in a valid format. More rigorous validation will be necessary in a production environment.

Production Environment Considerations
Database Integration: Replace in-memory storage with a relational or NoSQL database to ensure data persistence and scalability. 

Data Schemas
I created a few DTOs, however in practice we would want both requests and responses mapped out. These would also be present in the openapi spec, again, didn't have time to write them all out.

Concurrency Handling
In a production environment, we would use database transactions or locks to handle simultaneous reservation attempts and ensure data consistency. I didn't have time to implement this. 

We would want to use an Etag/If-Match scheme to prevent the lost update problem - thinking specifically if a provider updates a slot and a client reserves a slot at the same time. I didn't have time to implement this.

We would also want to use idempotency keys as POST requests aren't idempotent and we don't want duplicate reservations made or slots created. I didn't have time to create this either.

Error Handling and Logging
I would implement a more robust error-handling strategy with custom error classes and middleware, as already mentioned. Additionally I would integrate logging for monitoring and debugging purposes (Winston or another logging library).

Security
Due to time constraints, I created a very simple mock auth middleware. I am assuming the production environment has an auth service in use. I would imagine the clientId and providerId would be available via the auth context, so wouldn't even need to be provided as arguments. Although it may be beneficial to have the explicitness of providing them as arguments.

I would implement authentication (e.g., JWT) to secure API endpoints and authorize user access based on roles (providers vs. clients). We also want to ensure sensitive information is protected and encrypted, and follow best practices for data security.


Scalability and Performance
We would implement caching strategies to reduce load on the database and improve performance for frequently accessed data. We would want to make sure that our queries are properly indexed. Additionally we would use load balancers to distribute traffic across multiple server instances to ensure high availability and reliability.

Testing
While I have a few Jest unit tests that cover the business logic, we would want to develop testing suites that provide complete coverage. We would also use SuperTest or something similar to test our endpoints. 

API Documentation
I set up a basic API documentation with swagger, but this would be built out more. OpenAPI validator should be integrated as well.

