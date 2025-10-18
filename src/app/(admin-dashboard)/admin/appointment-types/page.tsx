/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from 'react'
import { toast } from 'sonner';

interface AppointmentType {
    description: string | null;
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    price: number;
    isActive: boolean;
};
const AppointmentTypes = () => {
    const [appointmentTypes, setAppointmentTypes] = React.useState<AppointmentType[]>([]);
    const [formData, setFormData] = React.useState({
        id: '',
        title: '',
        description: '',
        price: '', // string now
        isActive: true,
    });
    const [loading, setLoading] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    // New UI / validation states
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
    const [saving, setSaving] = React.useState(false);
    const [deletingIds, setDeletingIds] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        async function fetchAppointmentTypes() {
            setLoading(true);
            try {
                const response = await fetch('/api/appointment-type?activeOnly=false');
                const data = await response.json();
                if (data.success) {
                    const types = (data.appointmentTypes || []).map((a: any) => ({
                        ...a,
                        // round to 2 decimals (rupee & paisa)
                        price: Math.round(Number(a.price ?? 0) * 100) / 100,
                    }));
                    setAppointmentTypes(types);
                } else {
                    toast.error(data.error || 'Failed to load');
                    setMessage({ type: 'error', text: data.error || 'Failed to load' });
                }
            } catch (error) {
                toast.error('Server error while fetching appointment types');
                console.error('Error fetching appointment types:', error);
                setMessage({ type: 'error', text: 'Server error while fetching appointment types' });
            } finally {
                setLoading(false);
            }
        }

        fetchAppointmentTypes();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        // Clear field-level error on change
        setFormErrors((prev) => {
            if (!prev[name]) return prev;
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });
        if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: (target as HTMLInputElement).checked,
            }));
            return;
        }
        // For price keep raw string while typing; normalize on blur
        if (name === 'price') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
            return;
        }
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Normalize price to two decimals on blur
    const handlePriceBlur = () => {
        const raw = (formData.price || '').toString().replace(',', '.');
        const parsed = parseFloat(raw || '0');
        const rounded = isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
        setFormData((prev) => ({ ...prev, price: rounded.toFixed(2) }));
    };

    const resetForm = () => {
        setFormData({
            id: '',
            title: '',
            description: '',
            price: '',
            isActive: true,
        });
        setEditingId(null);
        setFormErrors({});
    };

    // Updated submit with validation and saving UI
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Client-side validation
        const errors: Record<string, string> = {};
        if (!formData.title || formData.title.trim().length === 0) {
            errors.title = 'Title is required';
        }
        // Validate price if provided (allow empty -> treat as 0)
        const rawPrice = (formData.price || '').toString().trim().replace(',', '.');
        if (rawPrice.length > 0) {
            const parsed = Number(rawPrice);
            if (isNaN(parsed)) {
                errors.price = 'Price must be a number';
            } else if (parsed < 0) {
                errors.price = 'Price cannot be negative';
            } else {
                // check decimals
                const parts = rawPrice.split('.');
                if (parts[1] && parts[1].length > 2) {
                    errors.price = 'Maximum two decimal places allowed';
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setMessage({ type: 'error', text: 'Please fix validation errors before submitting.' });
            return;
        }

        setSaving(true);
        try {
            const isEdit = Boolean(editingId);
            const method = isEdit ? 'PUT' : 'POST';
            const normalizedPrice = Math.round(Number((formData.price || '0').toString().replace(',', '.')) * 100) / 100;
            const payload: any = {
                title: formData.title.trim(),
                description: formData.description,
                price: normalizedPrice,
                isActive: Boolean(formData.isActive),
            };
            if (isEdit) payload.id = editingId;

            const response = await fetch('/api/appointment-type', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (data.success) {
                // Ensure price is numeric on returned object
                const returned = {
                    ...data.appointmentType,
                    price: Math.round(Number(data.appointmentType?.price ?? 0) * 100) / 100,
                };
                if (isEdit) {
                    setAppointmentTypes((prev) =>
                        prev.map((a) => (a.id === returned.id ? returned : a))
                    );
                    setMessage({ type: 'success', text: 'Appointment type updated' });
                } else {
                    setAppointmentTypes((prev) => [returned, ...prev]);
                    setMessage({ type: 'success', text: 'Appointment type created' });
                }
                resetForm();
            } else {
                // server returned error - show details if available
                const errText = data.error || 'Operation failed';
                const details = data.details ? `: ${data.details}` : '';
                setMessage({ type: 'error', text: `${errText}${details}` });
            }
        } catch (error) {
            console.error('Error saving appointment type:', error);
            setMessage({ type: 'error', text: 'Server error while saving' });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: AppointmentType) => {
        setEditingId(item.id);
        setFormData({
            id: item.id,
            title: item.title,
            description: item.description || '',
            // populate price as formatted string so user sees two decimals
            price: (Number(item.price || 0)).toFixed(2),
            isActive: item.isActive,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    // Enhanced delete with per-item loading and better messaging when deletion is not allowed
    const handleDelete = async (id: string) => {
        const ok = confirm('Are you sure you want to delete this appointment type? This will archive it.');
        if (!ok) return;
        // set deleting flag for the id
        setDeletingIds((prev) => ({ ...prev, [id]: true }));
        try {
            const response = await fetch('/api/appointment-type', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.success) {
                // remove from list (API marks isActive false)
                setAppointmentTypes((prev) => prev.filter((a) => a.id !== id));
                setMessage({ type: 'success', text: 'Appointment type deleted' });
            } else {
                // If API indicates this type is in use, suggest archive
                if (data.usedByBookings) {
                    setMessage({ type: 'error', text: 'Cannot delete: this type is used by existing bookings. You can archive it instead so it won\'t be shown to new users.' });
                } else {
                    setMessage({ type: 'error', text: data.error || 'Delete failed' });
                }
            }
        } catch (error) {
            console.error('Error deleting appointment type:', error);
            setMessage({ type: 'error', text: 'Server error while deleting' });
        } finally {
            setDeletingIds((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        }
    };

    React.useEffect(() => {
        let timer: number | undefined;
        if (message) {
            // auto-dismiss after 4s
            timer = window.setTimeout(() => setMessage(null), 4000);
        }
        return () => {
            if (timer) window.clearTimeout(timer);
        };
    }, [message]);

    const formatPrice = (n: number) => {
        // Ensure number and format for en-IN with 2 decimals, prefix with ₹
        const num = Number(n ?? 0);
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div aria-live="polite" className="h-8">
                    {message && (
                        <div
                            className={`mb-4 flex items-center gap-3 p-3 rounded transition-colors ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                }`}
                            role={message.type === 'success' ? 'status' : 'alert'}
                        >
                            {/* Success / Error icon */}
                            {message.type === 'success' ? (
                                <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 5z" clipRule="evenodd" />
                                </svg>
                            )}
                            <div className="text-sm">{message.text}</div>
                        </div>
                    )}
                </div>

                {/* Form card */}
                <div className="bg-white shadow rounded-lg p-4 sm:p-5 mb-3 sm:mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="e.g. Consultation"
                                    disabled={saving}
                                />
                                {formErrors.title && <div className="text-xs text-red-600 mt-1">{formErrors.title}</div>}
                            </div>

                            <div className="flex items-end">
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)</label>
                                    <input
                                        name="price"
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*[.,]?[0-9]*"
                                        // bind to string so typing isn't interrupted
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        onBlur={handlePriceBlur}
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        disabled={saving}
                                    />
                                    {formErrors.price && <div className="text-xs text-red-600 mt-1">{formErrors.price}</div>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="Short description for this appointment type"
                                disabled={saving}
                            />
                            {formErrors.description && <div className="text-xs text-red-600 mt-1">{formErrors.description}</div>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={Boolean(formData.isActive)}
                                    onChange={handleInputChange}
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    disabled={saving}
                                />
                                Active
                            </label>

                            <div className="space-x-2">
                                {editingId ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                                                    </svg>
                                                    <span>Updating...</span>
                                                </>
                                            ) : 'Update'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                                                </svg>
                                                <span>Creating...</span>
                                            </>
                                        ) : 'Create'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* List / table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-3 sm:p-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">List of appointment types</div>
                            <div className="text-xs text-gray-500">Manage your offerings</div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-3 sm:p-4">
                            <div className="space-y-3">
                                {/* small top-line spinner + hint */}
                                <div className="flex items-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                                    </svg>
                                    <div className="text-sm text-gray-600">Loading appointment types…</div>
                                </div>

                                {/* skeleton table placeholder */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 hidden md:table-cell">Description</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <tr key={idx} className="animate-pulse">
                                                    <td className="px-4 py-3">
                                                        <div className="h-4 bg-gray-200 rounded w-40 md:w-48" />
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <div className="h-4 bg-gray-200 rounded w-56" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="inline-flex items-center space-x-2">
                                                            <div className="h-8 w-14 bg-gray-200 rounded" />
                                                            <div className="h-8 w-14 bg-gray-200 rounded" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : appointmentTypes.length === 0 ? (
                        <div className="p-4 sm:p-6 text-center text-gray-600">
                            <div className="text-sm mb-2">No appointment types found.</div>
                            <div className="text-xs text-gray-500">Create one using the form above.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 hidden md:table-cell">Description</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {appointmentTypes.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 text-sm text-gray-800">{item.title}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                                                {item.description ? item.description : <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{formatPrice(item.price)}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {item.isActive ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">Active</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600">Archived</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <div className="inline-flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        disabled={saving}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        disabled={Boolean(deletingIds[item.id])}
                                                    >
                                                        {deletingIds[item.id] ? (
                                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                                                            </svg>
                                                        ) : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Admin note about delete vs archive */}
                <div className="mt-3 sm:mt-4 max-w-7xl mx-auto">
                    <div className="text-xs text-gray-600">
                        <strong>Note for admins:</strong> If an appointment type is used in existing user bookings it cannot be deleted. Instead archive the appointment type (set it to inactive) so it won&apos;t be shown to new users booking appointments.
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AppointmentTypes;