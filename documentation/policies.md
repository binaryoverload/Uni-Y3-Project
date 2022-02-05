# Policies

## MVP
- All policies apply to all clients
- Clients store policy IDs and policy item IDs so only new policy items/policies are applied
   - In future versions, a method will be implemented to check whether policy items need to be reapplied if they have changed
- Heartbeats will contain the aforementioned list, so the server only responds to the client with the actions that it needs to do.

## Policy Items
The different types of policy items are as follows:
 - File - Copy a file to the client
 - Command - Run a command on the client
 - Package - Install/Uninstall a package using `apt`

### File Type

For MVP to avoid issues, files will be limited to 1MB

```json
{
   "fileId": "<id>",
   "destination": "/usr/bin/test.txt",
   "permissions": 644
}
```

### Command Type
```json
{
   "command": "/usr/bin/ln",
   "args": "-s",
   "workingDirectory": "/home/blah"
}
```

### Package Type
This command will run an `apt-get -y update` before running `apt-get -y install blah`
```json
{
   "packages": "curl ca-certificates",

}
```