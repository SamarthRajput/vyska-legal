'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EditorSection } from '@/components/blog/BlogEditor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import TitleInputSection from '@/components/blog/TitleInputSection';

export default function CreateResearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [mode, setMode] = useState<'write' | 'upload'>('write');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();
      
      if (!data.isAdmin) {
        router.push('/');
        return;
      }
      
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      
      if (mode === 'write') {
        data.append('content', formData.content);
      } else if (file) {
        data.append('file', file);
      }
      
      if (thumbnail) {
        data.append('thumbnail', thumbnail);
      }

      const response = await fetch('/api/admin/research', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create research paper');
      }

      const result = await response.json();
      toast.success('Research paper created successfully!');
      router.push(`/research/${result.id}`);
    } catch (error: unknown) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create research paper'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
        Create Research Paper
      </h1>

      {/* Mode Toggle */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setMode('write')}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
            mode === 'write'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✍️ Write Paper
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
            mode === 'upload'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📤 Upload PDF
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <TitleInputSection
          title={formData.title}
          setTitle={(newTitle) => setFormData({ ...formData, title: newTitle })}
          content={formData.content}
        />

        <div>
          <label className="block text-sm font-semibold mb-2">
            Abstract <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={5}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Write a brief abstract summarizing your research paper (200-300 words recommended)..."
          />
        </div>

        {mode === 'write' ? (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Paper Content <span className="text-red-500">*</span>
            </label>
            <EditorSection
              contentMd={formData.content}
              handleContentChange={handleContentChange}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              💡 Tip: Use Markdown formatting for headers (# ## ###), bold (**text**), 
              italic (*text*), lists, and code blocks
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Upload PDF <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="pdf-upload"
                required={mode === 'upload'}
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {file ? (
                  <span className="text-blue-600 font-medium text-sm sm:text-base break-all px-2">
                    {file.name}
                  </span>
                ) : (
                  <>
                    <span className="text-gray-600 font-medium text-sm sm:text-base">
                      Click to upload PDF
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm mt-1">
                      or drag and drop
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2">
            Thumbnail Image <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm sm:text-base"
          />
          {thumbnail && (
            <p className="text-xs sm:text-sm text-green-600 mt-2 break-all">
              ✓ {thumbnail.name} selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="hidden sm:inline">Creating Research Paper...</span>
              <span className="sm:hidden">Creating...</span>
            </span>
          ) : (
            <span>
              <span className="hidden sm:inline">📝 Publish Research Paper</span>
              <span className="sm:hidden">📝 Publish Paper</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
