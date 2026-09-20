import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Preferred high-throughput, quota-friendly model
export const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
export const SECONDARY_MODEL = 'gemini-3.8-flash';

export async function generateContentWithRetry(
  ai: GoogleGenAI,
  options: any,
  maxRetries = 3
) {
  let currentModel = options.model === 'gemini-3.8-flash' ? PRIMARY_MODEL : (options.model || PRIMARY_MODEL);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        ...options,
        model: currentModel,
      });
    } catch (err: any) {
      const msg = err.message || '';
      const isRateOrUnavailable =
        msg.includes('429') ||
        msg.includes('503') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('UNAVAILABLE') ||
        err.status === 429 ||
        err.status === 503;

      if (isRateOrUnavailable && attempt < maxRetries) {
        // Toggle model between lite and 3.8 on rate limits
        currentModel = currentModel === PRIMARY_MODEL ? SECONDARY_MODEL : PRIMARY_MODEL;
        const delay = attempt * 800;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}
