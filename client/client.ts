import rl from 'node:readline/promises';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: "../.env" });
console.log('In Client'); 
class ChatHandler {
    private chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    private aiGreetingText = 'How can I help you today?';
    private model: OpenAI;
    private ui: rl.Interface;
    constructor(
      model: OpenAI,
      ui: rl.Interface
  ) {
    this.model = model;
    this.ui = ui;
  }
  async processResponse(response: any) {
     this.ui.write(
      this.chatHistory[this.chatHistory.length - 1]?.content + '\n'
    );
  }
  async handleChat() {
     if (this.chatHistory.length > 0) {
      const { output_text } = await this.model.responses.create({
        model: 'gpt-4o-mini',
        instructions:
          'Based on the provided history, derive a friendly answer or summary (if any of that is needed) or follow-up question.',
        input: this.chatHistory.slice(-3),
      });
      this.aiGreetingText = output_text;
    }
    const prompt = await this.ui.question(this.aiGreetingText + '\n');
    this.chatHistory.push({ role: 'user', content: prompt });
    const result = await this.model.responses.create({
      model: 'gpt-4o-mini',
      instructions:
        'You are a helpful, friendly assistant. You can use knowledge-related tools to find information on specific topics or store new knowledge.',
      input: this.chatHistory
    });
    if (result.output.length === 0) {
      console.log('No response from the assistant.');
      return;
    }
    await this.processResponse(result.output[0]);
  }
}
function setupOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required.');
  }
  return new OpenAI({ apiKey });
}
async function main() {
    //console.log('In Main');
     try {
        const ui = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        });
        const model = setupOpenAI();
        const chatHandler = new ChatHandler(model, ui);
        while (true) {
         await chatHandler.handleChat();
        }
     } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}
main();