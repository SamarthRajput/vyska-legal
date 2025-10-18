/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Decimal } from "@prisma/client/runtime/library";
import Pagination from "@/components/Pagination";

interface TransactionData {
    id: string;
    eventType: string;
    createdAt: string;
    rawData: any;
    payment: {
        id: string;
        orderId: string;
        paymentId: string | null;
        status: "PENDING" | "CANCELLED" | "SUCCESS" | "FAILED";
        method: string | null;
        description: string | null;
        paymentFor: "SERVICE" | "APPOINTMENT";
        currency: string;
        amount: Decimal | { valueOf(): string };
        createdAt: string;
        user: {
            id: string;
            role: "USER" | "ADMIN";
            name: string;
            email: string;
        };
        appointment: {
            id: string;
            userName: string;
            userEmail: string;
            agenda: string | null;
            status: "PENDING" | "CONFIRMED" | "CANCELLED";
        } | null;
        service: {
            id: string;
            title: string;
            price: number;
        } | null;
    };
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const Transactions = () => {
    const [data, setData] = useState<TransactionData[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    // NEW: selected transaction for modal
    const [selectedTxn, setSelectedTxn] = useState<TransactionData | null>(null);

    // Fetch data from backend API
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                page: String(pagination.page),
                limit: String(pagination.limit),
                search: search || "",
            });
            const res = await fetch(`/api/admin/transactions?${query.toString()}`);
            const json = await res.json();
            setData(json.data || []);
            setPagination((prev) => ({ ...prev, ...json.pagination }));
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    // debounce the input -> updates "search" after delay
    useEffect(() => {
        const handler = setTimeout(() => {
            // if typing changed searchInput, reset to page 1
            if (searchInput !== search) {
                setPagination((p) => ({ ...p, page: 1 }));
                setSearch(searchInput);
            }
        }, 450);
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, search]);

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, User, Status..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                        }}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
                        aria-label="Search transactions"
                    />
                    {searchInput ? (
                        <button
                            aria-label="Clear search"
                            onClick={() => {
                                setSearchInput("");
                                setSearch("");
                                setPagination((p) => ({ ...p, page: 1 }));
                            }}
                            className="absolute right-2 top-2.5 p-1 text-gray-500 hover:text-gray-700"
                        >
                            <X size={16} />
                        </button>
                    ) : null}
                </div>

                {/* Active search pill */}
                {search ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            Searching for “{search}”
                        </span>
                        <button
                            onClick={() => {
                                setSearchInput("");
                                setSearch("");
                                setPagination((p) => ({ ...p, page: 1 }));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Clear active search"
                        >
                            Clear
                        </button>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 hidden sm:block">Showing all transactions</div>
                )}
            </div>

            {loading ? (
                // Skeleton loaders for desktop table and mobile cards
                <div className="space-y-4">
                    {/* Desktop/table skeleton */}
                    <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded-xl">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-900">
                                <tr>
                                    <th className="p-3 text-left">Order ID</th>
                                    <th className="p-3 text-left">User</th>
                                    <th className="p-3 text-left">Type</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Amount</th>
                                    <th className="p-3 text-left">Method</th>
                                    <th className="p-3 text-left">Event</th>
                                    <th className="p-3 text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: Math.min(pagination.limit || 5, 10) }).map((_, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-3">
                                            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                                        </td>
                                        <td className="p-3">
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2" />
                                            <div className="h-3 bg-gray-200 rounded w-40 animate-pulse" />
                                        </td>
                                        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                                        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                                        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                                        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                                        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
                                        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28 animate-pulse" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/card skeletons */}
                    <div className="sm:hidden space-y-3">
                        {Array.from({ length: Math.min(pagination.limit || 5, 5) }).map((_, i) => (
                            <div key={i} className="bg-white shadow rounded-lg p-3 border">
                                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-48 mb-3 animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop/table view */}
                    <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded-xl">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-900">
                                <tr>
                                    <th className="p-3 text-left">Order ID</th>
                                    <th className="p-3 text-left">User</th>
                                    <th className="p-3 text-left">Type</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Amount</th>
                                    <th className="p-3 text-left">Method</th>
                                    <th className="p-3 text-left">Event</th>
                                    <th className="p-3 text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-6 text-gray-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((txn) => (
                                        <tr
                                            key={txn.id}
                                            className="border-t hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => setSelectedTxn(txn)}
                                        >
                                            <td className="p-3 font-mono text-xs text-blue-600">
                                                {txn.payment.orderId}
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">{txn.payment.user.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {txn.payment.user.email}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {txn.payment.paymentFor === "SERVICE"
                                                    ? "Service"
                                                    : "Appointment"}
                                            </td>
                                            <td
                                                className={`p-3 font-medium ${txn.payment.status === "SUCCESS"
                                                    ? "text-green-600"
                                                    : txn.payment.status === "FAILED"
                                                        ? "text-red-600"
                                                        : txn.payment.status === "PENDING"
                                                            ? "text-yellow-600"
                                                            : "text-gray-600"
                                                    }`}
                                            >
                                                {txn.payment.status}
                                            </td>
                                            <td className="p-3">
                                                ₹
                                                {Number(txn.payment.amount?.valueOf?.() || 0).toLocaleString(
                                                    "en-IN"
                                                )}{" "}
                                                <span className="text-xs text-gray-400">
                                                    {txn.payment.currency}
                                                </span>
                                            </td>
                                            <td className="p-3">{txn.payment.method || "-"}</td>
                                            <td className="p-3">{txn.eventType}</td>
                                            <td className="p-3 text-xs">
                                                {new Date(txn.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/card view */}
                    <div className="sm:hidden space-y-3">
                        {data.length === 0 ? (
                            <div className="py-6 text-center text-gray-500">No transactions found.</div>
                        ) : (
                            data.map((txn) => (
                                <div
                                    key={txn.id}
                                    className="bg-white shadow rounded-lg p-3 border hover:shadow-md transition cursor-pointer"
                                    onClick={() => setSelectedTxn(txn)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <div className="font-mono text-xs text-blue-600">
                                                {txn.payment.orderId}
                                            </div>
                                            <div className="font-medium">{txn.payment.user.name}</div>
                                            <div className="text-xs text-gray-500">{txn.payment.user.email}</div>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`font-medium ${txn.payment.status === "SUCCESS"
                                                    ? "text-green-600"
                                                    : txn.payment.status === "FAILED"
                                                        ? "text-red-600"
                                                        : txn.payment.status === "PENDING"
                                                            ? "text-yellow-600"
                                                            : "text-gray-600"
                                                    }`}
                                            >
                                                {txn.payment.status}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(txn.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                                        <div>
                                            <div>
                                                ₹{Number(txn.payment.amount?.valueOf?.() || 0).toLocaleString("en-IN")}
                                                <span className="ml-1 text-xs text-gray-400">{txn.payment.currency}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{txn.payment.method || "-"}</div>
                                        </div>
                                        <div className="text-xs text-gray-600">{txn.eventType}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {selectedTxn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedTxn(null)} />
                    <div className="bg-white max-w-2xl w-full mx-4 rounded-lg shadow-lg z-10 overflow-auto max-h-[80vh]">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-medium">Transaction Details</h3>
                            <button onClick={() => setSelectedTxn(null)} aria-label="Close" className="p-1 text-gray-600 hover:text-gray-800">
                                <X />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <div className="text-xs text-gray-500">Order ID</div>
                                <div className="font-mono text-sm text-blue-600">{selectedTxn.payment.orderId}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">User</div>
                                    <div className="font-medium">{selectedTxn.payment.user.name}</div>
                                    <div className="text-xs text-gray-500">{selectedTxn.payment.user.email}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Status</div>
                                    <div className="font-medium">{selectedTxn.payment.status}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">Amount</div>
                                    <div>₹{Number(selectedTxn.payment.amount?.valueOf?.() || 0).toLocaleString("en-IN")} <span className="text-xs text-gray-400">{selectedTxn.payment.currency}</span></div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Method</div>
                                    <div>{selectedTxn.payment.method || "-"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Type</div>
                                    <div>{selectedTxn.payment.paymentFor === "SERVICE" ? "Service" : "Appointment"}</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Event</div>
                                <div className="text-sm">{selectedTxn.eventType}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Timestamp</div>
                                <div className="text-sm">{new Date(selectedTxn.createdAt).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-2">Raw Data</div>
                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">{JSON.stringify(selectedTxn.rawData, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Pagination
                pagination={pagination}
                handlePageChange={(v) => setPagination((p) => ({ ...p, page: v }))}
                limit={pagination?.limit || 10}
                setLimit={(v) => setPagination((p) => ({ ...p, limit: v, page: 1 }))}
            />
        </div>
    );
};

export default Transactions;
