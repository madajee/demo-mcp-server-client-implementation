console.log('In MCP Server');

import {
  McpServer, ResourceTemplate
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'Demo',
  version: '1.0.0',
});


server.tool(
     'get-weather',
      {
        city: z.string().describe('The name of the city to get the weather for'),
      },
      async ({ city }) => {
         const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
         const data = await response.json();
          // handle city not found
        if (data.results.length === 0) {
        return {
            content: [
            {
                type: 'text',
                text: `City ${city} not found.`,
            }
            ]
        }
        }

        // get the weather data using the coordinates
    const { latitude, longitude } = data.results[0];

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,rain,showers,cloud_cover,apparent_temperature`)

    const weatherData = await weatherResponse.json();

        return {
            content: [
                {
                type: 'text',
                text: JSON.stringify(weatherData['current']['temperature_2m'], null, 2),
                }
            ]
         }
      }
);
server.tool('get-user', 
      {
      },
      async () => {
   const response = await fetch(`https://jsonplaceholder.typicode.com/users/1`);
    const data = await response.json();
    //console.log(data);
     if (data.length === 0) {
        return {
            content: [
            {
                type: 'text',
                text: `Data not found.`,
            }
            ]
        }
        }

        return {
            content: [
                {
                type: 'text',
                text: JSON.stringify(data , null, 2),
                }
            ]
         }
});

// Exposing a tool that manipulates stored data
server.tool(
  'store-knowledge',
  { topic: z.string(), content: z.string() },
  async ({ topic, content }) => {
    try {
      const response = await fetch('http://localhost:8080/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, content }),
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to store knowledge, received response status: ${response.statusText}`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: `Stored: ${topic} - ${content}` }],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to store knowledge, received error: ${error.message}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: `Failed to store knowledge, received error: ${error}`,
          },
        ],
      };
    }
  }
);

// Exposing data to the LLM
server.resource(
  'knowledge-for-topic',
  new ResourceTemplate('knowledge://{topic}', {
    list: async () => {
      try {
        const response = await fetch('http://localhost:8080/knowledge');

        if (!response.ok) {
          return { resources: [] };
        }

        const data = (await response.json()) as string[];

        return {
          resources: data.map((topic) => ({
            uri: `knowledge://${topic}`,
            description: 'A stored piece of knowledge - speficially, stored knowledge about topic: ' + topic,
            name: topic,
          })),
        };
      } catch (error) {
        return { resources: [] };
      }
    },
  }),
  async (uri, { topic }) => {
    try {
      const response = await fetch(
        `http://localhost:8080/knowledge?topic=${topic}`
      );

      if (!response.ok) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Failed to retrieve knowledge for topic: ${topic}, received response status: ${response.statusText}`,
            },
          ],
        };
      }

      const data = await response.json();

      return {
        contents: [
          {
            uri: uri.href,
            text: `Knowledge for topic: ${topic} - ${data.content}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Failed to retrieve knowledge for topic: ${topic}, received error: ${error.message}`,
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            text: `Failed to retrieve knowledge for topic: ${topic}, received error: ${error}`,
          },
        ],
      };
    }
  }
);

server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  { 
    title: "Greeting Resource",      // Display name for UI
    description: "Dynamic greeting generator"
  },
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

const transport = new StdioServerTransport();
//server.connect(transport);
await server.connect(transport);