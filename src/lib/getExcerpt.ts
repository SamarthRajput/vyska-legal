const stripMarkdown = (markdown: string) => {
    // Remove code blocks, inline code, images, links, emphasis, headings, blockquotes, lists, etc.
    return markdown
        .replace(/`{3}[\s\S]*?`{3}/g, '') // code blocks
        .replace(/`[^`]*`/g, '') // inline code
        .replace(/!\[.*?\]\(.*?\)/g, '') // images
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
        .replace(/[*_~#>`-]/g, '') // markdown symbols
        .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
        .replace(/^\s*[-*+]\s+/gm, '') // bullet lists
        .replace(/^\s*>+\s?/gm, '') // blockquotes
        .replace(/\s+/g, ' ') // extra whitespace
        // headings,bold,italic, strikethrough
        .replace(/^(#{1,6})\s+/gm, '') // headings
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
        .replace(/(\*|_)(.*?)\1/g, '$2') // italic
        .replace(/~~(.*?)~~/g, '$1') // strikethrough
        .trim();
};

const getExcerpt = (content: string, wordCount: number = 20) => {
    const plainText = stripMarkdown(content);
    const words = plainText.split(/\s+/).filter(Boolean);
    return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
};

export default getExcerpt;