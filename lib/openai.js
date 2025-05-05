import axios from 'axios';

const HUGGINGFACE_API_KEY = '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'; // Your Hugging Face API key
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';



export const getChatbotResponse = async (message) => {
  const lowerMessage = message.toLowerCase();

  const greetings = ['hi', 'hello', 'hey', 'hi there', 'hello there'];
  if (greetings.includes(lowerMessage)) {
    return 'Hi there! I’m your friendly WaterChat assistant, ready to help with all things water. How can I assist you today?';
  }
  // Check if the message is water-related
  if (!lowerMessage.includes('water') && !lowerMessage.includes('app') && !lowerMessage.includes('waterchat')) {
    return 'I’m your friendly WaterChat assistant! I’m here to help with water-related questions only. Try asking something like, "How much water should I drink today?"';
  }

  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      {
        inputs: `
          You are a friendly, helpful chatbot for a water-tracking app called WaterChat, designed to assist users with water-related questions in a conversational and engaging way, similar to ChatGPT. Always respond with a warm, positive tone, and provide useful, concise answers. Only answer questions related to water or the WaterChat app. If the question is unrelated, politely redirect the user to water topics.

          User: ${message}
        `,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          return_full_text: false,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data[0].generated_text.trim();
  } catch (error) {
    console.error('Hugging Face API Error:', error.response?.data || error.message);
    return 'Oops, I couldn’t get that for you right now. Let’s try again—ask me anything about water!';
  }
};