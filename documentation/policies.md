# Policies

## MVP
- All policies apply to all clients
- Clients store policy IDs and policy item IDs so only new policy items/policies are applied
   - In future versions, a method will be implemented to check whether policy items need to be reapplied if they have changed
- Heartbeats will contain the aforementioned list, so the server only responds to the client with the actions that it needs to do.