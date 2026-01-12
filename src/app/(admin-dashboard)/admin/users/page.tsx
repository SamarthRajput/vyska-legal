/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
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
    AlertTriangle,
    Trash2
} from 'lucide-react';
import Pagination from '@/components/Pagination';

interface UsersWithStats {
    id: string;
    clerkId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    role: "USER" | "ADMIN";
    canWriteBlog?: boolean;
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

    const [confirmDelete, setConfirmDelete] = useState<{
        userId: string;
        userName: string;
        userEmail: string;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, roleFilter, sortBy, sortDir, pagination.page, pagination.pageSize]);

    useEffect(() => {
        setFilterInput({
            search: searchTerm,
            role: roleFilter,
            startDate: "",
            endDate: ""
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setSearchTerm(filterInput.search);
        setRoleFilter(filterInput.role as "all" | "USER" | "ADMIN");
    }, [filterInput]);

    const handleRoleChangeRequest = (userId: string, userName: string, currentRole: string, newRole: string) => {
        if (currentRole !== newRole) {
            setConfirmRoleChange({ userId, userName, currentRole, newRole });
        }
    };

    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user role');
            }

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setConfirmRoleChange(null);
            setError(null);
        } catch (error: any) {
            setError(error.message);
            setConfirmRoleChange(null);
        }
    };

    const handleDeleteRequest = (userId: string, userName: string, userEmail: string) => {
        setConfirmDelete({ userId, userName, userEmail });
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            setUsers(prev => prev.filter(u => u.id !== userId));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            setConfirmDelete(null);
            setError(null);
        } catch (error: any) {
            setError(error.message);
            setConfirmDelete(null);
        }
    };

    const handleExportUsers = () => {
        const csvContent = [
            ["Name", "Email", "Role", "Can Write Blog", "Created At"].join(","),
            ...users.map(user => [
                `"${user.name}"`,
                `"${user.email}"`,
                user.role,
                String(user.canWriteBlog ?? false),
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
            ? <Crown className="w-3.5 h-3.5 text-amber-600" />
            : <Shield className="w-3.5 h-3.5 text-blue-600" />;
    };

    const getRoleBadge = (role: string) => {
        return role === "ADMIN"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-blue-50 text-blue-700 border-blue-200";
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

    const handleToggleCanWriteBlog = async (userId: string, currentValue: boolean) => {
        try {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, canWriteBlog: !currentValue } : u));

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ canWriteBlog: !currentValue }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update blog write permission");
            }

            setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, canWriteBlog: currentValue } : u));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: "Total Users", value: pagination.total, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
                        { label: "Administrators", value: users.filter(u => u.role === "ADMIN").length, icon: Crown, color: "text-amber-600", bgColor: "bg-amber-50" },
                        { label: "New This Month", value: users.filter(u => new Date(u.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length, icon: UserCheck, color: "text-purple-600", bgColor: "bg-purple-50" }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    value={filterInput.search}
                                    onChange={e => setFilterInput(f => ({ ...f, search: e.target.value }))}
                                    placeholder="Search by name or email..."
                                />
                            </div>
                        </div>
                        <div className="w-full lg:w-40">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Role</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={filterInput.role}
                                onChange={e => setFilterInput(f => ({ ...f, role: e.target.value }))}
                            >
                                <option value="all">All Roles</option>
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="w-full lg:w-40">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                <option value="createdAt">Join Date</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                        <div className="w-full lg:w-36">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Order</label>
                            <select
                                value={sortDir}
                                onChange={e => setSortDir(e.target.value as "asc" | "desc")}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                <option value="desc">Newest</option>
                                <option value="asc">Oldest</option>
                            </select>
                        </div>
                        <div className="flex gap-2 items-end">
                            <button
                                type="button"
                                onClick={handleExportUsers}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                type="button"
                                onClick={fetchUsers}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide py-1">Active Filters:</span>
                            {activeFilters.map(filter => {
                                if (!filter) return null;
                                return (
                                    <span
                                        key={filter.key}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium"
                                    >
                                        {filter.label}: <span className="font-semibold">{filter.value}</span>
                                        <button
                                            type="button"
                                            className="ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
                                className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
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
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-8">
                                <div className="animate-pulse space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4 py-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                                            </div>
                                            <div className="h-8 w-24 bg-gray-100 rounded-full" />
                                            <div className="h-8 w-32 bg-gray-100 rounded-lg" />
                                            <div className="h-4 w-28 bg-gray-100 rounded" />
                                            <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
                                <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Blog Permission</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                            {user.avatarUrl ? (
                                                <img
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-semibold text-gray-900 text-sm truncate">{user.name}</div>
                                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{user.email}</span>
                                                </div>
                                            </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </span>
                                            <select
                                                value={user.role}
                                                onChange={e => handleRoleChangeRequest(user.id, user.name, user.role, e.target.value)}
                                                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400"
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            </div>
                                        </td>

                                        {/* Modern Toggle Switch for Can Write Blog */}
                                        <td className="px-6 py-4">
                                            <span className="flex items-center justify-center">
                                            <label htmlFor={`toggle-blog-${user.id}`} className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                type="checkbox"
                                                id={`toggle-blog-${user.id}`}
                                                className="peer sr-only"
                                                checked={user.canWriteBlog ?? false}
                                                onChange={() => handleToggleCanWriteBlog(user.id, user.canWriteBlog ?? false)}
                                                aria-label="Toggle blog writing permission"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 transition-colors" />
                                                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transform peer-checked:translate-x-5 transition-transform" />
                                            </label>
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <button
                                            onClick={() => handleDeleteRequest(user.id, user.name, user.email)}
                                            className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete user"
                                            >
                                            <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                <Pagination
                    pagination={pagination}
                    limit={pagination.pageSize}
                    setLimit={(v) => setPagination(prev => ({ ...prev, pageSize: v }))}
                    handlePageChange={(v) => setPagination(prev => ({ ...prev, page: v }))}
                />

                {/* Confirm Role Change Modal */}
                {confirmRoleChange && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-full bg-amber-100">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Confirm Role Change</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Are you sure you want to change <span className="font-semibold text-gray-900">{confirmRoleChange.userName}&lsquo;s</span> role to <span className="font-semibold text-gray-900">{confirmRoleChange.newRole}</span>?
                                {confirmRoleChange.newRole === 'ADMIN' ? (
                                    <span className="block mt-2 text-amber-600 font-medium">This will grant full administrative access.</span>
                                ) : (
                                    <span className="block mt-2 text-blue-600 font-medium">This will assign standard user permissions.</span>
                                )}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    onClick={() => setConfirmRoleChange(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    onClick={() => handleRoleChange(confirmRoleChange.userId, confirmRoleChange.newRole as "USER" | "ADMIN")}
                                >
                                    Confirm Change
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Delete Modal */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-full bg-red-100">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
                            </div>
                            <p className="text-gray-600 mb-2 leading-relaxed">
                                Are you sure you want to permanently delete <span className="font-semibold text-gray-900">{confirmDelete.userName}</span>?
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                                <p className="text-sm text-red-800">
                                    <strong>Warning:</strong> This action cannot be undone. All user data, including their blogs, appointments, and other related information will be permanently deleted.
                                </p>
                                <p className="text-xs text-red-700 mt-2">
                                    Email: {confirmDelete.userEmail}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    onClick={() => setConfirmDelete(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                    onClick={() => handleDeleteUser(confirmDelete.userId)}
                                >
                                    Delete User
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