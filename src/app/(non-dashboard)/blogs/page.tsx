/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import getExcerpt from '@/lib/getExcerpt';
import Link from 'next/link';
import React from 'react'

interface Pagination {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
}
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

const AllBlogs = () => {
    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [pagination, setPagination] = React.useState<Pagination | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [page, setPage] = React.useState<number>(1);
    const [limit, setLimit] = React.useState<number>(10);
    const [search, setSearch] = React.useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");

    // Debounce search input
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    // Add search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    React.useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/blogs?page=${page}&limit=${limit}&search=${debouncedSearch}`);
                if (!res.ok) throw new Error('Failed to fetch blogs');
                const data = await res.json();
                setBlogs(data.blogs);
                setPagination(data.pagination);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [page, debouncedSearch, limit]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Skeleton loader for blog cards
    const BlogSkeleton = () => (
        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 animate-pulse min-h-[220px] border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-100 rounded w-16 ml-2"></div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mt-2"></div>
        </div>
    );

    return (
        <main className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex flex-col">
            {/* <div className="h-15"></div> */}
            <header className="text-center py-8 px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2">Explore Our Blogs</h1>
                <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
                    Dive into articles, insights, and stories from our community and experts.
                </p>
                <Link
                    href="/blog/write"
                    className="mt-4 inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Create a new blog"
                >
                    Write a Blog
                </Link>
            </header>
            {/* Search Bar */}
            <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row items-center gap-2 mb-6 max-w-2xl mx-auto w-full px-2"
                role="search"
                aria-label="Search blogs"
            >
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search blogs..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full shadow-sm transition"
                    aria-label="Search input"
                />
                <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Submit search"
                >
                    Search
                </button>
            </form>
            {/* Show current search term with cross button */}
            {search && (
                <div className="flex items-center justify-center mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full mr-2 text-sm flex items-center shadow">
                        <span className="mr-2">Searching for: <b>{search}</b></span>
                        <button
                            type="button"
                            className="ml-1 text-blue-600 hover:text-red-600 font-bold text-lg focus:outline-none"
                            aria-label="Clear search"
                            onClick={() => setSearch("")}
                        >
                            &times;
                        </button>
                    </span>
                </div>
            )}
            {/* Loading Skeletons */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full px-2">
                    {Array.from({ length: 3 }).map((_, i) => <BlogSkeleton key={i} />)}
                </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && !error && blogs.length === 0 && <p className="text-center text-gray-500">No blogs found.</p>}
            {!loading && !error && blogs.length > 0 && (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto w-full px-2">
                    {blogs.map(blog => (
                        <article
                            key={blog.id}
                            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-3 transition hover:shadow-xl hover:-translate-y-1 border border-blue-100 hover:border-blue-300 group focus-within:shadow-lg"
                            tabIndex={0}
                            aria-label={`Blog: ${blog.title}`}
                        >
                            <header>
                                <h2 className="text-xl md:text-2xl font-bold mb-2 text-blue-800 group-hover:underline">{blog.title}</h2>
                                <div className="flex items-center gap-3 mb-2">
                                    {blog.author.profilePicture ? (
                                        <img
                                            src={blog.author.profilePicture}
                                            alt={blog.author.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
                                            title={blog.author.name}
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border-2 border-blue-300"
                                            title={blog.author.name}
                                        >
                                            {blog.author.name[0]}
                                        </div>
                                    )}
                                    <span
                                        className="font-medium text-gray-800"
                                        title={`View all blogs by ${blog.author.name}`}
                                        tabIndex={0}
                                        aria-label={`Author: ${blog.author.name}`}
                                    >
                                        {blog.author.name}
                                    </span>
                                    <span className="text-gray-400 text-xs ml-2" aria-label="Blog date">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </header>
                            <p className="text-gray-700 line-clamp-3 mb-2 transition-all px-1 py-1 text-base">
                                {getExcerpt(blog.content, 300)}
                            </p>
                            <footer className="flex justify-between items-center mt-auto">
                                <Link
                                    href={`/blog/${blog.id}`}
                                    className="text-blue-600 hover:underline text-sm font-semibold transition"
                                    title="Read more"
                                    aria-label={`Read more about ${blog.title}`}
                                >
                                    Read More &rarr;
                                </Link>
                                <span className="text-xs text-gray-400" title={`Last updated: ${new Date(blog.updatedAt).toLocaleString()}`}>
                                    Updated {new Date(blog.updatedAt).toLocaleDateString()}
                                </span>
                            </footer>
                        </article>
                    ))}
                </section>
            )}
            {/* Pagination Controls */}
            {pagination && (
                <nav
                    className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12 w-full px-2 py-4 bg-white/80 border border-blue-100 rounded-xl shadow-sm mx-auto max-w-3xl"
                    aria-label="Pagination"
                >
                    <div className="flex items-center gap-2 text-gray-700 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full shadow-inner">
                        Showing <span className="font-bold text-blue-700">{(pagination.page - 1) * limit + 1}</span>
                        -
                        <span className="font-bold text-blue-700">{Math.min(pagination.page * limit, pagination.totalCount)}</span>
                        of <span className="font-bold text-blue-700">{pagination.totalCount}</span> blogs
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 disabled:opacity-40 transition font-medium shadow-sm focus:ring-2 focus:ring-blue-300"
                            disabled={!pagination.hasPrev}
                            onClick={() => handlePageChange(page - 1)}
                            aria-label="Previous page"
                        >
                            &larr; Prev
                        </button>
                        {/* Page numbers */}
                        <span className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition border
                                        ${pagination.page === i + 1
                                            ? "bg-blue-600 text-white border-blue-600 shadow"
                                            : "bg-white text-blue-700 border-blue-200 hover:bg-blue-100"}
                                    `}
                                    aria-current={pagination.page === i + 1 ? "page" : undefined}
                                    aria-label={`Go to page ${i + 1}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </span>
                        <button
                            className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 disabled:opacity-40 transition font-medium shadow-sm focus:ring-2 focus:ring-blue-300"
                            disabled={!pagination.hasNext}
                            onClick={() => handlePageChange(page + 1)}
                            aria-label="Next page"
                        >
                            Next &rarr;
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="limit-select" className="text-gray-600 text-sm font-medium">
                            Blogs per page:
                        </label>
                        <select
                            id="limit-select"
                            value={limit}
                            onChange={e => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                            aria-label="Select number of blogs per page"
                        >
                            {[5, 10, 15, 20, 25].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </nav>
            )}
            {/* Mobile Create Blog Button */}
            <div className="fixed bottom-6 right-6 z-50 md:hidden">
                <Link
                    href="/blog/write"
                    className="bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Create a new blog"
                    title="Create Blog"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </Link>
            </div>
        </main>
    )
}

export default AllBlogs
