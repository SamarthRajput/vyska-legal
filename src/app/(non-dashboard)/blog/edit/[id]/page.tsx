'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import TitleInputSection from '@/components/blog/TitleInputSection'
import { toast } from 'sonner'
import ThumbnailSection from '@/components/blog/Thumbnail'
import { EditorSection } from '@/components/blog/BlogEditor'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Blog {
    id: string;
    title: string;
    content: string;
    thumbnailUrl: string | null;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function EditBlogPage() {
    const { isSignedIn, user } = useUser();
    const params = useParams()
    const router = useRouter()
    const blogId = params.id as string

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [message, setMessage] = useState('')
    const [blog, setBlog] = useState<Blog | null>(null)

    useEffect(() => {
        const fetchBlog = async () => {
            setFetching(true)
            try {
                const res = await fetch(`/api/blog/${blogId}`)
                
                if (res.ok) {
                    const data = await res.json()
                    setBlog(data)
                    setTitle(data.title)
                    setContent(data.content)
                    setThumbnailUrl(data.thumbnailUrl)
                } else {
                    const errorData = await res.json()
                    toast.error(errorData.error || 'Failed to fetch blog')
                    router.push('/blogs')
                }
            } catch (err) {
                toast.error('Error fetching blog')
                router.push('/blogs')
            } finally {
                setFetching(false)
            }
        }

        if (blogId && isSignedIn) {
            fetchBlog()
        }
    }, [blogId, isSignedIn, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await fetch(`/api/blog/${blogId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    thumbnailUrl,
                }),
            })

            if (res.ok) {
                toast.success('Blog updated successfully!')
                setMessage('Blog updated successfully!')
                
                setTimeout(() => {
                    router.push('/user/blogs')
                }, 1000)
            } else {
                const data = await res.json()
                toast.error(data.error || data.message || 'Failed to update blog')
                setMessage(data.error || data.message || 'Failed to update blog')
            }
        } catch (err) {
            toast.error('Error updating blog')
            setMessage('Error updating blog')
        } finally {
            setLoading(false)
        }
    }

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-8 py-10 flex flex-col items-center">
                    <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8zm6 8a6 6 0 10-12 0v2a2 2 0 002 2h8a2 2 0 002-2v-2z" />
                    </svg>
                    <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                        Please login to edit blogs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Sign in to manage your blog posts.
                    </p>
                </div>
            </div>
        )
    }

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-6 sm:py-12 px-4">
            {/* fix the link */}

            <Link 
                href="/blogs"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to My Blogs
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">
                        Edit Blog
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                        Update your blog post. {blog?.status === 'APPROVED' && 'Changes will need admin approval.'}
                    </p>
                </div>
                
                {blog && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            blog.status === 'APPROVED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : blog.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : blog.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                            {blog.status}
                        </span>
                    </div>
                )}
            </div>

            {blog?.rejectionReason && blog.status === 'REJECTED' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason:
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {blog.rejectionReason}
                    </p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <TitleInputSection 
                    title={title}
                    setTitle={setTitle}
                    content={content}
                />

                <ThumbnailSection 
                    thumbnailUrl={thumbnailUrl}
                    setThumbnailUrl={setThumbnailUrl}
                />

                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700 dark:text-gray-200">
                        Content
                    </label>
                    <EditorSection contentMd={content} handleContentChange={setContent} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Update Blog
                            </>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => router.push('/blogs/my-blogs')}
                        className="flex-1 sm:flex-initial bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>

                {message && (
                    <p className={`text-center mt-2 ${
                        message.includes('success') 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        {message}
                    </p>
                )}
            </form>

            <div className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
                Logged in as: <span className="font-medium">
                    {user?.fullName || user?.emailAddresses[0].emailAddress}
                </span>
            </div>
        </div>
    )
}
