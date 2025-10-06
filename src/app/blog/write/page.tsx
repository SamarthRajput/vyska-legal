'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { EditorSection } from '@/components/BlogEditor'
import { toast } from 'sonner'

export default function WriteBlogPage() {
    const { isSignedIn, user } = useUser()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await fetch('/api/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            })

            if (res.ok) {
                toast.success('Blog submitted successfully! Waiting for admin approval.')
                setMessage('Blog submitted successfully! Waiting for admin approval.')
                setTitle('')
                setContent('')
            } else {
                const data = await res.json()
                toast.error(data.error || data.message || 'Failed to submit blog')
                setMessage(data.error || data.message || 'Failed to submit blog')
            }
        } catch (err) {
            toast.error('Error submitting blog')
            setMessage('Error submitting blog')
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
                    <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Please login to write a blog</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">Sign in to share your insights and contribute to our community.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">Write a Blog</h1>
            <p className="text-gray-600 mb-8">
                Share your insights and knowledge. Your submission will be reviewed by the admin before going live.
            </p>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700 dark:text-gray-200">Blog Title</label>
                    <input
                        type="text"
                        placeholder="Enter blog title"
                        className="border rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <label className="mb-2 font-medium text-gray-700 dark:text-gray-200">Content</label>
                <EditorSection contentMd={content} handleContentChange={setContent} />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Blog'}
                </button>

                {message && <p className="text-gray-700 dark:text-gray-300 mt-2 text-center">{message}</p>}
            </form>

            <div className="mt-6 text-gray-500 text-sm">
                Logged in as: <span className="font-medium">{user?.fullName || user.emailAddresses[0].emailAddress}</span>
            </div>
        </div>
    )
}
