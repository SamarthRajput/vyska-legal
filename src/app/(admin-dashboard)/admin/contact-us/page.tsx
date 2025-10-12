"use client"
import Pagination from '@/components/Pagination';
import React from 'react'
import { toast } from 'sonner';

interface RepliedBy {
    name: string;
    id: string;
    email: string;
    profilePicture: string | null;
}
interface Contact {
    name: string;
    email: string;
    message: string;
    phone: string | null;
    subject: string;
    status: 'PENDING' | 'RESOLVED';
    id: string;
    createdAt: string;
    updatedAt: string;
    reply: string | null;
    repliedById: string | null;
    repliedBy: RepliedBy | null;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const statusOptions = ['PENDING', 'RESOLVED'] as const;

const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n) + '…' : str;

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const ContactUsAdminPage = () => {
    const [contacts, setContacts] = React.useState<Contact[]>([]);
    const [pagination, setPagination] = React.useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState<string>('');
    const debouncedSearch = useDebounce(search, 400);
    const [status, setStatus] = React.useState<string>('');
    const [page, setPage] = React.useState<number>(1);
    const [limit, setLimit] = React.useState<number>(10);
    const [sortBy, setSortBy] = React.useState<string>('createdAt');
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
    const [replyText, setReplyText] = React.useState<string>('');
    const [replying, setReplying] = React.useState<boolean>(false);

    const fetchContacts = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                ...(status ? { status } : {}),
                ...(debouncedSearch ? { search: debouncedSearch } : {}),
                page: String(page),
                limit: String(limit),
                sortBy,
                sortOrder,
            });
            const response = await fetch(`/api/contact?${params.toString()}`);
            const data = await response.json();
            if (response.ok) {
                setContacts(data.data);
                setPagination(data.pagination);
            } else {
                setError(data.error || 'Failed to fetch contacts.');
            }
        } catch (err) {
            setError('Failed to fetch contacts.');
        } finally {
            setLoading(false);
        }
    }, [status, debouncedSearch, page, limit, sortBy, sortOrder]);

    React.useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;
        setDeletingId(id);
        try {
            const response = await fetch('/api/contact', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Contact deleted successfully.');
                setContacts((prev) => prev.filter((c) => c.id !== id));
            } else {
                toast.error(data.error || 'Failed to delete contact.');
            }
        } catch {
            toast.error('Failed to delete contact.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (pagination) {
            if (newPage < 1 || newPage > pagination.totalPages) return;
            setPage(newPage);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const openModal = (contact: Contact) => {
        setSelectedContact(contact);
        setReplyText('');
    };
    const closeModal = () => {
        setSelectedContact(null);
        setReplyText('');
    };

    const handleReplySubmit = async () => {
        if (!selectedContact) return;
        if (!replyText.trim()) {
            toast.info('Reply cannot be empty.');
            return;
        }
        setReplying(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedContact.id, reply: replyText }),
            });
            const data = await response.json();
            if (response.ok) {
                setContacts((prev) =>
                    prev.map((c) =>
                        c.id === selectedContact.id
                            ? { ...c, status: 'RESOLVED', reply: replyText }
                            : c
                    )
                );
                closeModal();
            } else {
                toast.error(data.error || 'Failed to send reply.');
            }
        } catch {
            toast.error('Failed to send reply.');
        } finally {
            setReplying(false);
        }
    };

    const skeletonRows = loading
        ? limit
        : Math.max(0, limit - contacts.length);

    return (
        <div className="p-2 sm:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-stretch sm:items-end">
                <div className="flex-1 flex flex-col">
                    <label className="text-xs font-semibold text-gray-700 mb-1" htmlFor="search-input">Search</label>
                    <div className="relative">
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Search by name, email, subject..."
                            value={search}
                            onChange={handleSearchChange}
                            className={`border px-3 py-2 rounded-md w-full transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm ${search ? 'border-blue-500' : 'border-gray-300'}`}
                            title="Search contacts by name, email, or subject"
                            aria-label="Search contacts"
                        />
                        {search && (
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                onClick={() => setSearch('')}
                                aria-label="Clear search"
                                title="Clear search"
                                tabIndex={0}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex flex-col w-full sm:w-52">
                    <label className="text-xs font-semibold text-gray-700 mb-1" htmlFor="status-filter">Status</label>
                    <select
                        id="status-filter"
                        value={status}
                        onChange={handleStatusFilterChange}
                        className={`border px-3 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm ${status ? 'border-blue-500' : 'border-gray-300'}`}
                        title="Filter by status"
                        aria-label="Filter by status"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
                {search && (
                    <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium" title={`Searching for: ${search}`}>
                        Search: <span className="ml-1 font-semibold">{search}</span>
                        <button className="ml-2 text-blue-500 hover:text-blue-700" onClick={() => setSearch('')} aria-label="Clear search" title="Clear search">×</button>
                    </span>
                )}
                {status && (
                    <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium" title={`Status: ${status}`}>
                        Status: <span className="ml-1 font-semibold">{status}</span>
                        <button className="ml-2 text-green-500 hover:text-green-700" onClick={() => setStatus('')} aria-label="Clear status" title="Clear status">×</button>
                    </span>
                )}
            </div>
            <div className="bg-white rounded-xl shadow-lg border overflow-x-auto">
                <div className="w-full min-w-[600px] sm:min-w-0">
                    <table className="min-w-full text-sm" aria-label="Contact submissions table">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th
                                    className={`border-b px-3 py-2 cursor-pointer select-none text-left font-semibold transition ${sortBy === 'createdAt' ? 'text-blue-700' : 'text-gray-700'}`}
                                    onClick={() => handleSort('createdAt')}
                                    title="Sort by date"
                                    aria-sort={sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    scope="col"
                                >
                                    Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" title="Contact Name" scope="col">Name</th>
                                <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" title="Contact Email" scope="col">Email</th>
                                <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" title="Contact Phone" scope="col">Phone</th>
                                <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" title="Contact Subject" scope="col">Subject</th>
                                <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" title="Contact Message" scope="col">Message</th>
                                <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" title="Contact Status" scope="col">Status</th>
                                <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" title="Actions" scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && contacts.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500" title="No contacts found">No contacts found.</td>
                                </tr>
                            )}
                            {!loading && contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50 transition">
                                    <td className="border-b px-3 py-2" title={new Date(contact.createdAt).toLocaleString()}>{new Date(contact.createdAt).toLocaleString()}</td>
                                    <td className="border-b px-3 py-2" title={contact.name}>{truncate(contact.name, 20)}</td>
                                    <td className="border-b px-3 py-2" title={contact.email}>{truncate(contact.email, 20)}</td>
                                    <td className="border-b px-3 py-2" title={contact.phone ? contact.phone : 'No phone'}>{contact.phone ? truncate(contact.phone, 15) : '-'}</td>
                                    <td className="border-b px-3 py-2" title={contact.subject}>{truncate(contact.subject, 25)}</td>
                                    <td className="border-b px-3 py-2 max-w-xs" title={contact.message} onClick={() => openModal(contact)} style={{ cursor: 'pointer' }} aria-label="View full message">
                                        <div className="max-h-16 overflow-hidden">{truncate(contact.message, 40)}</div>
                                    </td>
                                    <td className="border-b px-3 py-2" title={contact.status}>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold
                                            ${contact.status === 'RESOLVED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="border-b px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModal(contact)}
                                                className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-300 border border-blue-100 bg-blue-50"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contact.id)}
                                                disabled={deletingId === contact.id}
                                                className={`text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded transition focus:outline-none focus:ring-2 focus:ring-red-300 border border-red-100 bg-red-50 ${deletingId === contact.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            >
                                                {deletingId === contact.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {loading && skeletonRows > 0 && Array.from({ length: skeletonRows }).map((_, idx) => (
                                <tr key={`skeleton-${idx}`}>
                                    {Array.from({ length: 8 }).map((_, colIdx) => (
                                        <td key={colIdx} className="border-b px-3 py-2">
                                            <div className="animate-pulse h-4 rounded bg-gray-200 w-full max-w-[90%] mx-auto" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {error && (
                        <div className="p-6 text-red-500 text-center" role="alert">{error}</div>
                    )}
                </div>
            </div>
            <Pagination
                pagination={pagination}
                limit={limit}
                setLimit={setLimit}
                handlePageChange={setPage}
            />
            {selectedContact && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 relative mx-2 animate-fadeIn border border-gray-200 max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={closeModal}
                            aria-label="Close modal"
                            title="Close"
                        >
                            ×
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 border-b pb-2">Contact Details</h2>
                        <div className="mb-2 text-sm"><b>Date:</b> <span title={new Date(selectedContact.createdAt).toLocaleString()}>{new Date(selectedContact.createdAt).toLocaleString()}</span></div>
                        <div className="mb-2 text-sm"><b>Name:</b> <span title={selectedContact.name}>{selectedContact.name}</span></div>
                        <div className="mb-2 text-sm"><b>Email:</b> <span title={selectedContact.email}>{selectedContact.email}</span></div>
                        <div className="mb-2 text-sm"><b>Phone:</b> <span title={selectedContact.phone || '-'}>{selectedContact.phone || '-'}</span></div>
                        <div className="mb-2 text-sm"><b>Subject:</b> <span title={selectedContact.subject}>{selectedContact.subject}</span></div>
                        <div className="mb-2 text-sm"><b>Message:</b>
                            <div className="whitespace-pre-line border rounded p-2 bg-gray-50 mt-1 max-h-40 overflow-y-auto text-gray-700 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" title={selectedContact.message}>
                                {selectedContact.message}
                            </div>
                        </div>
                        <div className="mb-2 text-sm">
                            <b>Status:</b>
                            <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs font-semibold
                                ${selectedContact.status === 'RESOLVED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'}`} title={selectedContact.status}>
                                {selectedContact.status}
                            </span>
                        </div>
                        {selectedContact.reply && (
                            <div className="mb-2">
                                <b>Reply:</b>
                                <div className="whitespace-pre-line border rounded p-2 bg-green-50 mt-1 max-h-40 overflow-y-auto text-gray-700 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" title={selectedContact.reply}>
                                    {selectedContact.reply}
                                </div>
                                {selectedContact.repliedBy && (
                                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                        <img src={selectedContact.repliedBy.profilePicture || '/default-profile.png'} alt="Profile" className="inline-block w-5 h-5 rounded-full mr-1 border" />
                                        <b>Replied By:</b> <span title={selectedContact.repliedBy.name}>{selectedContact.repliedBy.name}</span> (<span title={selectedContact.repliedBy.email}>{selectedContact.repliedBy.email}</span>) at <span title={new Date(selectedContact.updatedAt).toLocaleString()}>{new Date(selectedContact.updatedAt).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedContact.status === 'PENDING' && (
                            <div className="mt-4">
                                <label className="block font-semibold mb-1 text-gray-700" htmlFor="reply-textarea">Reply to User:</label>
                                <textarea
                                    id="reply-textarea"
                                    className="w-full border rounded p-2 min-h-[80px] max-h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    maxLength={2000}
                                    disabled={replying}
                                    aria-label="Reply to user"
                                    title="Type your reply here"
                                />
                                <button
                                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-60"
                                    onClick={handleReplySubmit}
                                    disabled={replying}
                                    aria-label="Send reply and mark as resolved"
                                    title="Send reply and mark as resolved"
                                >
                                    {replying ? 'Sending...' : 'Send Reply & Mark Resolved'}
                                </button>
                                <p className="text-xs text-gray-500 mt-1">
                                    Note: Reply max 2000 characters and an email will be sent to user.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ContactUsAdminPage;