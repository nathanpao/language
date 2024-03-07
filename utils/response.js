const { GoogleGenerativeAI } = require("@google/generative-ai");
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.GEMINI_API_KEY;

async function botResponse(msg, room) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const chat = model.startChat({
    history: [],
  });
  const result = await chat.sendMessage(`Respond in English. 
  The message is "${msg}". 
  Provide English-to-${room} translations 
  for all English words in the message. For all English words, provide a 
  full definition of the word in ${room}.`);
  const response = await result.response;
  const stringResponse = response.text();
  return JSON.stringify(stringResponse)
}

module.exports = botResponse;