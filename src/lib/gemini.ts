import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateContent(prompt: string): Promise<string> {
  const config = {
    tools: [{ googleSearch: {} }],
  };
  const model = 'gemini-2.5-flash';
  const contents = [
    {
      role: 'user' as const,
      parts: [{ text: prompt }],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let result = '';
  for await (const chunk of response) {
    if (chunk.text) result += chunk.text;
  }
  return result;
}
