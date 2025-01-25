const OpenAI = require('openai');
require('dotenv').config();

// Create an instance of the OpenAI client with the API key from the .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;
