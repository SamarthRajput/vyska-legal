"use client";
import React from 'react'
import Link from 'next/link';
import getExcerpt from '@/lib/getExcerpt';
import MarkdownRender from './MarkdownRender';

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
}

const IndividualBlogPageClient = ({ id }: { id: string }) => {
    const [blog, setBlog] = React.useState<Blog | null>(null);
    const [relevantBlogs, setRelevantBlogs] = React.useState<Blog[]>([]);
    const [recentBlogs, setRecentBlogs] = React.useState<Blog[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/blogs/${id}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setBlog(data.blog);
                setRelevantBlogs(data.relevantBlogs);
                setRecentBlogs(data.recentBlogs);
            } catch (error) {
                console.error("Error fetching blog:", error);
                setError("Failed to fetch blog");
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    const buildQuery = (type: 'recent' | 'relevant') => {
        if (type === 'recent') return '?sort=recent';
        if (type === 'relevant') return `?relevantTo=${id}`;
        return '';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-base text-gray-600">Loading article...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="text-red-600 text-xl font-semibold mb-1">Oops!</div>
                <div className="text-gray-700 text-base">{error}</div>
                <button
                    className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-600 text-base">No blog found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-8 px-2">
            {/* Breadcrumb */}
            <nav className="max-w-3xl mx-auto mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-xs text-gray-500">
                    <li>
                        <Link href="/" className="hover:underline text-blue-700 font-medium">Home</Link>
                        <span className="mx-1">/</span>
                    </li>
                    <li>
                        <Link href="/blogs" className="hover:underline text-blue-700 font-medium">Blogs</Link>
                        <span className="mx-1">/</span>
                    </li>
                    <li className="text-gray-700 font-medium truncate max-w-[120px]" title={id}>
                        {id}
                    </li>
                </ol>
            </nav>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
                {/* Main Blog Content */}
                <div className="flex-1">
                    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 leading-snug">{blog.title}</h1>
                        <div className="flex items-center mb-6">
                            <img
                                src={blog.author.profilePicture || "/default-profile.png"}
                                alt={blog.author.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm mr-4"
                            />
                            <div>
                                <div className="text-base font-semibold text-blue-800">{blog.author.name}</div>
                                <div className="text-xs text-gray-500">
                                    Published on <span className="font-medium">{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    {blog.updatedAt !== blog.createdAt && (
                                        <span className="ml-2 text-gray-400">(Updated {new Date(blog.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })})</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <article className="prose prose-base max-w-none text-gray-800 leading-normal">
                            <div className="prose prose-lg prose-slate max-w-none py-8">
                                <MarkdownRender content={blog.content} />
                            </div>
                        </article>
                    </div>
                </div>
                {/* Sidebar */}
                <aside className="w-full md:w-80 flex-shrink-0 space-y-6">
                    {/* Recent Posts */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-lg font-semibold mb-3 text-blue-800">Recent Posts</h2>
                        <ul className="space-y-2">
                            {recentBlogs.slice(0, 5).map((b) => (
                                <li key={b.id}>
                                    <Link href={`/blog/${b.id}`} className="block group">
                                        <div className="p-2 rounded transition bg-gray-50 group-hover:bg-blue-50 border border-gray-100">
                                            <div className="font-medium text-blue-900 group-hover:underline truncate">{b.title}</div>
                                            <div className="text-xs text-gray-600 mt-0.5 italic truncate">
                                                {getExcerpt(b.content, 12)}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {recentBlogs.length > 5 && (
                            <Link
                                href={`/blogs${buildQuery('recent')}`}
                                className="mt-2 inline-block text-xs text-blue-700 hover:underline font-medium"
                            >
                                View More
                            </Link>
                        )}
                    </div>
                    {/* Posts You May Like */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-lg font-semibold mb-3 text-blue-800">Posts You May Like</h2>
                        <ul className="space-y-2">
                            {relevantBlogs.slice(0, 5).map((b) => (
                                <li key={b.id}>
                                    <Link href={`/blog/${b.id}`} className="block group">
                                        <div className="p-2 rounded transition bg-gray-50 group-hover:bg-blue-50 border border-gray-100">
                                            <div className="font-medium text-blue-900 group-hover:underline truncate">{b.title}</div>
                                            <div className="text-xs text-gray-600 mt-0.5 italic truncate">
                                                {getExcerpt(b.content, 12)}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {relevantBlogs.length > 5 && (
                            <Link
                                href={`/blogs${buildQuery('relevant')}`}
                                className="mt-2 inline-block text-xs text-blue-700 hover:underline font-medium"
                            >
                                View More
                            </Link>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default IndividualBlogPageClient;