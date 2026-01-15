import React from 'react';

const BlogSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-2">
            {/* Breadcrumb Skeleton */}
            <div className="max-w-6xl mx-auto mb-6 px-4 flex items-center space-x-2">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-4">
                {/* Main Blog Content Skeleton */}
                <div className="flex-1">
                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
                        {/* Hero Image Skeleton */}
                        <div className="w-full h-[350px] md:h-[450px] bg-gray-200 animate-pulse relative">
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                <div className="h-8 md:h-12 w-3/4 bg-gray-300 rounded mb-4 animate-pulse"></div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-300 animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                                        <div className="h-3 w-32 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="p-6 md:p-10 lg:p-12 space-y-4">
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-32 w-full bg-gray-100 rounded animate-pulse mt-8"></div>
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-16 h-16 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-16 h-16 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BlogSkeleton;
