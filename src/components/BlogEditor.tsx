"use client";

import React, { useMemo, Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";


const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorSectionProps {
    contentMd: string;
    handleContentChange: (value: string) => void;
}

const EditorLoadingSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
            <Skeleton
                key={i}
                className={cn("w-full", i % 2 === 0 ? "h-64" : "h-8")}
            />
        ))}
    </div>
);

const EditorHeader = () => (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        {/* <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Content Editor
        </h2> */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Write and edit your content below.
        </p>
    </div>
);

const EditorFooter = ({
    wordCount,
    charCount,
}: {
    wordCount: number;
    charCount: number;
}) => (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
                <span className="font-medium mr-1">Words:</span> {wordCount}
            </span>
            <span className="flex items-center">
                <span className="font-medium mr-1">Characters:</span> {charCount}
            </span>
        </div>
        <div className="mt-2 sm:mt-0">
            <span className="text-xs text-gray-400">
                Last saved: {new Date().toLocaleTimeString()}
            </span>
        </div>
    </div>
);

export const EditorSection = ({
    contentMd,
    handleContentChange,
}: EditorSectionProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const contentStats = useMemo(() => {
        const words = contentMd.trim().split(/\s+/).filter((word) => word.length > 0);
        return {
            wordCount: words.length,
            charCount: contentMd.length,
        };
    }, [contentMd]);


    return (
        <div className="relative">
            <div className={cn("rounded-lg shadow-md transition-all")}>
                <EditorHeader />

                <div className="p-4">
                    <div className="relative min-h-[400px]">
                        <Suspense fallback={<EditorLoadingSkeleton />}>
                            <div className={cn("rounded-md border")}>
                                <MDEditor
                                    value={contentMd}
                                    onChange={(val) => handleContentChange(val || "")}
                                    height={400}
                                    preview='live'
                                    className={cn("editor-wrapper")}
                                    textareaProps={{
                                        placeholder: "Start writing your content..."
                                    }}
                                />
                            </div>
                        </Suspense>
                    </div>

                    <EditorFooter {...contentStats} />
                </div>
            </div>
        </div>
    );
};
