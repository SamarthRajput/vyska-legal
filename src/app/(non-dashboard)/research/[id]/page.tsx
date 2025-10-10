'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

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

  const handleDownload = () => {
    window.open(`/api/admin/research/${params.id}/download`, '_blank');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this research paper?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/research/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Research paper deleted successfully');
        router.push('/research');
      } else {
        alert('Failed to delete research paper');
      }
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Failed to delete research paper');
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{research.title}</h1>
        
        <div className="flex items-center gap-3 mb-4">
            {/* Fix this */}
          {/* {research.createdBy.profilePicture && (
            <Image
              src={research.createdBy.profilePicture}
              alt={research.createdBy.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )} */}
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
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </button>

          {isAdmin && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {research.thumbnailUrl && (
        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            {/* Fix this  */}
          {/* <Image
            src={research.thumbnailUrl}
            alt={research.title}
            fill
            className="object-cover"
          /> */}
        </div>
      )}

      {/* Abstract */}
      {research.description && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-3">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">
            {research.description}
          </p>
        </div>
      )}

      {/* Content Preview with Markdown Rendering */}
      {research.content && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Content</h2>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown>{research.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
