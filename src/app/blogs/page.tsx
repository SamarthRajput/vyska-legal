/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
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
    }, [page, debouncedSearch, limit]); // Use debouncedSearch instead of search

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Skeleton loader for blog cards
    const BlogSkeleton = () => (
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-100 rounded w-16 ml-2"></div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold mb-6 text-center text-blue-900">All Blogs</h1>
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-8 justify-center">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search blogs..."
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Search
                </button>
            </form>
            {/* Show current search term with cross button */}
            {search && (
                <div className="flex items-center justify-center mb-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full mr-2 text-sm flex items-center">
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
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => <BlogSkeleton key={i} />)}
                </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && !error && blogs.length === 0 && <p className="text-center text-gray-500">No blogs found.</p>}
            {!loading && !error && blogs.length > 0 && (
                <div className="space-y-8">
                    {blogs.map(blog => (
                        <div
                            key={blog.id}
                            className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-3 transition hover:shadow-xl hover:-translate-y-1"
                        >
                            <h2 className="text-2xl font-bold mb-2 text-blue-800">{blog.title}</h2>
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
                                <span className="font-medium text-gray-800" title={blog.author.name}>
                                    {blog.author.name}
                                </span>
                                <span className="text-gray-400 text-xs ml-2">
                                    {new Date(blog.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700 line-clamp-3 mb-2">{blog.content}</p>
                            <a
                                href={`/blogs/${blog.id}`}
                                className="text-blue-600 hover:underline text-sm font-semibold self-end"
                                title="Read more (not implemented)"
                            >
                                Read More &rarr;
                            </a>
                        </div>
                    ))}
                </div>
            )}
            {/* Pagination Controls */}
            {pagination && (
                <div className="flex justify-center items-center gap-4 mt-10">
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-blue-200 disabled:opacity-50 transition"
                        disabled={!pagination.hasPrev}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        &larr; Prev
                    </button>
                    <span className="font-medium text-gray-700 px-3">
                        Page <span className="text-blue-700">{pagination.page}</span> of <span className="text-blue-700">{pagination.totalPages}</span>
                    </span>
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-blue-200 disabled:opacity-50 transition"
                        disabled={!pagination.hasNext}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Next &rarr;
                    </button>
                </div>
            )}
        </div>
    )
}

export default AllBlogs
