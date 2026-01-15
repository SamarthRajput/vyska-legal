/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import getExcerpt from '@/lib/getExcerpt';
import { calculateReadTime } from '@/lib/readTime';

interface Author {
    id: string;
    name: string;
    profilePicture: string | null;
}

interface Blog {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    author: Author;
    thumbnailUrl?: string | null;
}

interface BlogCardProps {
    blog: Blog;
    idx?: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, idx = 0 }) => {
    return (
        <article
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1 focus-within:shadow-xl focus-within:border-blue-300 min-h-[380px]"
            tabIndex={0}
            aria-label={`Blog: ${blog.title}`}
            style={{
                animationDelay: `${(idx % 6) * 100}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards',
                opacity: 0
            }}
        >
            {/* Thumbnail Section */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {blog.thumbnailUrl ? (
                    <img
                        src={blog.thumbnailUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 shadow-sm">
                    {calculateReadTime(blog.content)}
                </div>
            </div>

            <div className="p-5 md:p-6 flex flex-col flex-1 gap-3">
                <header>
                    <div className="flex items-center gap-2 mb-3">
                        {blog.author.profilePicture ? (
                            <img
                                src={blog.author.profilePicture}
                                alt={blog.author.name}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm flex-shrink-0">
                                {blog.author.name[0].toUpperCase()}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900 line-clamp-1">{blog.author.name}</span>
                            <span className="text-[10px] text-gray-500">
                                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    <Link href={`/blog/${blog.id}`} className="block group-hover:text-blue-700 transition-colors duration-200">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight line-clamp-2 mb-2">
                            {blog.title}
                        </h2>
                    </Link>
                </header>

                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed flex-1">
                    {getExcerpt(blog.content, 120)}
                </p>

                <footer className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <Link
                        href={`/blog/${blog.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-all hover:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1 -ml-2"
                        aria-label={`Read more about ${blog.title}`}
                    >
                        Read Full Article
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </footer>
            </div>
        </article>
    );
};

export default BlogCard;
