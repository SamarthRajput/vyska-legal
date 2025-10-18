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

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [search]);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const BlogSkeleton = () => (
        <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 flex flex-col gap-3 animate-pulse min-h-[280px] border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
            </div>
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-11/12"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mt-auto"></div>
        </div>
    );

    const getPageNumbers = () => {
        if (!pagination) return [];
        const { totalPages, page: currentPage } = pagination;
        const pages: (number | string)[] = [];
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            if (currentPage > 3) {
                pages.push('...');
            }
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            
            pages.push(totalPages);
        }
        
        return pages;
    };

    return (
        <main className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
            <header className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-12 md:py-16 lg:py-20 px-4 mb-8 md:mb-12">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-4 tracking-tight">
                        Explore Our Blogs
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-6 md:mb-8 text-blue-50 leading-relaxed px-4">
                        Dive into articles, insights, and stories from our community and experts
                    </p>
                    <Link
                        href="/blog/write"
                        className="hidden md:inline-flex items-center gap-2 bg-white text-blue-700 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
                        aria-label="Create a new blog"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Write a Blog
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex flex-col sm:flex-row items-center gap-3 mb-6 md:mb-8 w-full max-w-3xl mx-auto"
                    role="search"
                    aria-label="Search blogs"
                >
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search blogs by title, content, or author..."
                            className="w-full px-5 py-3 md:py-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-300 transition-all text-sm md:text-base"
                            aria-label="Search input"
                        />
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm md:text-base"
                        aria-label="Submit search"
                    >
                        Search
                    </button>
                </form>

                {search && (
                    <div className="flex items-center justify-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm md:text-base shadow-sm border border-blue-200">
                            <span>Searching for: <strong className="font-semibold">{search}</strong></span>
                            <button
                                type="button"
                                className="ml-1 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                                aria-label="Clear search"
                                onClick={() => setSearch("")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    </div>
                )}

                {!loading && pagination && blogs.length > 0 && (
                    <div className="text-center mb-6 md:mb-8">
                        <p className="text-gray-600 text-sm md:text-base">
                            Showing <span className="font-semibold text-blue-700">{(pagination.page - 1) * limit + 1}</span>
                            {' '}-{' '}
                            <span className="font-semibold text-blue-700">{Math.min(pagination.page * limit, pagination.totalCount)}</span>
                            {' '}of{' '}
                            <span className="font-semibold text-blue-700">{pagination.totalCount}</span> blogs
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12">
                        {Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => (
                            <BlogSkeleton key={i} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-center py-12 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && blogs.length === 0 && (
                    <div className="text-center py-16 md:py-24 px-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">No blogs found</h3>
                        <p className="text-gray-600 mb-6 text-base md:text-lg">
                            {search ? `No results for "${search}". Try a different search term.` : "Be the first to create a blog post!"}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && blogs.length > 0 && (
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12">
                        {blogs.map((blog, index) => (
                            <article
                                key={blog.id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-5 md:p-6 flex flex-col gap-3 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1 focus-within:shadow-xl focus-within:border-blue-300 min-h-[280px]"
                                tabIndex={0}
                                aria-label={`Blog: ${blog.title}`}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'fadeInUp 0.5s ease-out forwards'
                                }}
                            >
                                <header>
                                    <Link href={`/blog/${blog.id}`}>
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 leading-tight">
                                            {blog.title}
                                        </h2>
                                    </Link>
                                    
                                    <div className="flex items-center gap-3 mb-3">
                                        {blog.author.profilePicture ? (
                                            <img
                                                src={blog.author.profilePicture}
                                                alt={blog.author.name}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 flex-shrink-0"
                                                title={blog.author.name}
                                            />
                                        ) : (
                                            <div
                                                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base border-2 border-blue-200 flex-shrink-0"
                                                title={blog.author.name}
                                            >
                                                {blog.author.name[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 text-sm md:text-base truncate">
                                                {blog.author.name}
                                            </p>
                                            <p className="text-gray-500 text-xs md:text-sm">
                                                {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </header>

                                <p className="text-gray-600 text-sm md:text-base line-clamp-3 leading-relaxed flex-1">
                                    {getExcerpt(blog.content, 150)}
                                </p>

                                <footer className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                    <Link
                                        href={`/blog/${blog.id}`}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm md:text-base font-semibold transition-all hover:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1"
                                        aria-label={`Read more about ${blog.title}`}
                                    >
                                        Read More
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </footer>
                            </article>
                        ))}
                    </section>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <nav
                        className="flex flex-col gap-6 mt-8 md:mt-12 w-full"
                        aria-label="Pagination"
                    >
                        <div className="flex sm:hidden items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-md border border-gray-100">
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium shadow-sm focus:ring-2 focus:ring-blue-300 disabled:hover:bg-blue-600"
                                disabled={!pagination.hasPrev}
                                onClick={() => handlePageChange(page - 1)}
                                aria-label="Previous page"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Prev
                            </button>
                            
                            <span className="text-sm font-medium text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium shadow-sm focus:ring-2 focus:ring-blue-300 disabled:hover:bg-blue-600"
                                disabled={!pagination.hasNext}
                                onClick={() => handlePageChange(page + 1)}
                                aria-label="Next page"
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="hidden sm:flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <label htmlFor="limit-select" className="text-gray-700 text-sm font-medium whitespace-nowrap">
                                    Blogs per page:
                                </label>
                                <select
                                    id="limit-select"
                                    value={limit}
                                    onChange={e => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-gray-300 transition-all cursor-pointer"
                                    aria-label="Select number of blogs per page"
                                >
                                    {[5, 10, 15, 20, 25].map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-300 disabled:hover:bg-blue-600"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => handlePageChange(page - 1)}
                                    aria-label="Previous page"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="hidden md:inline">Previous</span>
                                </button>

                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((pageNum, idx) => (
                                        pageNum === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">
                                                ⋯
                                            </span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum as number)}
                                                className={`min-w-[2.5rem] h-10 rounded-lg flex items-center justify-center font-semibold transition-all border-2
                                                    ${pagination.page === pageNum
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                                                        : "bg-white text-blue-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300"}
                                                `}
                                                aria-current={pagination.page === pageNum ? "page" : undefined}
                                                aria-label={`Go to page ${pageNum}`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-300 disabled:hover:bg-blue-600"
                                    disabled={!pagination.hasNext}
                                    onClick={() => handlePageChange(page + 1)}
                                    aria-label="Next page"
                                >
                                    <span className="hidden md:inline">Next</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </nav>
                )}
            </div>

            <Link
                href="/blog/write"
                className="fixed bottom-6 right-6 z-50 md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl p-4 flex items-center justify-center hover:shadow-3xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400 group"
                aria-label="Create a new blog"
                title="Create Blog"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </Link>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </main>
    )
}

export default AllBlogs
