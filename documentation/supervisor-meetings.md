# Supervisor Meetings

## Week 8 - w/c 29th Nov
- Demoed basic API and webpage
- Discussed risk management
  - What technologies will be used? Is there any "risk" associated?
  - What is the minimum viable product?
    - Discussed that most things on the Gantt chart are considered vital.
    - One of the only things that could be "sacrificed" is making the front-end design perfect. Although arguably, user experience is a key part of this project.
- Mentioned that Gantt chart will need reordering
  - DB needs to be done before API endpoints - API tends to mirror DB with entity creation/modification
  - Authentication system has already mostly been completed (Minus integration with DB) due to Frontend already being written on old Java backend. Authentication is core to the application and will be useful to test features as going along.
- Talked through how different parts of the system shall work:
  - Communication with clients: Clients shall contact the server. Not vice versa. Reason being is that clients contacting the server is a more highly scalable architecture and also allows the server to not need to know about the clients network configuration which might not be static.
  - Login system: Login system is plainly for the web dashboard and API. When a user logs in successfully, they receive an access token and refresh token. The access token has a much shorter expiry to protect against MITM attacks. The refresh token is only sent to the server when the client needs a new access token while the access token is sent for every API request.