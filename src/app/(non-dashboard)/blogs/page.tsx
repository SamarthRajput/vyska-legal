/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import FeaturedBlogCard from '@/components/blog/FeaturedBlogCard';
import BlogCard from '@/components/blog/BlogCard';
import BlogSearch from '@/components/blog/BlogSearch';

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

interface UserProfile {
    canWriteBlog: boolean;
}

const AllBlogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [canWriteBlog, setCanWriteBlog] = useState<boolean>(false);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await fetch('/api/user/me');
                if (!res.ok) throw new Error('Failed to fetch user profile');
                const data: UserProfile = await res.json();
                setCanWriteBlog(data.canWriteBlog ?? false);
            } catch (_error) {
                setCanWriteBlog(false);
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
            setBlogs([]);
            setHasMore(true);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const limit = 9;
                const res = await fetch(`/api/blogs?page=${page}&limit=${limit}&search=${debouncedSearch}`);
                if (!res.ok) throw new Error('Failed to fetch blogs');
                const data = await res.json();

                setBlogs(prev => {
                    if (page === 1) return data.blogs;
                    return [...prev, ...data.blogs];
                });

                if (data.blogs.length < limit) {
                    setHasMore(false);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [page, debouncedSearch]);

    // Infinite Scroll Observer
    const lastBlogElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleClearSearch = () => {
        setSearch("");
    };

    // Derived state for display
    const showHero = page === 1 && !debouncedSearch && blogs.length > 0;

    const heroBlog = showHero ? blogs[0] : null;
    const gridBlogs = showHero ? blogs.slice(1) : blogs;

    const BlogSkeleton = () => (
        <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 flex flex-col gap-3 min-h-[380px] border border-gray-100 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg w-full mb-4"></div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <div className="flex-col gap-1 w-full">
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
            <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            </div>
        </div>
    );

    return (
        <main className="bg-gradient-to-br from-blue-50 via-white to-indogo-50 min-h-screen pb-20">
            <header className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-12 md:py-16 lg:py-20 px-4 mb-8 md:mb-12">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-4 tracking-tight">
                        Explore Our Blogs
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-6 md:mb-8 text-blue-50 leading-relaxed px-4">
                        Dive into articles, insights, and stories from our community and experts
                    </p>
                    {canWriteBlog && (
                        <Link
                            href="/blog/write"
                            className="hidden md:inline-flex items-center gap-2 bg-white text-blue-700 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Write a Blog
                        </Link>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BlogSearch
                    search={search}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearchSubmit}
                    onClearSearch={handleClearSearch}
                />

                {/* Hero Section */}
                {heroBlog && (
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <FeaturedBlogCard blog={heroBlog} />
                    </div>
                )}

                {/* Blog Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
                    {gridBlogs.map((blog, index) => {
                        if (index === gridBlogs.length - 1) {
                            return (
                                <div key={blog.id} ref={lastBlogElementRef}>
                                    <BlogCard blog={blog} idx={index} />
                                </div>
                            );
                        } else {
                            return <BlogCard key={blog.id} blog={blog} idx={index} />;
                        }
                    })}

                    {/* Skeletons for loading state */}
                    {loading && Array.from({ length: 3 }).map((_, i) => (
                        <BlogSkeleton key={`skeleton-${i}`} />
                    ))}
                </section>

                {!loading && blogs.length === 0 && (
                    <div className="text-center py-16 md:py-24 px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No blogs found</h3>
                        <p className="text-gray-500">
                            {debouncedSearch ? `No results matching "${debouncedSearch}"` : "Check back later for new content!"}
                        </p>
                    </div>
                )}

                {!hasMore && blogs.length > 0 && !loading && (
                    <div className="mt-16 mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-blue-100 shadow-sm max-w-3xl mx-auto relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-200/50 transition-colors duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 group-hover:bg-indigo-200/50 transition-colors duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 rotate-3 group-hover:rotate-6 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">You've viewed all recent articles</h3>
                                <p className="text-gray-600 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                                    Looking for more in-depth knowledge? Explore our collection of detailed research papers and legal studies.
                                </p>

                                <Link
                                    href="/research"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200"
                                >
                                    Explore Research Papers
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Link
                href="/blog/write"
                className={`fixed bottom-6 right-6 z-50 md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl p-4 flex items-center justify-center hover:shadow-3xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400 group ${!canWriteBlog ? 'hidden' : ''}`}
                aria-label="Create a new blog"
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
    );
};

export default AllBlogs;
