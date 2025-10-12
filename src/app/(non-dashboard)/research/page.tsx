'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Research {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

export default function ResearchListPage() {
  const [research, setResearch] = useState<Research[]>([]);
  console.log(research);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    try {
      const response = await fetch('/api/admin/research');
      const data = await response.json();
      setResearch(data);
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Research Papers</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {research.map((paper) => (
          <Link
            key={paper.id}
            href={`/research/${paper.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
          >
            {paper.thumbnailUrl ? (
              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-900">
                <img
                  src={paper.thumbnailUrl}
                  alt={paper.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-6xl">📄</span>
              </div>
            )}

            <div className="p-4">
              <h2 className="text-xl font-bold mb-2 line-clamp-2 dark:text-gray-100">
                {paper.title}
              </h2>
              
              {paper.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                  {paper.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {paper.createdBy.profilePicture && (
                  <img
                    src={paper.createdBy.profilePicture}
                    alt={paper.createdBy.name}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 object-cover"
                  />
                )}
                <span>{paper.createdBy.name}</span>
                <span>•</span>
                <span>
                  {new Date(paper.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {research.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No research papers yet</p>
        </div>
      )}
    </div>
  );
}
