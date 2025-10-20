"use client";
import Pagination from '@/components/Pagination';
import { X, Loader } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AppointmentSlot {
    id: string;
    date: string;
    timeSlot: string;
    isBooked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentType {
    id: string;
    title: string;
    description?: string;
    price: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    orderId: string;
    paymentId?: string;
    signature?: string;
    amount: string;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
    method?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    profilePicture?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Appointment {
    id: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    agenda?: string;
    meetUrl?: string;
    noofrescheduled: number;
    createdAt: string;
    updatedAt: string;
    slot: AppointmentSlot;
    appointmentType: AppointmentType;
    User?: User;
    payment?: Payment;
}

export interface AppointmentApiResponse {
    pagination: Pagination;
    appointments: Appointment[];
}

const AppointmentManagement = () => {
    const [appointments, setAppointments] = React.useState<Appointment[]>([]);
    const [pagination, setPagination] = React.useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [search, setSearch] = React.useState<string>('');
    const [status, setStatus] = React.useState<'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'all'>('all');
    const [loading, setLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)

    const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
    const [modalMeetingUrl, setModalMeetingUrl] = React.useState<string>('');
    const [saving, setSaving] = React.useState<boolean>(false);
    const [deleting, setDeleting] = React.useState<boolean>(false);

    const [deleteModalOpen, setDeleteModalOpen] = React.useState<boolean>(false);
    const [deleteTarget, setDeleteTarget] = React.useState<Appointment | null>(null);

    const [savingMeeting, setSavingMeeting] = React.useState<boolean>(false);
    const [rescheduleLoading, setRescheduleLoading] = React.useState<Record<string, 'inc' | 'dec' | undefined>>({});

    const modalOpen = Boolean(selectedAppointment);

    const openModal = (app: Appointment) => {
        setSelectedAppointment(app);
        setModalMeetingUrl(app.meetUrl || '');
    };

    const closeModal = () => {
        setSelectedAppointment(null);
        setModalMeetingUrl('');
        setSaving(false);
    };

    const openDeleteModal = (app: Appointment) => {
        setDeleteTarget(app);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        setDeleting(false);
    };

    React.useEffect(() => {
        if (!modalOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modalOpen]);

    React.useEffect(() => {
        const controller = new AbortController();
        const fetchAppointments = async () => {
            setLoading(true);
            setError(null);

            try {
                const QueryParams = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                    search: search,
                    status: status !== 'all' ? status : '',
                });
                const response = await fetch(`/api/admin/appointments?${QueryParams}`, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const data: AppointmentApiResponse = await response.json();
                setAppointments(data.appointments);
                setPagination(data.pagination);
            } catch (error) {
                if (typeof error === 'object' && error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError(String(error) || 'An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
        return () => {
            controller.abort();
        };
    }, [pagination.page, pagination.limit, search, status]);

    const updateAppointment = async (appointmentId: string, opts: { meetingUrl?: string; incrementReschedule?: boolean; decrementReschedule?: boolean } = {}) => {
        if (!appointmentId) return;
        const { meetingUrl, incrementReschedule = false, decrementReschedule = false } = opts;
        if (incrementReschedule && decrementReschedule) {
            toast.error('Cannot increment and decrement reschedule simultaneously.');
            return;
        }

        const isMeetingUpdate = typeof meetingUrl !== 'undefined' && meetingUrl !== undefined;
        try {
            setSaving(true);
            if (isMeetingUpdate) setSavingMeeting(true);
            if (incrementReschedule) setRescheduleLoading(prev => ({ ...prev, [appointmentId]: 'inc' }));
            if (decrementReschedule) setRescheduleLoading(prev => ({ ...prev, [appointmentId]: 'dec' }));

            const response = await fetch(`/api/admin/appointments`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    meetingUrl,
                    incrementReschedule,
                    decrementReschedule,
                }),
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                const msg = body?.error || body.message || 'Failed to update appointment';
                toast.error(msg);
                throw new Error(msg);
            }
            const data = await response.json();
            const updated: Appointment = data.appointment;

            setAppointments((prev) => prev.map(a => a.id === updated.id ? updated : a));
            setSelectedAppointment((curr) => (curr && curr.id === updated.id ? updated : curr));
            setModalMeetingUrl(updated.meetUrl || '');
            toast.success(data.message || 'Appointment updated successfully');
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message, err);
                toast.error(err.message);
            } else {
                const message = String(err || 'An unexpected error occurred');
                console.error(message);
                toast.error(message);
            }
        } finally {
            setSaving(false);
            setSavingMeeting(false);
            setRescheduleLoading(prev => {
                const next = { ...prev };
                delete next[appointmentId];
                return next;
            });
        }
    };

    const deleteAppointment = async (appointmentId: string) => {
        if (!appointmentId) return;
        try {
            setDeleting(true);
            const response = await fetch(`/api/admin/appointments`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId }),
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = body?.error || body?.message || 'Failed to delete appointment';
                throw new Error(msg);
            }

            setAppointments((prev) => prev.filter(a => a.id !== appointmentId));
            setSelectedAppointment((curr) => (curr && curr.id === appointmentId ? null : curr));
            setModalMeetingUrl('');
            toast.success(body.message || 'Appointment deleted successfully');
            closeDeleteModal();
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message, err);
                toast.error(err.message);
            } else {
                const message = String(err || 'An unexpected error occurred');
                console.error(message);
                toast.error(message);
            }
        } finally {
            setDeleting(false);
        }
    };

    const formatDateTime = (iso?: string) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString();
        } catch {
            return iso;
        }
    };

    const formatDate = (iso?: string) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleDateString();
        } catch {
            return iso;
        }
    };

    const formatCurrency = (value?: string, currency = 'INR') => {
        if (!value) return '—';
        const num = Number(value);
        if (Number.isNaN(num)) return value;
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num);
    };

    const isToday = (iso?: string) => {
        if (!iso) return false;
        const d = new Date(iso);
        const t = new Date();
        return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
    };

    return (
        <div className="space-y-4">
            <div className="w-full flex flex-col gap-3">
                <div className="flex gap-2 w-full">
                    <input
                        type="text"
                        placeholder="Search by name, email, agenda..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'all')}
                        className="border p-2 rounded-md"
                    >
                        <option value="all">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    {(search || status !== 'all') && (
                        <button
                            onClick={() => { setSearch(''); setStatus('all'); }}
                            className="ml-2 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 flex items-center gap-1"
                            title="Clear filters"
                        >
                            Clear
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {(search || status !== 'all') && (
                        <>
                            <span className="text-sm text-gray-600">Active Filters:</span>
                            {search && (
                                <span className="flex items-center gap-2 bg-gray-100 text-sm px-2 py-1 rounded">
                                    {search}
                                    <button onClick={() => setSearch('')} className="text-red-500">
                                        <X className="h-4 w-4" />
                                    </button>
                                </span>
                            )}
                            {status !== 'all' && (
                                <span className="flex items-center gap-2 bg-gray-100 text-sm px-2 py-1 rounded">
                                    {status}
                                    <button onClick={() => setStatus('all')} className="text-red-500">
                                        <X className="h-4 w-4" />
                                    </button>
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div>
                {loading && (
                    <>
                        <div className="hidden md:block overflow-x-auto rounded-md border">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Client</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Slot</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type / Price</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Payment</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 py-3 align-top text-sm">
                                                <div className="h-4 w-32 bg-gray-100 rounded" />
                                                <div className="mt-1 h-3 w-40 bg-gray-100 rounded" />
                                            </td>
                                            <td className="px-4 py-3 text-sm"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                            <td className="px-4 py-3 text-sm"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                                            <td className="px-4 py-3 text-sm"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                            <td className="px-4 py-3 text-sm"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                                            <td className="px-4 py-3 text-sm"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                            <td className="px-4 py-3 text-sm"><div className="h-6 w-20 bg-gray-100 rounded" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="border rounded-md p-3 bg-white shadow-sm animate-pulse">
                                    <div className="h-4 w-32 bg-gray-100 rounded" />
                                    <div className="mt-3 space-y-2">
                                        <div className="h-3 w-full bg-gray-100 rounded" />
                                        <div className="h-3 w-5/6 bg-gray-100 rounded" />
                                        <div className="h-3 w-3/4 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {error && <p className="text-red-500">Error: {error}</p>}

                {!loading && !error && appointments.length === 0 && (
                    <p className="text-gray-600">No appointments found.</p>
                )}

                {!loading && !error && appointments.length > 0 && (
                    <>
                        <div className="hidden md:block overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Client</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Slot</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type / Price</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Payment</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y">
                                    {appointments.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 align-top text-sm">
                                                <div className="font-medium">{app.userName}</div>
                                                <div className="text-xs text-gray-500">{app.userEmail}</div>
                                                {app.userPhone && <div className="text-xs text-gray-500">{app.userPhone}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div>{formatDate(app.slot?.date)}</div>
                                                <div className="text-xs text-gray-500">{app.slot?.timeSlot || '—'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium">{app.appointmentType?.title || '—'}</div>
                                                <div className="text-xs text-gray-500">{formatCurrency(app.appointmentType?.price)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {app.payment ? (
                                                    <>
                                                        <div className="text-sm">{app.payment.status}</div>
                                                        <div className="text-xs text-gray-500">{formatCurrency(app.payment.amount, app.payment.currency)}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-500">No payment</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={
                                                    `px-2 py-1 rounded text-xs font-medium ${app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-700'
                                                    }`
                                                }>
                                                    {app.status}
                                                </span>
                                                {app.noofrescheduled > 0 && <div className="text-xs text-gray-500 mt-1">Rescheduled: {app.noofrescheduled}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{formatDateTime(app.createdAt)}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex flex-col">
                                                    <button onClick={() => openModal(app)} className="text-sky-600 text-sm">View</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {appointments.map(app => (
                                <div key={app.id} className="border rounded-md p-3 bg-white shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">{app.userName}</div>
                                            <div className="text-xs text-gray-500">{app.userEmail}</div>
                                        </div>
                                        <div className={`text-xs font-medium ${app.status === 'CONFIRMED' ? 'text-green-700' :
                                            app.status === 'PENDING' ? 'text-yellow-800' : 'text-red-700'
                                            }`}>{app.status}</div>
                                    </div>

                                    <div className="mt-2 text-sm space-y-1">
                                        <div><span className="text-gray-500">Slot:</span> {formatDate(app.slot?.date)} {app.slot?.timeSlot ? ` • ${app.slot.timeSlot}` : ''}</div>
                                        <div><span className="text-gray-500">Type:</span> {app.appointmentType?.title || '—'} {app.appointmentType?.price && <span className="text-gray-600">• {formatCurrency(app.appointmentType.price)}</span>}</div>
                                        <div><span className="text-gray-500">Payment:</span> {app.payment ? `${app.payment.status} (${formatCurrency(app.payment.amount, app.payment.currency)})` : 'No payment'}</div>
                                        <div><span className="text-gray-500">Created:</span> {formatDateTime(app.createdAt)}</div>
                                        {app.noofrescheduled > 0 && <div className="text-gray-500">Reschedules left: {app.noofrescheduled}</div>}
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => openModal(app)} className="text-sky-600 text-sm">View</button>
                                        {isToday(app.slot?.date) && app.meetUrl && (
                                            <a href={app.meetUrl} target="_blank" rel="noreferrer" className="text-white bg-sky-600 px-3 py-1 rounded text-sm">
                                                Join
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <Pagination
                                pagination={pagination}
                                handlePageChange={(v) => setPagination({ ...pagination, page: v })}
                                limit={pagination.limit}
                                setLimit={(v) => setPagination({ ...pagination, limit: v, page: 1 })}
                            />
                        </div>

                        <div className="mt-2 text-xs text-gray-500 italic">
                            Note: Appointment status is derived from payment status — if payment is cancelled or failed the appointment is marked cancelled. If payment succeeds the appointment status becomes success. Pending payments may be auto-deleted after a few hours.
                        </div>
                    </>
                )}
            </div>

            {modalOpen && selectedAppointment && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="absolute inset-0 bg-black opacity-40" onClick={closeModal} />
                    <div className="relative max-w-3xl w-full mx-4 bg-white rounded-lg shadow-lg z-10 overflow-auto max-h-[90vh]">
                        <div className="flex items-start justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                {selectedAppointment.User?.profilePicture ? (
                                    <img src={selectedAppointment.User.profilePicture} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">?</div>
                                )}
                                <div>
                                    <div className="text-lg font-semibold">{selectedAppointment.User?.name || selectedAppointment.userName}</div>
                                    <div className="text-sm text-gray-500">{selectedAppointment.User?.email || selectedAppointment.userEmail}</div>
                                </div>
                            </div>

                            <button onClick={closeModal} className="text-gray-600 hover:text-gray-800 p-1" aria-label="Close">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3 text-sm text-gray-700">
                            <div>
                                <strong>Client:</strong>
                                <div className="text-xs text-gray-500">{selectedAppointment.User?.name || selectedAppointment.userName}</div>
                                <div className="text-xs text-gray-500">{selectedAppointment.User?.email || selectedAppointment.userEmail}</div>
                                {selectedAppointment.userPhone && <div className="text-xs text-gray-500">Phone: {selectedAppointment.userPhone}</div>}
                                {selectedAppointment.User?.createdAt && <div className="text-xs text-gray-500">User created: {formatDateTime(selectedAppointment.User.createdAt)}</div>}
                            </div>

                            <div>
                                <strong>Slot:</strong>
                                <div className="text-xs text-gray-500">Date: {formatDate(selectedAppointment.slot?.date)} {selectedAppointment.slot?.timeSlot ? `• ${selectedAppointment.slot.timeSlot}` : ''}</div>
                                <div className="text-xs text-gray-500">Booked: {selectedAppointment.slot?.isBooked ? 'Yes' : 'No'}</div>
                            </div>

                            <div>
                                <strong>Appointment Type:</strong>
                                <div className="text-xs text-gray-500">Title: {selectedAppointment.appointmentType?.title || '—'}</div>
                                <div className="text-xs text-gray-500">Description: {selectedAppointment.appointmentType?.description && <div className="text-xs text-gray-500">{selectedAppointment.appointmentType.description}</div>}</div>
                                <div className="text-xs text-gray-500">Price: {formatCurrency(selectedAppointment.appointmentType?.price)}</div>
                            </div>

                            <div>
                                <strong>Payment:</strong>
                                {selectedAppointment.payment ? (
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div>ID: {selectedAppointment.payment.id}</div>
                                        <div>Order ID: {selectedAppointment.payment.orderId}</div>
                                        <div>Status: {selectedAppointment.payment.status}</div>
                                        <div>Amount: {formatCurrency(selectedAppointment.payment.amount, selectedAppointment.payment.currency)}</div>
                                        {selectedAppointment.payment.method && <div>Method: {selectedAppointment.payment.method}</div>}
                                        {selectedAppointment.payment.paymentId && <div>Payment ID: {selectedAppointment.payment.paymentId}</div>}
                                        {selectedAppointment.payment.description && <div>Description: {selectedAppointment.payment.description}</div>}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500">No payment information</div>
                                )}
                            </div>

                            <div>
                                <strong>Any message from client:</strong>
                                <div className="text-xs text-gray-500">{selectedAppointment.agenda || '—'}</div>
                            </div>

                            <div>
                                <strong>Meeting URL:</strong>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={modalMeetingUrl}
                                        onChange={(e) => setModalMeetingUrl(e.target.value)}
                                        className="flex-1 border p-2 rounded-md text-sm"
                                        placeholder="https://..."
                                    />
                                    <button
                                        onClick={() => selectedAppointment && updateAppointment(selectedAppointment.id, { meetingUrl: modalMeetingUrl })}
                                        disabled={savingMeeting || deleting || Boolean(selectedAppointment && rescheduleLoading[selectedAppointment.id])}
                                        className="inline-flex items-center gap-2 bg-sky-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                    >
                                        {savingMeeting ? <Loader className="h-4 w-4 animate-spin" /> : 'Save'}
                                    </button>
                                </div>
                                {isToday(selectedAppointment.slot?.date) && modalMeetingUrl && (
                                    <div className="mt-2">
                                        <a href={modalMeetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-sky-600 text-white px-3 py-1 rounded">
                                            Join Meeting
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div>
                                <strong>Reschedule count:</strong>
                                <div className="mt-1 flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (selectedAppointment.noofrescheduled <= 0) {
                                                toast.error('Reschedule count cannot be less than zero.');
                                                return;
                                            }
                                            selectedAppointment && updateAppointment(selectedAppointment.id, { decrementReschedule: true });
                                        }}
                                        disabled={Boolean(selectedAppointment && rescheduleLoading[selectedAppointment.id]) || savingMeeting || selectedAppointment.noofrescheduled <= 0}
                                        className="px-2 py-1 bg-gray-100 rounded text-sm"
                                        title="Decrement reschedule"
                                    >
                                        {selectedAppointment && rescheduleLoading[selectedAppointment.id] === 'dec' ? <Loader className="h-4 w-4 animate-spin" /> : '-'}
                                    </button>
                                    <span className="text-xs text-gray-600">Current: {selectedAppointment.noofrescheduled}</span>
                                    <button
                                        onClick={() => selectedAppointment && updateAppointment(selectedAppointment.id, { incrementReschedule: true })}
                                        disabled={Boolean(selectedAppointment && rescheduleLoading[selectedAppointment.id]) || savingMeeting}
                                        className="px-2 py-1 bg-gray-100 rounded text-sm"
                                        title="Increment reschedule"
                                    >
                                        {selectedAppointment && rescheduleLoading[selectedAppointment.id] === 'inc' ? <Loader className="h-4 w-4 animate-spin" /> : '+'}
                                    </button>

                                </div>
                            </div>

                            <div className="mt-3">
                                <button
                                    onClick={() => selectedAppointment && openDeleteModal(selectedAppointment)}
                                    disabled={deleting}
                                    className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                >
                                    {deleting ? 'Processing...' : 'Delete appointment'}
                                </button>
                                <div className="text-xs text-gray-500 mt-2">
                                    Note: Only appointments without payment or with PENDING payment can be deleted here. Appointments with successful payments cannot be deleted from this panel.
                                </div>
                            </div>

                            <div className="flex gap-4 text-xs text-gray-500">
                                <div>Created: {formatDateTime(selectedAppointment.createdAt)}</div>
                                <div>Updated: {formatDateTime(selectedAppointment.updatedAt)}</div>
                                <div>Reschedules left: {selectedAppointment.noofrescheduled}</div>
                            </div>

                            <details className="text-xs text-gray-600">
                                <summary className="cursor-pointer">Show raw data</summary>
                                <pre className="bg-gray-50 p-2 rounded overflow-auto mt-2">{JSON.stringify(selectedAppointment, null, 2)}</pre>
                            </details>
                        </div>
                    </div>
                </div>
            )}

            {deleteModalOpen && deleteTarget && (
                <div className="fixed inset-0 z-60 flex items-center justify-center" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={closeDeleteModal} />
                    <div className="relative max-w-lg w-full mx-4 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
                        <div className="p-4 border-b flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                                <p className="text-sm text-gray-600 mt-1">This will permanently delete the appointment if allowed.</p>
                            </div>
                            <button onClick={closeDeleteModal} className="text-gray-600 hover:text-gray-800 p-1" aria-label="Close">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 text-sm text-gray-700 space-y-3">
                            <div>
                                <strong>Client:</strong>
                                <div className="text-xs text-gray-500">{deleteTarget.User?.name || deleteTarget.userName} • {deleteTarget.User?.email || deleteTarget.userEmail}</div>
                            </div>
                            <div>
                                <strong>Slot:</strong>
                                <div className="text-xs text-gray-500">{formatDate(deleteTarget.slot?.date)} {deleteTarget.slot?.timeSlot ? `• ${deleteTarget.slot.timeSlot}` : ''}</div>
                            </div>
                            <div>
                                <strong>Payment status:</strong>
                                <div className="text-xs text-gray-500">{deleteTarget.payment ? deleteTarget.payment.status : 'No payment'}</div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={closeDeleteModal}
                                    disabled={deleting}
                                    className="px-3 py-1 rounded border bg-white text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteAppointment(deleteTarget.id)}
                                    disabled={deleting}
                                    className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                            <div className="text-xs text-gray-500">
                                Only appointments without payment or with PENDING payment can be deleted. Appointments with successful payments cannot be deleted from this panel.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppointmentManagement
