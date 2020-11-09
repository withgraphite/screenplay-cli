# Shared Routes

This file encodes the routes (along with reified types) for the API and is included (symlinked) by both the API and the client. This isn't ideal b/c code here SHOULD be compiled with its own settings, however for now it works well enough.

Two upgrades we could do are:

1. Make it a proper linked package (like xcodejs); in which case we should probably do the same to retype
2. Have it live in the server and automatically codegen the client (not sure if this is better than the former, but it would at least co-locate them)

However we can punt this down the road until we need it, or until we need retype (which can become its own library)
