'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { pdf } from '@react-pdf/renderer';
import ResearchPaperPDF from '@/components/ResearchPaperPDF';
import MarkdownRender from '@/components/blog/MarkdownRender';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64 sm:h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading PDF preview...</p>
        </div>
      </div>
    ),
  }
);

interface Research {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchResearch();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchResearch = async () => {
    try {
      const response = await fetch(`/api/admin/research/${params.id}`);
      const data = await response.json();
      setResearch(data);
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!research) return;

    if (research.fileUrl) {
      window.open(research.fileUrl, '_blank');
      return;
    }

    if (research.content) {
      setIsDownloading(true);
      try {
        const researchData = {
          title: research.title,
          description: research.description,
          content: research.content,
          createdAt: new Date(research.createdAt),
          createdBy: {
            name: research.createdBy.name,
          },
        };

        const blob = await pdf(<ResearchPaperPDF research={researchData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${research.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading research paper...</p>
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Research paper not found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            The research paper you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/research')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Back to Research
          </button>
        </div>
      </div>
    );
  }

  const researchForPDF = {
    title: research.title,
    description: research.description,
    content: research.content,
    createdAt: new Date(research.createdAt),
    createdBy: {
      name: research.createdBy.name,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 break-words leading-tight">
            {research.title}
          </h1>
          
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            {research.createdBy.profilePicture ? (
              <img
                src={research.createdBy.profilePicture}
                alt={research.createdBy.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                {research.createdBy.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                {research.createdBy.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {new Date(research.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium shadow-sm active:scale-[0.98]"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Generating PDF...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {research.content && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 sm:flex-initial bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium shadow-sm active:scale-[0.98]"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Preview PDF'}</span>
                <span className="sm:hidden">{showPreview ? 'Hide' : 'Preview'}</span>
              </button>
            )}
          </div>
        </div>

        {/* PDF Preview Section */}
        {showPreview && research.content && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              PDF Preview
            </h2>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]">
                <PDFViewer width="100%" height="100%" className="border-0">
                  <ResearchPaperPDF research={researchForPDF} />
                </PDFViewer>
              </div>
            </div>
          </div>
        )}

        {/* Thumbnail Section */}
        {research.thumbnailUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
              <img
                src={research.thumbnailUrl}
                alt={research.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Abstract Section */}
        {research.description && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              Abstract
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {research.description}
            </p>
          </div>
        )}

        {/* Content Section */}
        {research.content && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
              Content
            </h2>
            <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none overflow-x-hidden break-words">
              <MarkdownRender content={research.content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
