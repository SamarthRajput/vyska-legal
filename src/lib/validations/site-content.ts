import { z } from "zod";

export const heroSlideSchema = z.object({
    title: z.string().min(1, "Title is required"),
    highlight: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    imageUrl: z.string().min(1, "Image URL is required"),
    order: z.number().int().default(0),
    type: z.string().default('split'),
    bgColor: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const testimonialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    caseType: z.string().min(1, "Case type is required"),
    message: z.string().min(1, "Testimonial message is required"),
    imageUrl: z.string().optional(),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const faqSchema = z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const companyInfoSchema = z.object({
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone number is required"),
    whatsapp: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    instagramUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    twitterUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    facebookUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    yearsExperience: z.string().optional(),
    successRate: z.string().optional(),
    trustedClients: z.string().optional(),
    casesWon: z.string().optional(),

    // Extra Fields
    headOffice: z.string().optional(),
    mapUrl: z.string().url("Invalid Map URL").optional().or(z.literal('')),
    disclaimerMessage: z.string().optional(),
    disclaimerPoints: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
});
