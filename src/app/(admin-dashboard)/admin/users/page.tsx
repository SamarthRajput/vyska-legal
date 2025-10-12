/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search,
    Download,
    Users,
    UserCheck,
    Mail,
    Calendar,
    Shield,
    Crown,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import Pagination from '@/components/Pagination';

interface UsersWithStats {
    id: string;
    clerkId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    siteRole: "USER" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
}

interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface ApiResponse {
    users: UsersWithStats[];
    pagination: Pagination;
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<UsersWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    const [confirmRoleChange, setConfirmRoleChange] = useState<{
        userId: string;
        userName: string;
        currentRole: string;
        newRole: string;
    } | null>(null);

    const [filterInput, setFilterInput] = useState({
        search: "",
        role: "all",
        startDate: "",
        endDate: ""
    });

    // Debounce filter/search input to avoid excessive fetches
    const [debouncedFilterInput, setDebouncedFilterInput] = useState(filterInput);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedFilterInput(filterInput), 350);
        return () => clearTimeout(handler);
    }, [filterInput]);

    // Memoize fetchUsers to avoid unnecessary re-creation
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                search: debouncedFilterInput.search,
                role: debouncedFilterInput.role,
                sortBy,
                sortDir,
                page: pagination.page.toString(),
                limit: pagination.pageSize.toString()
            });
            const res = await fetch(`/api/admin/users?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch users');
            const data: ApiResponse = await res.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [debouncedFilterInput, sortBy, sortDir, pagination.page, pagination.pageSize]);

    // Fetch users when relevant state changes
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Keep filterInput in sync with pagination reset
    useEffect(() => {
        setFilterInput({
            search: "",
            role: "all",
            startDate: "",
            endDate: ""
        });
    }, []);

    // Memoize stats for performance
    const stats = useMemo(() => [
        { label: "Total Users", value: pagination.total, icon: Users, color: "text-blue-600" },
        { label: "Administrators", value: users.filter(u => u.siteRole === "ADMIN").length, icon: Crown, color: "text-amber-600" },
        { label: "New This Month", value: users.filter(u => new Date(u.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length, icon: UserCheck, color: "text-purple-600" }
    ], [pagination.total, users]);

    // Memoize activeFilters for performance
    const activeFilters = useMemo(() => [
        filterInput.search && { key: "search", label: "Search", value: filterInput.search },
        filterInput.role !== "all" && { key: "role", label: "Role", value: filterInput.role },
        filterInput.startDate && { key: "startDate", label: "Start", value: filterInput.startDate },
        filterInput.endDate && { key: "endDate", label: "End", value: filterInput.endDate }
    ].filter(Boolean), [filterInput]);

    const handleRoleChangeRequest = (userId: string, userName: string, currentRole: string, newRole: string) => {
        setConfirmRoleChange({ userId, userName, currentRole, newRole });
    };

    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteRole: newRole }),
            });
            if (!response.ok) throw new Error('Failed to update user role');
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, siteRole: newRole } : u));
            setConfirmRoleChange(null);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleExportUsers = () => {
        const csvContent = [
            ["Name", "Email", "Role", "Created At"].join(","),
            ...users.map(user => [
                `"${user.name}"`,
                `"${user.email}"`,
                user.siteRole,
                new Date(user.createdAt).toLocaleDateString(),
            ].join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination(prev => ({ ...prev, page }));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Error display */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-2 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{error}</span>
                        <button
                            className="ml-auto text-xs underline"
                            onClick={() => setError(null)}
                            aria-label="Dismiss error"
                        >Dismiss</button>
                    </div>
                )}

                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
                    title="User statistics overview"
                >
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6" title={stat.label}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <form
                    className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 mb-4 items-end bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-full"
                    onSubmit={e => e.preventDefault()}
                >
                    <div className="flex-1 min-w-[150px] w-full md:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="border rounded pl-8 pr-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                                value={filterInput.search}
                                onChange={e => setFilterInput(f => ({ ...f, search: e.target.value }))}
                                placeholder="Name or email..."
                                autoComplete="off"
                                aria-label="Search users"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                        <select
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                            value={filterInput.role}
                            onChange={e => setFilterInput(f => ({ ...f, role: e.target.value }))}
                        >
                            <option value="all">All</option>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt">Join Date</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                        <select
                            value={sortDir}
                            onChange={e => setSortDir(e.target.value as "asc" | "desc")}
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleExportUsers}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
                            title="Export current user list as CSV"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            type="button"
                            onClick={fetchUsers}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 w-full sm:w-auto"
                            title="Refresh user list"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </form>

                {/* Active Filter Chips */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 items-center w-full">
                        {activeFilters.map(filter => {
                            if (!filter) return null;
                            return (
                                <span
                                    key={filter.key}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
                                >
                                    {filter.label}: {filter.value}
                                    <button
                                        type="button"
                                        className="ml-1 text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                                        aria-label={`Remove ${filter.label} filter`}
                                        title={`Remove filter: ${filter.label}`}
                                        onClick={() => {
                                            setFilterInput(f => {
                                                if (filter.key === "role") return { ...f, role: "all" };
                                                if (filter.key === "search") return { ...f, search: "" };
                                                if (filter.key === "startDate") return { ...f, startDate: "" };
                                                if (filter.key === "endDate") return { ...f, endDate: "" };
                                                return f;
                                            });
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                        <button
                            type="button"
                            className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium border hover:bg-gray-200"
                            onClick={() => setFilterInput({
                                search: "",
                                role: "all",
                                startDate: "",
                                endDate: ""
                            })}
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto" title="User list table">
                    {loading ? (
                        <div className="p-6">
                            <div className="animate-pulse space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4 py-2">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                                            <div className="h-3 bg-gray-100 rounded w-1/4" />
                                        </div>
                                        <div className="h-6 w-16 bg-gray-100 rounded" />
                                        <div className="h-6 w-20 bg-gray-100 rounded" />
                                        <div className="h-6 w-24 bg-gray-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">No users match your criteria. Try searching by name, email, or adjust filters above.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm" >
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left uppercase text-gray-500 font-medium">User</th>
                                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left uppercase text-gray-500 font-medium">Role</th>
                                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left uppercase text-gray-500 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap flex items-center gap-3">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-gray-500 flex items-center gap-1 text-sm">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.siteRole === "ADMIN"
                                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                                    }`}>
                                                    {user.siteRole === "ADMIN" ? (
                                                        <Crown className="w-4 h-4 text-amber-500 mr-1" />
                                                    ) : (
                                                        <Shield className="w-4 h-4 text-blue-500 mr-1" />
                                                    )}
                                                    <span className="capitalize">{user.siteRole}</span>
                                                </span>
                                                <select
                                                    value={user.siteRole}
                                                    onChange={e => handleRoleChangeRequest(user.id, user.name, user.siteRole, e.target.value)}
                                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                                    title="Change user role"
                                                    aria-label={`Change role for ${user.name}`}
                                                >
                                                    <option value="USER">User</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <Pagination
                    pagination={pagination}
                    limit={pagination.pageSize}
                    setLimit={(v) => setPagination((p) => ({ ...p, pageSize: v, page: 1 }))}
                    pageSizes={[10, 20, 30, 50]}
                    handlePageChange={useCallback((page: number) => {
                        if (page < 1 || page > pagination.totalPages) return;
                        setPagination(prev => ({ ...prev, page }));
                    }, [pagination.totalPages])}
                />

                {/* Confirm Role Change Modal */}
                {confirmRoleChange && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-amber-600 mr-2" />
                                <h3 className="text-lg font-semibold">Confirm Role Change</h3>
                            </div>
                            <p className="mb-6 text-gray-700">
                                Are you sure you want to change <strong>{confirmRoleChange.userName}</strong> to <strong>{confirmRoleChange.newRole.toUpperCase()}</strong>? This will {confirmRoleChange.newRole === 'ADMIN' ? 'give full administrative access' : 'assign standard user permissions'}.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                    onClick={() => setConfirmRoleChange(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => handleRoleChange(confirmRoleChange.userId, confirmRoleChange.newRole as "USER" | "ADMIN")}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminUsersPage;
