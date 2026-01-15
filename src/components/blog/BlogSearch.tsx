import React from 'react';

interface BlogSearchProps {
    search: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onClearSearch: () => void;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ search, onSearchChange, onSearchSubmit, onClearSearch }) => {
    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            <form
                onSubmit={onSearchSubmit}
                className="flex flex-col sm:flex-row items-center gap-3 w-full"
                role="search"
                aria-label="Search blogs"
            >
                <div className="relative flex-1 w-full">
                    <input
                        type="text"
                        value={search}
                        onChange={onSearchChange}
                        placeholder="Search blogs by title, content, or author..."
                        className="w-full px-5 py-3 md:py-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-300 transition-all text-sm md:text-base"
                        aria-label="Search input"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm md:text-base"
                    aria-label="Submit search"
                >
                    Search
                </button>
            </form>

            {search && (
                <div className="flex items-center justify-center mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm md:text-base shadow-sm border border-blue-200">
                        <span>Searching for: <strong className="font-semibold">{search}</strong></span>
                        <button
                            type="button"
                            className="ml-1 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                            aria-label="Clear search"
                            onClick={onClearSearch}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                </div>
            )}
        </div>
    );
};

export default BlogSearch;
