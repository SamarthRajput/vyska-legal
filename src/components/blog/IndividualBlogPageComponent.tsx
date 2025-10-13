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
    thumbnailUrl?: string | null;
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
                console.log(data);
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
        <div className="min-h-screen bg-gray-50 py-8 px-2">
            {/* Breadcrumb */}
            <nav className="max-w-6xl mx-auto mb-6 px-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm text-gray-500">
                    <li>
                        <Link href="/" className="hover:underline text-blue-700 font-medium">Home</Link>
                        <span className="mx-1">/</span>
                    </li>
                    <li>
                        <Link href="/blogs" className="hover:underline text-blue-700 font-medium">Blogs</Link>
                        <span className="mx-1">/</span>
                    </li>
                    <li className="text-gray-700 font-medium truncate max-w-[200px]" title={blog.title}>
                        {blog.title}
                    </li>
                </ol>
            </nav>

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-4">
                {/* Main Blog Content */}
                <div className="flex-1">
                    <article className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
                        {/* Hero Thumbnail Image */}
                        {blog.thumbnailUrl && (
                            <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                <img
                                    src={blog.thumbnailUrl}
                                    alt={blog.title}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                
                                {/* Title Overlay on Image */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10">
                                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-2xl">
                                        {blog.title}
                                    </h1>
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={blog.author.profilePicture || "/default-profile.png"}
                                            alt={blog.author.name}
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white shadow-lg object-cover"
                                        />
                                        <div>
                                            <div className="text-base md:text-lg font-semibold">
                                                {blog.author.name}
                                            </div>
                                            <div className="text-xs md:text-sm text-gray-200">
                                                {new Date(blog.createdAt).toLocaleDateString(undefined, { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blog Content - Without Thumbnail Fallback */}
                        {!blog.thumbnailUrl && (
                            <div className="p-6 md:p-8 border-b border-gray-200">
                                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                                    {blog.title}
                                </h1>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={blog.author.profilePicture || "/default-profile.png"}
                                        alt={blog.author.name}
                                        className="w-14 h-14 rounded-full border-2 border-gray-200 shadow-md object-cover"
                                    />
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {blog.author.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Published on {new Date(blog.createdAt).toLocaleDateString(undefined, { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                            {blog.updatedAt !== blog.createdAt && (
                                                <span className="ml-2 text-gray-400">
                                                    (Updated {new Date(blog.updatedAt).toLocaleDateString(undefined, { 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="p-6 md:p-10 lg:p-12">
                            <div className="prose prose-base md:prose-lg prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
                                <MarkdownRender content={blog.content} />
                            </div>
                        </div>
                    </article>
                </div>

                {/* Sidebar */}
                <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
                    {/* Recent Posts */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Posts
                        </h2>
                        <ul className="space-y-3">
                            {recentBlogs.slice(0, 5).map((b) => (
                                <li key={b.id}>
                                    <Link href={`/blog/${b.id}`} className="block group">
                                        <div className="flex gap-3 p-3 rounded-lg transition bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200">
                                            {b.thumbnailUrl && (
                                                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                                                    <img
                                                        src={b.thumbnailUrl}
                                                        alt={b.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 line-clamp-2 mb-1">
                                                    {b.title}
                                                </div>
                                                <div className="text-xs text-gray-500 line-clamp-2">
                                                    {getExcerpt(b.content, 10)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {recentBlogs.length > 5 && (
                            <Link
                                href={`/blogs${buildQuery('recent')}`}
                                className="mt-4 inline-flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium"
                            >
                                View all recent posts
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Posts You May Like */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            You May Like
                        </h2>
                        <ul className="space-y-3">
                            {relevantBlogs.slice(0, 5).map((b) => (
                                <li key={b.id}>
                                    <Link href={`/blog/${b.id}`} className="block group">
                                        <div className="flex gap-3 p-3 rounded-lg transition bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200">
                                            {b.thumbnailUrl && (
                                                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                                                    <img
                                                        src={b.thumbnailUrl}
                                                        alt={b.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 line-clamp-2 mb-1">
                                                    {b.title}
                                                </div>
                                                <div className="text-xs text-gray-500 line-clamp-2">
                                                    {getExcerpt(b.content, 10)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {relevantBlogs.length > 5 && (
                            <Link
                                href={`/blogs${buildQuery('relevant')}`}
                                className="mt-4 inline-flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium"
                            >
                                View more suggestions
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default IndividualBlogPageClient;
