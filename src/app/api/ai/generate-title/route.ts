import { generateGeminiResponse } from '@/utils/generateGeminiResponse';
import { createTitlePrompt } from '@/lib/ai/prompt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { content, currentTitle } = await req.json();

        if (!content?.trim() && !currentTitle?.trim()) {
            return NextResponse.json(
                { error: 'Either content or current title is required' },
                { status: 400 }
            );
        }

        const prompt = createTitlePrompt({ content, currentTitle });

        const response = await generateGeminiResponse(prompt);
        const titles = response.split('\n').filter(title => title.trim());

        const selectedTitle = titles[Math.floor(Math.random() * titles.length)] || titles[0];

        return NextResponse.json({
            title: selectedTitle.replace(/^\d+\.\s*/, '').trim()
        });

    } catch (error) {
        console.error('Error generating title:', error);
        return NextResponse.json(
            { error: 'Failed to generate title' },
            { status: 500 }
        );
    }
}