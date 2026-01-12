"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    email: string;
    profilePicture: string | null;
  };
}

export default function ResearchManagementPage() {
    const router = useRouter();
    const [researchPapers, setResearchPapers] = useState<Research[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
      fetchResearchPapers();
    }, [searchQuery, filter, sortBy]);

    const fetchResearchPapers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(searchQuery && { search: searchQuery }),
          ...(filter && { filter }),
          ...(sortBy && { sortBy }),
        });

        const response = await fetch(`/api/admin/research?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResearchPapers(data);
        }
      } catch (error) {
        console.error("Error fetching research papers:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleSelectAll = () => {
      if (selectedIds.size === researchPapers.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(researchPapers.map((r) => r.id)));
      }
    };

    const handleSelectOne = (id: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
      if (selectedIds.size === 0) return;

      const confirmMessage = `Are you sure you want to delete ${selectedIds.size} research paper${
        selectedIds.size > 1 ? "s" : ""
      }?`;

      if (!confirm(confirmMessage)) return;

      setIsDeleting(true);
      try {
        const deletePromises = Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/research/${id}`, { method: "DELETE" })
        );

        await Promise.all(deletePromises);
        alert(`Successfully deleted ${selectedIds.size} research paper(s)`);
        setSelectedIds(new Set());
        fetchResearchPapers();
      } 
      catch (error) {
        console.error("Error deleting research papers:", error);
        alert("Failed to delete some research papers");
      } 
      finally {
        setIsDeleting(false);
      }
    };

    const handleDeleteOne = async (id: string) => {
      if (!confirm("Are you sure you want to delete this research paper?")) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/research/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Research paper deleted successfully");
          fetchResearchPapers();
        } else {
          alert("Failed to delete research paper");
        }
      } catch (error) {
        console.error("Error deleting research:", error);
        alert("Failed to delete research paper");
      }
    };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Filters, Search, and Create Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Papers</option>
                <option value="withFile">With Uploaded File</option>
                <option value="withoutFile">Without File</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Create Button */}
            <div>
              <button
                onClick={() => router.push("/admin/research/create")}
                className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center gap-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Paper
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedIds.size} paper{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          </div>
        )}

        {/* Research Papers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : researchPapers.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No research papers found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new research paper.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          researchPapers.length > 0 &&
                          selectedIds.size === researchPapers.length
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {researchPapers.map((paper) => (
                    <tr
                      key={paper.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedIds.has(paper.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(paper.id)}
                          onChange={() => handleSelectOne(paper.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {paper.thumbnailUrl && (
                            <img
                              src={paper.thumbnailUrl}
                              alt={paper.title}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {paper.title}
                            </div>
                            {paper.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {paper.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {paper.createdBy.profilePicture && (
                            <img
                              src={paper.createdBy.profilePicture}
                              alt={paper.createdBy.name}
                              className="h-8 w-8 rounded-full mr-2"
                            />
                          )}
                          <div className="text-sm text-gray-900">
                            {paper.createdBy.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(paper.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            router.push(`/research/${paper.id}`)
                          }
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteOne(paper.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {researchPapers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total: {researchPapers.length} research papers</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}