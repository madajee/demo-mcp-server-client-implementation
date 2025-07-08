import rl from 'node:readline/promises';
//import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';
dotenv.config({ path: "../.env" });
console.log('In Gemini Client'); 

class ChatHandler {
    //private chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    private aiGreetingText = 'How can I help you today?';
    private conversationContext: { role: 'user' | 'model'; content: string }[] = [];
    private currentMessages: { role: 'user' | 'model'; parts: [{text:string}] }[]  = [];
    private model: GoogleGenerativeAI;
    private ui: rl.Interface;
    constructor(
      model: GoogleGenerativeAI,
      ui: rl.Interface
  ) {
    this.model = model;
    this.ui = ui;
  }
  async processResponse(response: any) {
    this.ui.write(
      JSON.stringify(response) + '\n'
    );
  }

    // async handleChat() {
    // const MODEL_NAME = "gemini-2.0-flash";
    // const prompt = await this.ui.question(this.aiGreetingText + '\n');
    // const model = this.model.getGenerativeModel({ model: MODEL_NAME });
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const text = response.text(); 
    // if (text .length === 0) {
    //   console.log('No response from the assistant.');
    //   return;
    // }
    // await this.processResponse(text) ;
    // }
   
    async handleChat() {
    const MODEL_NAME = "gemini-2.0-flash";
    //const conversationContext: { role: 'user' | 'model'; content: string }[] = [];
    //const currentMessages: { role: 'user' | 'model'; parts: [{text:string}] }[]  = [];
    // Restore the previous context
    for (const chatcontext of this.conversationContext) {
      this.currentMessages.push({ role: chatcontext.role, parts: [{text: chatcontext.content}] });
    }
    const prompt = await this.ui.question(this.aiGreetingText + '\n');
    const model = this.model.getGenerativeModel({ model: MODEL_NAME });
    //const result = await model.generateContent(prompt);
    //console.log("history" + JSON.stringify(this.currentMessages));
    //console.log("prompt" + JSON.stringify(prompt));
    const chat = model.startChat({
      history: this.currentMessages,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text(); 
    if (text .length === 0) {
      console.log('No response from the assistant.');
      return;
    }
    // Stores the conversation
    this.conversationContext.push({ role: "user", content: prompt });
    this.conversationContext.push({ role: "model", content: text });
    await this.processResponse(text) ;
    }
}



function setupGoogleGenAI() {
  const apiKey = process.env.GOOGLEGENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLEGENAI_API_KEY environment variable is required.');
  }
  return new GoogleGenerativeAI(apiKey);
}

async function main() {
    console.log('In Gemini Main');
 try {
    const model = setupGoogleGenAI();
    const ui = rl.createInterface({
            input: process.stdin,
            output: process.stdout,
            });
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