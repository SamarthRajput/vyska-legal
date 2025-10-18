"use client";

import React, { useMemo, Suspense, useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Brain, FileText, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  useAIContinuation, 
  useOutlineGeneration, 
  useToneRewrite 
} from "@/lib/ai/hooks";
import type { OutlineItem, ToneType } from "@/lib/ai/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorSectionProps {
  contentMd: string;
  handleContentChange: (value: string) => void;
}

const EditorLoadingSkeleton = () => (
  <div className="space-y-4 p-3 sm:p-4">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton
        key={i}
        className={cn("w-full", i % 2 === 0 ? "h-48 md:h-64 lg:h-80" : "h-6 sm:h-8")}
      />
    ))}
  </div>
);

const EditorHeader = () => (
  <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
      AI-Enhanced Content Editor
    </h2>
    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5 leading-relaxed">
      Write with AI assistance: context-aware continuation, structure analysis, and tone optimization
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
  <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
      <span className="flex items-center gap-1.5">
        <span className="font-medium">Words:</span> 
        <span className="font-semibold text-gray-900 dark:text-gray-100">{wordCount}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="font-medium">Characters:</span> 
        <span className="font-semibold text-gray-900 dark:text-gray-100">{charCount}</span>
      </span>
    </div>
    <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
      Last saved: {new Date().toLocaleTimeString()}
    </div>
  </div>
);

const OutlinePreview = ({ 
  outline, 
  onApplyOutline 
}: { 
  outline: OutlineItem[]; 
  onApplyOutline: () => void;
}) => (
  <Card className="mt-4 border-2 border-blue-100 dark:border-blue-900 shadow-md">
    <CardContent className="p-3 sm:p-4 lg:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <span>Suggested Structure</span>
        </h3>
        <Button 
          size="sm" 
          onClick={onApplyOutline}
          className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
        >
          Apply Structure
        </Button>
      </div>
      <div className="space-y-2 max-h-[250px] sm:max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2">
        {outline.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 sm:p-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span 
              className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words leading-snug"
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                {"#".repeat(item.level)}
              </span> {item.title}
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {item.needsDetail && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                  Detail
                </Badge>
              )}
              {item.needsSources && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                  Sources
                </Badge>
              )}
              {item.needsExamples && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                  Examples
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const EditorSection = ({
  contentMd,
  handleContentChange,
}: EditorSectionProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  
  const { generateContinuation, isLoading: isContinuing, error: continuationError } = useAIContinuation();
  const { generateOutline, outline, showOutline, hideOutline, isLoading: isAnalyzing, error: outlineError } = useOutlineGeneration();
  const { rewriteWithTone, isLoading: isRewriting, error: rewriteError } = useToneRewrite();
  
  const isAnyLoading = isContinuing || isAnalyzing || isRewriting;
  
  const aiError = continuationError || outlineError || rewriteError;

  const contentStats = useMemo(() => {
    const words = contentMd.trim().split(/\s+/).filter((word) => word.length > 0);
    return {
      wordCount: words.length,
      charCount: contentMd.length,
    };
  }, [contentMd]);

  const handleAIContinuation = useCallback(() => {
    generateContinuation(contentMd, (continuation) => {
      handleContentChange(contentMd + continuation);
    });
  }, [contentMd, generateContinuation, handleContentChange]);

  const handleGenerateOutline = useCallback(() => {
    generateOutline(contentMd);
  }, [contentMd, generateOutline]);

  const handleApplyOutline = useCallback(() => {
    const outlineText = outline
      .map(item => `${"#".repeat(item.level)} ${item.title}\n\n`)
      .join('');
    
    handleContentChange(outlineText + '\n' + contentMd);
    hideOutline();
  }, [outline, contentMd, handleContentChange, hideOutline]);

  const handleToneRewrite = useCallback((tone: ToneType) => {
    rewriteWithTone(contentMd, tone, (rewrittenContent) => {
      handleContentChange(rewrittenContent);
    });
  }, [contentMd, rewriteWithTone, handleContentChange]);

  const AIToolbar = () => (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="lg:hidden">
        <button
          onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors active:bg-white/70 dark:active:bg-gray-800/70"
          aria-expanded={isToolbarExpanded}
          aria-label="Toggle AI tools"
        >
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">AI Tools</span>
            {isAnyLoading && (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            )}
          </span>
          {isToolbarExpanded ? (
            <ChevronUp className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          )}
        </button>
        
        {isToolbarExpanded && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 bg-white/30 dark:bg-gray-900/30 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIContinuation}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <Brain className="h-4 w-4 flex-shrink-0" />
              <span>{isContinuing ? "Continuing..." : "AI Continue"}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateOutline}
              disabled={isAnyLoading || !contentMd.trim()}
              className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>{isAnalyzing ? "Analyzing..." : "Structure Analysis"}</span>
            </Button>
            
            <div className="flex items-center gap-2 w-full">
              <Palette className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-1" />
              <Select 
                onValueChange={handleToneRewrite} 
                disabled={isAnyLoading || !contentMd.trim()}
              >
                <SelectTrigger className="flex-1 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Change Tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:flex flex-wrap items-center gap-2 xl:gap-3 p-3 xl:p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAIContinuation}
          disabled={isAnyLoading}
          className="flex items-center gap-2 text-xs xl:text-sm h-9 px-3 xl:px-4"
        >
          <Brain className="h-4 w-4 flex-shrink-0" />
          <span className="hidden xl:inline">
            {isContinuing ? "Continuing..." : "AI Continue"}
          </span>
          <span className="xl:hidden">{isContinuing ? "..." : "Continue"}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateOutline}
          disabled={isAnyLoading || !contentMd.trim()}
          className="flex items-center gap-2 text-xs xl:text-sm h-9 px-3 xl:px-4"
        >
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="hidden xl:inline">
            {isAnalyzing ? "Analyzing..." : "Structure Analysis"}
          </span>
          <span className="xl:hidden">{isAnalyzing ? "..." : "Analyze"}</span>
        </Button>
        
        <Separator orientation="vertical" className="h-6 hidden xl:block" />
        
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select 
            onValueChange={handleToneRewrite} 
            disabled={isAnyLoading || !contentMd.trim()}
          >
            <SelectTrigger className="w-28 xl:w-36 h-9 text-xs xl:text-sm">
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="concise">Concise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isAnyLoading && (
          <div className="ml-auto">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <div className={cn("rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800")}>
        <EditorHeader />
        <AIToolbar />

        <div className="p-3 sm:p-4 lg:p-6">
          <div className="relative">
            <Suspense fallback={<EditorLoadingSkeleton />}>
              <div className={cn("rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden shadow-sm")}>
                <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px]">
                  <MDEditor
                    value={contentMd}
                    onChange={(val) => handleContentChange(val || "")}
                    height="100%"
                    preview='live'
                    className={cn("w-full h-full")}
                    textareaProps={{
                      placeholder: "Start writing your content... Use AI features above to enhance your writing!",
                    }}
                  />
                </div>
              </div>
            </Suspense>
          </div>

          {showOutline && outline.length > 0 && (
            <OutlinePreview 
              outline={outline} 
              onApplyOutline={handleApplyOutline}
            />
          )}

          <EditorFooter {...contentStats} />
        </div>
      </div>

      {aiError && (
        <Alert variant="destructive" className={cn("mt-4 mx-3 sm:mx-0")}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">
            {aiError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
