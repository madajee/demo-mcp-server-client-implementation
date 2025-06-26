import rl from 'node:readline/promises';
console.log('In Client');
class ChatHandler {
    private chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    private aiGreetingText = 'How can I help you today?';
    private ui: rl.Interface;
    constructor(
    ui: rl.Interface
  ) {
    this.ui = ui;
  }
  async processResponse(response: any) {
    // this.ui.write(
    //   this.chatHistory[this.chatHistory.length - 1]?.content + '\n'
    // );
     this.ui.write(
      this.chatHistory[this.chatHistory.length - 1]?.content + " " + response + '\n'
    );
  }
  async handleChat() {
    //console.log('In Chat Handler');
    const prompt = await this.ui.question(this.aiGreetingText + '\n');
    this.chatHistory.push({ role: 'user', content: prompt });
    await this.processResponse('Hello MCP');
  }
}
async function main() {
    //console.log('In Main');
     try {
        const ui = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        });
        const chatHandler = new ChatHandler(ui);
        while (true) {
         await chatHandler.handleChat();
        }
     } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}
main();