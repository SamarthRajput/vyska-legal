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

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <div className="relative w-full h-48 sm:h-56 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="h-10 sm:h-12 bg-white/20 rounded-lg w-64 sm:w-80 animate-pulse" />
            <div className="h-5 bg-white/20 rounded w-48 sm:w-64 mt-4 animate-pulse" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Header Section */}
      <header className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                Research Papers
              </h1>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                Explore cutting-edge research and academic publications from our community
              </p>
            </div>
            <div className="flex items-center gap-3 text-white/90 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">{research.length}</span>
                <span className="hidden sm:inline">Papers</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        {/* Research Grid */}
        {research.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {research.map((paper, index) => (
              <Link
                key={paper.id}
                href={`/research/${paper.id}`}
                className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-gray-800 flex flex-col"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 sm:h-56 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  {paper.thumbnailUrl ? (
                    <img
                      src={paper.thumbnailUrl}
                      alt={paper.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/5" />
                      <span className="text-6xl sm:text-7xl relative z-10 group-hover:scale-110 transition-transform duration-500">📄</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {paper.title}
                  </h2>
                  
                  {paper.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed flex-1">
                      {paper.description}
                    </p>
                  )}

                  {/* Author Info */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    {paper.createdBy.profilePicture ? (
                      <img
                        src={paper.createdBy.profilePicture}
                        alt={paper.createdBy.name}
                        className="rounded-full w-8 h-8 sm:w-9 sm:h-9 object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {paper.createdBy.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {paper.createdBy.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {new Date(paper.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Read More Arrow */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold group-hover:gap-2 transition-all">
                    <span>Read Paper</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 sm:py-20 lg:py-24 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
              No Research Papers Yet
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Start contributing to the academic community by publishing your first research paper
            </p>
          </div>
        )}
      </main>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
