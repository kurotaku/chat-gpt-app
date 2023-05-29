import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function openaiCompletion(totalPrompts: any, messagesArray: any) {
  try {
    const completion = await openai.createChatCompletion({
      // model: 'gpt-4',
      model: 'gpt-3.5-turbo',
      messages: [...totalPrompts, ...messagesArray],
    });

    return completion;
  } catch (error) {
    throw error;
  }
}
