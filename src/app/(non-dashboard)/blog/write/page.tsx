'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { EditorSection } from '@/components/BlogEditor'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export default function WriteBlogPage() {
    const { isSignedIn, user } = useUser()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
    const [showTitleOptions, setShowTitleOptions] = useState(false)
    const [titleOptions, setTitleOptions] = useState<string[]>([])

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

    const handleGenerateTitle = async () => {
        setIsGeneratingTitle(true)
        
        try {
            if (!content.trim() && !title.trim()) {
                toast.error('Please write some content or enter a title first')
                return
            }

            const requestBody: { content?: string; currentTitle?: string } = {}
            
            if (content.trim()) {
                requestBody.content = content
            }
            
            if (title.trim()) {
                requestBody.currentTitle = title
            }

            const response = await fetch('/api/ai/generate-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate titles')
            }

            const data = await response.json()
            
            // Get all 3 titles by calling the API 3 times
            const titles: string[] = []
            
            for (let i = 0; i < 3; i++) {
                const res = await fetch('/api/ai/generate-title', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                })
                
                if (res.ok) {
                    const result = await res.json()
                    if (result.title && !titles.includes(result.title)) {
                        titles.push(result.title)
                    }
                }
            }

            if (titles.length === 0) {
                throw new Error('No titles generated')
            }

            setTitleOptions(titles)
            setShowTitleOptions(true)
            toast.success('Generated title suggestions!')
            
        } catch (error) {
            console.error('Title generation error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to generate title')
        } finally {
            setIsGeneratingTitle(false)
        }
    }

    const handleSelectTitle = (selectedTitle: string) => {
        setTitle(selectedTitle)
        setShowTitleOptions(false)
        toast.success('Title applied!')
    }

    const getGenerateTitleButtonText = () => {
        if (title.trim() && content.trim()) {
            return 'Improve Title with AI'
        } else if (title.trim()) {
            return 'Enhance Title'
        } else if (content.trim()) {
            return 'Generate Title from Content'
        }
        return 'Generate Title with AI'
    }

    const getGenerateTitleTooltip = () => {
        if (title.trim() && content.trim()) {
            return 'Generate improved titles based on your current title and content'
        } else if (title.trim()) {
            return 'Generate enhanced variations of your current title'
        } else if (content.trim()) {
            return 'Generate titles based on your content'
        }
        return 'Write some content or enter a title first'
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
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100">Write a Blog</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Share your insights and knowledge. Your submission will be reviewed by the admin before going live.
            </p>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700 dark:text-gray-200">Blog Title</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter blog title"
                            className="flex-1 border rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateTitle}
                            disabled={isGeneratingTitle || (!content.trim() && !title.trim())}
                            className="flex items-center gap-2 whitespace-nowrap"
                            title={getGenerateTitleTooltip()}
                        >
                            {isGeneratingTitle ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    {getGenerateTitleButtonText()}
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {title.trim() && content.trim() 
                            ? 'AI will suggest improved titles based on your title and content'
                            : title.trim()
                            ? 'AI will enhance your current title'
                            : content.trim()
                            ? 'AI will generate titles from your content'
                            : 'Write content or enter a title to use AI title generation'
                        }
                    </p>
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700 dark:text-gray-200">Content</label>
                    <EditorSection contentMd={content} handleContentChange={setContent} />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Blog'}
                </button>

                {message && <p className="text-gray-700 dark:text-gray-300 mt-2 text-center">{message}</p>}
            </form>

            <div className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
                Logged in as: <span className="font-medium">{user?.fullName || user.emailAddresses[0].emailAddress}</span>
            </div>

            {/* Title Options Dialog */}
            <Dialog open={showTitleOptions} onOpenChange={setShowTitleOptions}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                            AI-Generated Title Suggestions
                        </DialogTitle>
                        <DialogDescription>
                            {title.trim() && content.trim()
                                ? 'Based on your current title and content, here are improved suggestions:'
                                : title.trim()
                                ? 'Enhanced variations of your current title:'
                                : 'Generated titles based on your content:'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {titleOptions.map((option, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                                onClick={() => handleSelectTitle(option)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                Option {index + 1}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {option.length} characters
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {option}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSelectTitle(option)
                                        }}
                                    >
                                        Select
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleGenerateTitle}
                            disabled={isGeneratingTitle}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isGeneratingTitle ? 'animate-spin' : ''}`} />
                            Generate New Options
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowTitleOptions(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
