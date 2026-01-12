import type { ContinuationRequest, OutlineRequest, ToneRewriteRequest, ToneType } from './types';

interface TitleRequest {
  content?: string;
  currentTitle?: string;
}

export const createTitlePrompt = ({ content, currentTitle }: TitleRequest): string => {
  if (currentTitle?.trim() && content?.trim()) {
    return `Based on the current title and blog content below, generate 3 improved, engaging, SEO-friendly titles. The new titles should be better than the current one while staying true to the content.

Current Title: "${currentTitle}"

Blog Content:
${content}

Requirements:
- Titles should be between 40-60 characters for optimal SEO
- Make them more catchy and engaging than the current title
- Ensure they accurately reflect the content
- Use action words and power words when appropriate
- Focus on click-worthiness while maintaining accuracy

Return only the 3 improved titles, each on a new line:`;

  } else if (currentTitle?.trim()) {
    return `Improve and enhance the following title to make it more engaging, SEO-friendly, and click-worthy. Generate 3 variations:

Current Title: "${currentTitle}"

Requirements:
- Titles should be between 40-60 characters for optimal SEO
- Make them more catchy and engaging
- Use action words and power words
- Focus on click-worthiness
- Maintain the core meaning of the original title

Return only the 3 improved titles, each on a new line:`;

  } else {
    return `Based on the following blog content, generate 3 engaging, SEO-friendly titles:

${content}

Requirements:
- Titles should be between 40-60 characters for optimal SEO
- Make them catchy and engaging
- Ensure they accurately reflect the content
- Use action words when appropriate

Return only the titles, each on a new line:`;
  }
};


export const createContinuationPrompt = ({
  previousContext,
  currentParagraph,
}: ContinuationRequest): string => {
  return `Continue writing from where the user left off. Here's the context:

Previous context:
${previousContext}

Current paragraph being written:
${currentParagraph}

Instructions:
- Continue naturally from the current paragraph
- Maintain the same tone and style
- Keep the continuation relevant to the context
- Write 2-3 sentences that flow seamlessly
- If the current paragraph seems complete, start a new paragraph

IMPORTANT: Return only the continuation text, no explanations, no markdown formatting, no code blocks.`;
};

export const createOutlinePrompt = ({ content }: OutlineRequest): string => {
  return `Analyze this markdown content and suggest an improved H1-H3 structure. Also identify areas needing more detail, sources, or examples:

Content:
${content}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no markdown code blocks, no explanations
- Do not wrap the response in \`\`\`json or any other formatting
- The response will be parsed directly with JSON.parse()

Return a JSON response with this EXACT structure:
{
  "outline": [
    {
      "level": 1,
      "title": "Header title",
      "needsDetail": true,
      "needsSources": false,
      "needsExamples": true
    }
  ]
}

Guidelines:
- Suggest logical H1-H3 headers based on content
- Mark sections that need more detail, sources, or examples
- Keep titles concise and descriptive
- Ensure proper hierarchy (H1 > H2 > H3)
- level must be 1, 2, or 3
- needsDetail, needsSources, needsExamples must be boolean values

Return only the JSON object, nothing else.`;
};

const TONE_INSTRUCTIONS: Record<ToneType, string> = {
  friendly: "Make the tone warm, conversational, and approachable. Use contractions and casual language where appropriate.",
  professional: "Use formal language, clear structure, and authoritative tone. Avoid contractions and casual expressions.",
  concise: "Make the content more concise and to-the-point. Remove unnecessary words and redundancy while keeping key information."
};

export const createToneRewritePrompt = ({ content, tone }: ToneRewriteRequest): string => {
  return `Rewrite this markdown content with a ${tone} tone:

Original content:
${content}

Instructions:
${TONE_INSTRUCTIONS[tone]}

Requirements:
- Maintain all markdown formatting
- Keep the same structure and headers
- Preserve technical accuracy
- Return only the rewritten content, no explanations, no markdown code blocks`;
};