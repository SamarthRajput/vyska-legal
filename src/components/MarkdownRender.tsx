import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRender = ({ content }: { content: string }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6 scroll-mt-20">
                    {children}
                </h1>
            ),
            h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-slate-800 mt-10 mb-5 scroll-mt-20">
                    {children}
                </h2>
            ),
            h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-4 scroll-mt-20">
                    {children}
                </h3>
            ),
            p: ({ children }) => (
                <p className="mb-6 text-slate-700 leading-relaxed text-lg">
                    {children}
                </p>
            ),
            a: ({ href, children }) => (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                >
                    {children}
                </a>
            ),
            blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-8 bg-blue-50 rounded-r-lg">
                    <div className="text-slate-700 italic text-lg">{children}</div>
                </blockquote>
            ),
            code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                    return (
                        <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono">
                            {children}
                        </code>
                    );
                }
                return (
                    <div className="my-6 rounded-lg overflow-x-auto">
                        <code className="block bg-slate-900 text-slate-100 p-6 text-sm leading-relaxed min-w-[400px]">
                            {children}
                        </code>
                    </div>
                );
            },
            ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 my-6 text-slate-700">
                    {children}
                </ul>
            ),
            ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 my-6 text-slate-700">
                    {children}
                </ol>
            ),
            img: ({ src, alt }) => (
                <div className="my-8">
                    <img
                        src={src}
                        alt={alt}
                        className="w-full rounded-lg shadow-md"
                    />
                    {alt && (
                        <p className="text-center text-sm text-slate-500 mt-2 italic">
                            {alt}
                        </p>
                    )}
                </div>
            ),
            hr: () => <hr className="my-8 border-slate-200" />,
        }}
    >
        {content}
    </ReactMarkdown>
);

export default MarkdownRender;