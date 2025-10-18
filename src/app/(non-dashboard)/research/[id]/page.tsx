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
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Research paper not found</div>
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
    <div className="max-w-4xl mx-auto p-6">

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{research.title}</h1>
        
        <div className="flex items-center gap-3 mb-4">
          {research.createdBy.profilePicture && (
            <img
              src={research.createdBy.profilePicture}
              alt={research.createdBy.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{research.createdBy.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(research.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
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
                Download PDF
              </>
            )}
          </button>

          {research.content && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              {showPreview ? 'Hide Preview' : 'Preview PDF'}
            </button>
          )}
        </div>
      </div>


      {showPreview && research.content && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">PDF Preview</h2>
          <div className="border rounded-lg overflow-hidden" style={{ height: '800px' }}>
            <PDFViewer width="100%" height="100%">
              <ResearchPaperPDF research={researchForPDF} />
            </PDFViewer>
          </div>
        </div>
      )}


      {research.thumbnailUrl && (
        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
          <img
            src={research.thumbnailUrl}
            alt={research.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}


      {research.description && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-3">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">
            {research.description}
          </p>
        </div>
      )}


      {research.content && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Content</h2>
          <MarkdownRender content={research.content} />
        </div>
      )}
    </div>
  );
}
