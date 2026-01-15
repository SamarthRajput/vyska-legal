export const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;

    // Remove markdown symbols to get a more accurate word count
    const cleanContent = content
        .replace(/#+\s/g, "")
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Keep link text
        .replace(/!\[[^\]]*\]\([^\)]+\)/g, ""); // Remove images

    const words = cleanContent.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    return `${minutes} min read`;
};
