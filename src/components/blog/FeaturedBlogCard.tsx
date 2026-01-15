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

interface FeaturedBlogCardProps {
    blog: Blog;
}

const FeaturedBlogCard: React.FC<FeaturedBlogCardProps> = ({ blog }) => {
    return (
        <article className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 mb-12 flex flex-col lg:flex-row min-h-[400px]">
            {/* Image Section */}
            <div className="lg:w-1/2 relative overflow-hidden h-[300px] lg:h-auto">
                <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Featured
                </div>
                {blog.thumbnailUrl ? (
                    <img
                        src={blog.thumbnailUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                )}
                {/* Overlay for better text contrast if needed, mostly for aesthetics on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-medium">
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {calculateReadTime(blog.content)}
                    </span>
                </div>

                <Link href={`/blog/${blog.id}`} className="group-hover:text-blue-700 transition-colors duration-300">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
                        {blog.title}
                    </h2>
                </Link>

                <p className="text-gray-600 text-lg mb-8 line-clamp-3 leading-relaxed">
                    {getExcerpt(blog.content, 250)}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-3">
                        {blog.author.profilePicture ? (
                            <img
                                src={blog.author.profilePicture}
                                alt={blog.author.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {blog.author.name[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{blog.author.name}</p>
                            <p className="text-gray-500 text-xs">Author</p>
                        </div>
                    </div>

                    <Link
                        href={`/blog/${blog.id}`}
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                        Read Article
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default FeaturedBlogCard;
