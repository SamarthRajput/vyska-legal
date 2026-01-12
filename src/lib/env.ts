import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
    CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
    // Optional but recommended for admin security
    ADMIN_EMAILS: z.string().optional().default(""),
    // URLs
    NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
});

// Validate `process.env` and throw an error if invalid
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
