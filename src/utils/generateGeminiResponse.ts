import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
}

class GeminiClient {
    private static instance: GoogleGenerativeAI;

    private constructor() { }

    public static getInstance(): GoogleGenerativeAI {
        if (!GeminiClient.instance) {
            GeminiClient.instance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
            const genAI = GeminiClient.getInstance();
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
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