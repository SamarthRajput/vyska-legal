'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TitleInputSectionProps {
    title: string;
    setTitle: (title: string) => void;
    content: string;
}

export default function TitleInputSection({ title, setTitle, content }: TitleInputSectionProps) {
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [showTitleOptions, setShowTitleOptions] = useState(false);
    const [titleOptions, setTitleOptions] = useState<string[]>([]);

    const handleGenerateTitle = async () => {
        setIsGeneratingTitle(true);
        
        try {
            if (!content.trim() && !title.trim()) {
                toast.error('Please write some content or enter a title first');
                return;
            }

            const requestBody: { content?: string; currentTitle?: string } = {};
            
            if (content.trim()) {
                requestBody.content = content;
            }
            
            if (title.trim()) {
                requestBody.currentTitle = title;
            }

            const response = await fetch('/api/ai/generate-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate titles');
            }

            const titles: string[] = [];
            
            for (let i = 0; i < 3; i++) {
                const res = await fetch('/api/ai/generate-title', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
                
                if (res.ok) {
                    const result = await res.json();
                    if (result.title && !titles.includes(result.title)) {
                        titles.push(result.title);
                    }
                }
            }

            if (titles.length === 0) {
                throw new Error('No titles generated');
            }

            setTitleOptions(titles);
            setShowTitleOptions(true);
            toast.success('Generated title suggestions!');
            
        } catch (error) {
            console.error('Title generation error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate title');
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleSelectTitle = (selectedTitle: string) => {
        setTitle(selectedTitle);
        setShowTitleOptions(false);
        toast.success('Title applied!');
    };

    const getGenerateTitleButtonText = () => {
        if (title.trim() && content.trim()) {
            return { full: 'Improve Title with AI', short: 'Improve' };
        } else if (title.trim()) {
            return { full: 'Enhance Title', short: 'Enhance' };
        } else if (content.trim()) {
            return { full: 'Generate Title from Content', short: 'Generate' };
        }
        return { full: 'Generate Title with AI', short: 'Generate' };
    };

    const getGenerateTitleTooltip = () => {
        if (title.trim() && content.trim()) {
            return 'Generate improved titles based on your current title and content';
        } else if (title.trim()) {
            return 'Generate enhanced variations of your current title';
        } else if (content.trim()) {
            return 'Generate titles based on your content';
        }
        return 'Write some content or enter a title first';
    };

    const buttonText = getGenerateTitleButtonText();

    return (
        <>
            <div className="flex flex-col w-full">
                <label className="mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
                    Blog Title
                </label>
                
                <div className="flex flex-col sm:hidden gap-2">
                    <input
                        type="text"
                        placeholder="Enter blog title"
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateTitle}
                        disabled={isGeneratingTitle || (!content.trim() && !title.trim())}
                        className="w-full flex items-center justify-center gap-2 h-11 text-sm"
                        title={getGenerateTitleTooltip()}
                    >
                        {isGeneratingTitle ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 flex-shrink-0" />
                                <span>{buttonText.short}</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="hidden sm:flex gap-2 lg:gap-3">
                    <input
                        type="text"
                        placeholder="Enter blog title"
                        className="flex-1 border rounded-lg p-3 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateTitle}
                        disabled={isGeneratingTitle || (!content.trim() && !title.trim())}
                        className="flex items-center gap-2 whitespace-nowrap text-sm md:text-base px-3 md:px-4 lg:px-6"
                        title={getGenerateTitleTooltip()}
                    >
                        {isGeneratingTitle ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                                <span className="hidden md:inline">Generating...</span>
                                <span className="md:hidden">...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 flex-shrink-0" />
                                <span className="hidden lg:inline">{buttonText.full}</span>
                                <span className="hidden md:inline lg:hidden">{buttonText.short}</span>
                            </>
                        )}
                    </Button>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
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

            <Dialog open={showTitleOptions} onOpenChange={setShowTitleOptions}>
                <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-lg sm:rounded-xl">
                    <DialogHeader className="space-y-2 sm:space-y-3">
                        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                            <span className="leading-tight">AI-Generated Title Suggestions</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm leading-relaxed">
                            {title.trim() && content.trim()
                                ? 'Based on your current title and content, here are improved suggestions:'
                                : title.trim()
                                ? 'Enhanced variations of your current title:'
                                : 'Generated titles based on your content:'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                        {titleOptions.map((option, index) => (
                            <div
                                key={index}
                                className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all active:scale-[0.98] group"
                                onClick={() => handleSelectTitle(option)}
                            >
                                <div className="flex items-start justify-between gap-2 sm:gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                Option {index + 1}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {option.length} chars
                                            </span>
                                        </div>
                                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 leading-snug break-words">
                                            {option}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectTitle(option);
                                        }}
                                    >
                                        Select
                                    </Button>
                                    <div className="sm:hidden flex-shrink-0 text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="outline"
                            onClick={handleGenerateTitle}
                            disabled={isGeneratingTitle}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <RefreshCw className={`h-4 w-4 flex-shrink-0 ${isGeneratingTitle ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Generate New Options</span>
                            <span className="sm:hidden">Regenerate</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowTitleOptions(false)}
                            className="w-full sm:w-auto text-sm sm:text-base"
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
