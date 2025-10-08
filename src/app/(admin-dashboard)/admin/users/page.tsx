"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Download,
    Users,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Mail,
    Calendar,
    FileText,
    Shield,
    Crown,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';

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

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                role: roleFilter,
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
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, sortBy, sortDir, pagination.page, pagination.pageSize]);

    useEffect(() => {
        setFilterInput({
            search: searchTerm,
            role: roleFilter,
            startDate: "",
            endDate: ""
        });
    }, []);

    useEffect(() => {
        setSearchTerm(filterInput.search);
        setRoleFilter(filterInput.role as "all" | "USER" | "ADMIN");
    }, [filterInput]);

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

    const getRoleIcon = (role: string) => {
        return role === "ADMIN"
            ? <Crown className="w-4 h-4 text-amber-500" />
            : <Shield className="w-4 h-4 text-blue-500" />;
    };

    const getRoleBadge = (role: string) => {
        return role === "ADMIN"
            ? "bg-amber-100 text-amber-800 border-amber-200"
            : "bg-blue-100 text-blue-800 border-blue-200";
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination(prev => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize, page: 1 }));
    };

    const activeFilters = [
        filterInput.search && { key: "search", label: "Search", value: filterInput.search },
        filterInput.role !== "all" && { key: "role", label: "Role", value: filterInput.role },
        filterInput.startDate && { key: "startDate", label: "Start", value: filterInput.startDate },
        filterInput.endDate && { key: "endDate", label: "End", value: filterInput.endDate }
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6" title="User statistics overview">
                    {[
                        { label: "Total Users", value: pagination.total, icon: Users, color: "text-blue-600" },
                        { label: "Administrators", value: users.filter(u => u.siteRole === "ADMIN").length, icon: Crown, color: "text-amber-600" },
                        { label: "New This Month", value: users.filter(u => new Date(u.createdAt).getTime() > Date.now() - 30*24*60*60*1000).length, icon: UserCheck, color: "text-purple-600" }
                    ].map((stat, index) => (
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
                                onChange={e => setFilterInput(f => ({...f, search: e.target.value}))}
                                placeholder="Name or email..."
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                        <select
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                            value={filterInput.role}
                            onChange={e => setFilterInput(f => ({...f, role: e.target.value}))}
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
                                                if (filter.key === "role") return {...f, role: "all"};
                                                if (filter.key === "search") return {...f, search: ""};
                                                if (filter.key === "startDate") return {...f, startDate: ""};
                                                if (filter.key === "endDate") return {...f, endDate: ""};
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
                    { loading ? (
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
                        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm" style={{minWidth: 700}}>
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    user.siteRole === "ADMIN"
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
                {pagination && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 mt-4 px-1">
                        <div className="text-xs text-gray-600 text-center md:text-left">
                            Page {pagination.page} of {pagination.totalPages} | {pagination.total} users
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <button
                                disabled={!pagination.hasPrev}
                                onClick={() => handlePageChange(pagination.page - 1)}
                                className="px-3 py-1 border rounded text-xs disabled:opacity-50"
                                title="Previous page"
                            >
                                <ChevronLeft className="inline w-4 h-4" /> Previous
                            </button>
                            <input
                                type="number"
                                min={1}
                                max={pagination.totalPages}
                                value={pagination.page}
                                onChange={e => handlePageChange(Number(e.target.value))}
                                className="w-14 p-1 border rounded text-center text-xs"
                                title="Current page"
                            />
                            <button
                                disabled={!pagination.hasNext}
                                onClick={() => handlePageChange(pagination.page + 1)}
                                className="px-3 py-1 border rounded text-xs disabled:opacity-50"
                                title="Next page"
                            >
                                Next <ChevronRight className="inline w-4 h-4" />
                            </button>
                            <select
                                className="ml-2 p-1 border rounded text-xs cursor-pointer"
                                value={pagination.pageSize}
                                onChange={e => handlePageSizeChange(Number(e.target.value))}
                                title="Users per page"
                            >
                                {[10, 20, 30, 50].map(sz => (
                                    <option key={sz} value={sz}>{sz} / page</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

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
