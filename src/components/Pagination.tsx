"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    pagination: {
        page: number;
        totalPages: number;
        total: number;
    } | null;
    limit: number;
    setLimit: (limit: number) => void;
    handlePageChange: (page: number) => void;
    pageSizes?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
    pagination,
    limit,
    setLimit,
    handlePageChange,
    pageSizes = [10, 20, 30, 50, 100],
}) => {
    if (!pagination) return null;

    return (
        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center sm:justify-between mt-4 gap-3 sm:gap-2 w-full">
            {/* Page info */}
            <div className="text-xs text-gray-600 text-center sm:text-left">
                Page {pagination.page} of {pagination.totalPages} | {pagination.total} total
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
                <div className="flex gap-2 w-full sm:w-auto">
                    {/* Previous */}
                    <button
                        className="flex-1 sm:flex-none px-3 py-1 rounded border text-sm flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer transition-colors bg-white hover:bg-gray-100"
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        title="Go to previous page"
                    >
                        <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page input */}
                    <input
                        type="number"
                        min={1}
                        max={pagination.totalPages}
                        value={pagination.page}
                        onChange={(e) => handlePageChange(Number(e.target.value))}
                        className="w-full sm:w-14 px-2 py-1 border rounded text-sm text-center"
                        style={{ minWidth: 0 }}
                        title="Current page number"
                    />

                    {/* Next */}
                    <button
                        className="flex-1 sm:flex-none px-3 py-1 rounded border text-sm flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer transition-colors bg-white hover:bg-gray-100"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        title="Go to next page"
                    >
                        <span className="hidden sm:inline">Next</span> <ChevronRight />
                    </button>
                </div>

                {/* Page size selector */}
                <select
                    className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 px-2 py-1 border rounded text-sm cursor-pointer bg-white"
                    value={limit}
                    onChange={(e) => {
                        setLimit(Number(e.target.value));
                        handlePageChange(1); // reset to first page
                    }}
                    title="Select number of items per page"
                >
                    {pageSizes.map((size) => (
                        <option key={size} value={size}>
                            {size} / page
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Pagination;
