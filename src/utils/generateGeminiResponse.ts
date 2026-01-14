import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
}

class GeminiClient {
    private static instance: GoogleGenAI;

    private constructor() { }

    public static getInstance(): GoogleGenAI {
        if (!GeminiClient.instance) {
            GeminiClient.instance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        return GeminiClient.instance;
    }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateGeminiResponse = async (prompt: string): Promise<string> => {
    let lastError: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const ai = GeminiClient.getInstance();
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                });

                const text = response.text;
                
                if (!text) {
                throw new Error("No text generated in response");
                }
                return text;
        } catch (error) {
            lastError = error;
            console.warn(`Gemini API attempt ${attempt} failed:`, error);
            if (attempt < MAX_RETRIES) {
                // Exponential backoff
                await sleep(RETRY_DELAY * Math.pow(2, attempt - 1));
            }
        }
    }

    throw new Error(`Failed to generate content after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
};