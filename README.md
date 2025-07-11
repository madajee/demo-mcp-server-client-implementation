# demo-mcp-server-client-implementation
Base Version for this learning exercise is https://github.com/mschwarzmueller/demo-mcp-server-client-implementation/.


# Example MCP Server + Client Implementation

# Service
cd service  | npm install | npm run start:service
open http://localhost:8080/ should display "Hello from Express with TypeScript!".

# Client
cd client | npm install | npm run start:client
It should start the chat session in the terminal.

# Server
cd server | npm install | npx tsc (This will create a server.js file in the dist folder which is used in the client to establish an MCP connection between server and client).


# Testing
1. Open 2 terminal windows | Start the chat session as client in one window | Start the service as an express serverice app

2. Try with utterance: "Write a one-sentence bedtime story about a unicorn."  and you should see a response from OpenAI LLM in the terminal window.

3. Try with utterance: How is the weather in Chicago. 
It should call a get-weather tool listed in the MCP server.

4. Try with utterance: Get the user. 
It should call a get-user tool listed in the MCP server.

5. Added @modelcontextprotocol/inspector to the server.
Go to service folder and npm run start:service
Go to server folder and npm run debug 
Tools: get-weather, get-user, store-knowledge
Existing DB file is populated with MCP-Resource, MCP-Tool resources created with store-knowledge tool.
Resource Templates: Knowledge-for-topic, greeting
Resources: MCP-Resource, MCP-Tool


# Useful Links
1. https://platform.openai.com/docs/guides/text?api-mode=responses
2. https://ai.google.dev/gemini-api/docs/text-generation
3. https://www.rootstrap.com/blog/how-to-use-google-gemini-with-node-js-and-typescript


