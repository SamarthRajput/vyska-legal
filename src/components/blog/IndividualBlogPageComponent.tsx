"use client";

import React from 'react';
import Link from 'next/link';
import getExcerpt from '@/lib/getExcerpt';
import MarkdownRender from './MarkdownRender';
import ShareButtons from '../ShareButtons';
import BlogSkeleton from './BlogSkeleton';
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
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: Author;
}

const IndividualBlogPageComponent = ({ id }: { id: string }) => {
  const [blog, setBlog] = React.useState<Blog | null>(null);
  const [relevantBlogs, setRelevantBlogs] = React.useState<Blog[]>([]);
  const [recentBlogs, setRecentBlogs] = React.useState<Blog[]>([]);
  const [nextBlog, setNextBlog] = React.useState<{ id: string; title: string } | null>(null);
  const [prevBlog, setPrevBlog] = React.useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const response = await fetch(`/api/blogs/${id}`);
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setBlog(data.blog);
        setRelevantBlogs(data.relevantBlogs);
        setRecentBlogs(data.recentBlogs);
        setNextBlog(data.nextBlog);
        setPrevBlog(data.previousBlog);
      } catch (error) {
        // console.error("Error fetching blog:", error);
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
    return <BlogSkeleton />;
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h2>
          <p className="text-gray-600 mb-8">
            The article you are looking for might have been removed, renamed, or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              Go Back
            </button>
            <Link
              href="/blogs"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  const blogUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/blog/${blog.id}`;

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
            {blog.thumbnailUrl && (
              <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={blog.thumbnailUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-2xl">
                    {blog.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex items-center space-x-4">
                      <img
                        src={blog.author.profilePicture || "/default-profile.avif"}
                        alt={blog.author.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white shadow-lg object-cover"
                      />
                      <div>
                        <div className="text-base md:text-lg font-semibold">
                          {blog.author.name}
                        </div>
                        <div className="text-xs md:text-sm text-gray-200 flex items-center gap-2">
                          <span>
                            {new Date(blog.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>{calculateReadTime(blog.content)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 sm:mt-0">
                      <ShareButtons
                        title={blog.title}
                        url={blogUrl}
                        excerpt={getExcerpt(blog.content, 18)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blog Content - Without Thumbnail Fallback */}
            {!blog.thumbnailUrl && (
              <div className="p-6 md:p-8 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 leading-tight">
                      {blog.title}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <img
                        src={blog.author.profilePicture || "/default-profile.avif"}
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
                          <span className="mx-2">•</span>
                          {calculateReadTime(blog.content)}
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
                  <div className="mt-3 md:mt-0 md:ml-4">
                    <ShareButtons
                      title={blog.title}
                      url={blogUrl}
                      excerpt={getExcerpt(blog.content, 18)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="p-6 md:p-10 lg:p-12">
              <div className="prose prose-base md:prose-lg prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
                <MarkdownRender content={blog.content} />
              </div>

              {/* Navigation Links */}
              <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                {prevBlog ? (
                  <Link href={`/blog/${prevBlog.id}`} className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all flex flex-col items-start text-left">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover:text-blue-600">Previous Article</span>
                    <span className="font-medium text-gray-800 group-hover:text-blue-900 line-clamp-2">{prevBlog.title}</span>
                  </Link>
                ) : (<div></div>)}

                {nextBlog ? (
                  <Link href={`/blog/${nextBlog.id}`} className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all flex flex-col items-end text-right">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover:text-blue-600">Next Article</span>
                    <span className="font-medium text-gray-800 group-hover:text-blue-900 line-clamp-2">{nextBlog.title}</span>
                  </Link>
                ) : (<div></div>)}
              </div>
            </div>
          </article>
        </div>

        {/* Sticky Share Bar (Desktop - Right Side) */}
        <div className="hidden lg:flex fixed top-1/2 right-0 z-50 transform -translate-y-1/2 flex-col items-end group">
          {/* Visible Tab (Always shown) */}
          <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-y border-l border-blue-100 rounded-l-xl p-3 cursor-pointer transition-all duration-300 hover:bg-blue-50 group-hover:translate-x-[100%] absolute right-0 top-1/2 -translate-y-1/2 z-50 group-hover:opacity-0 pointer-events-auto">
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
                Share
              </span>
            </div>
          </div>

          {/* Content Panel (Slides out) */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl border-y border-l border-gray-100 rounded-l-2xl p-4 flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-out translate-x-[120%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 relative z-40">
            <ShareButtons title={blog.title} url={blogUrl} orientation="vertical" />
          </div>
        </div>

        {/* Sticky Share Bar (Mobile - Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-gray-200 lg:hidden z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">Share this article:</span>
            <ShareButtons title={blog.title} url={blogUrl} />
          </div>
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

export default IndividualBlogPageComponent;