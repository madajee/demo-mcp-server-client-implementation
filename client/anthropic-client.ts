import rl from 'node:readline/promises';
import AnthropicAI from '@anthropic-ai/sdk';
import dotenv from 'dotenv';


console.log('In Anthropic Client'); 
dotenv.config({ path: "../.env" });

class ChatHandler {
    private chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    private aiGreetingText = 'How can I help you today?';
    private model: AnthropicAI;
    private ui: rl.Interface;

    constructor(
          model: AnthropicAI,
          ui: rl.Interface
      ) {
        this.ui = ui;
        this.model = model;
      }
    async processResponse(response: any) {
        this.ui.write(
        JSON.stringify(response) + '\n'
        );
    }
     async handleChat() {
        const prompt = await this.ui.question(this.aiGreetingText + '\n');
        this.chatHistory.push({ role: 'user', content: prompt });
        const result = await this.model.messages.create({
         model: 'claude-opus-4-20250514',
         max_tokens: 1024,
         system:[
            {
            type: "text",
            text: "You are an AI assistant tasked with responding to user with knowledge.\n",
            }
         ],
      messages: this.chatHistory
    });
    console.log(JSON.stringify(result));
    // if (result.usage.length === 0) {
    //   console.log('No response from the assistant.');
    //   return;
    // }
        await this.processResponse("In Process Response");
     }
}

function setupAnthropicAI() {
  const apiKey = process.env.ANTHROPICAI_API_KEY;
  if (!apiKey) {
    throw new Error('OANTHROPICAI_API_KEY environment variable is required.');
  }
  return new AnthropicAI ({ apiKey });
}

async function main() {
    console.log('In Main');
     try {
            const model = setupAnthropicAI();
            const ui = rl.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    });
            const chatHandler = new ChatHandler(model,ui);
            while (true) {
                 await chatHandler.handleChat();
                }
             } catch (error) {
            console.error('Fatal error:', error);
            process.exit(1);
        }
}
main();