"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface AppointmentType {
    id: string;
    title: string;
    subTitle: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    price: number;
    isActive: boolean;
}

const AppointmentTypes = () => {
    const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        subTitle: '',
        description: '',
        price: '',
        isActive: true,
    });
    
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AppointmentType | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchAppointmentTypes();
    }, []);

    async function fetchAppointmentTypes() {
        setLoading(true);
        try {
            const response = await fetch('/api/appointment-type?activeOnly=false');
            const data = await response.json();
            if (data.success) {
                const types = (data.appointmentTypes || []).map((a: any) => ({
                    ...a,
                    price: Math.round(Number(a.price ?? 0) * 100) / 100,
                }));
                setAppointmentTypes(types);
            } else {
                toast.error(data.error || 'Failed to load');
            }
        } catch (error) {
            toast.error('Server error while fetching Service Types');
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormErrors((prev) => {
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePriceBlur = () => {
        const raw = (formData.price || '').toString().replace(',', '.');
        const parsed = parseFloat(raw || '0');
        const rounded = isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
        setFormData((prev) => ({ ...prev, price: rounded.toFixed(2) }));
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            id: '',
            title: '',
            subTitle: '',
            description: '',
            price: '',
            isActive: true,
        });
        setFormErrors({});
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.title?.trim()) errors.title = 'Title is required';
        if (!formData.subTitle?.trim()) errors.subTitle = 'Sub-service type is required';
        
        const rawPrice = (formData.price || '').toString().trim().replace(',', '.');
        if (rawPrice.length > 0) {
            const parsed = Number(rawPrice);
            if (isNaN(parsed)) errors.price = 'Price must be a number';
            else if (parsed < 0) errors.price = 'Price cannot be negative';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const isEdit = !!editingItem;
            const method = isEdit ? 'PUT' : 'POST';
            const normalizedPrice = Math.round(Number((formData.price || '0').toString().replace(',', '.')) * 100) / 100;

            const payload: any = {
                title: formData.title.trim(),
                subTitle: formData.subTitle.trim(),
                description: formData.description.trim() || null,
                price: normalizedPrice,
                isActive: Boolean(formData.isActive),
            };
            if (isEdit) payload.id = editingItem?.id;

            const response = await fetch('/api/appointment-type', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.success) {
                const returned = {
                    ...data.appointmentType,
                    price: Math.round(Number(data.appointmentType?.price ?? 0) * 100) / 100,
                };
                if (isEdit) {
                    setAppointmentTypes(prev => prev.map(a => a.id === returned.id ? returned : a));
                    toast.success('Updated successfully');
                } else {
                    setAppointmentTypes(prev => [returned, ...prev]);
                    toast.success('Created successfully');
                }
                setIsDialogOpen(false);
                resetForm();
            } else {
                toast.error(data.error || 'Operation failed');
            }
        } catch (error) {
            toast.error('Server error while saving');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: AppointmentType) => {
        setEditingItem(item);
        setFormData({
            id: item.id,
            title: item.title,
            subTitle: item.subTitle || '',
            description: item.description || '',
            price: (Number(item.price || 0)).toFixed(2),
            isActive: item.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        setDeletingIds(prev => ({ ...prev, [id]: true }));
        try {
            const response = await fetch('/api/appointment-type', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.success) {
                setAppointmentTypes(prev => prev.filter(a => a.id !== id));
                toast.success('Deleted successfully');
            } else {
                toast.error(data.error || 'Delete failed');
            }
        } catch (error) {
            toast.error('Server error while deleting');
        } finally {
            setDeletingIds(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        }
    };

    const formatPrice = (n: number) => {
        return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Appointment Types</h1>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Add New
                    </Button>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Appointment Type" : "Create Appointment Type"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Service Type</Label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Consultation"
                                />
                                {formErrors.title && <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>}
                            </div>

                            <div>
                                <Label>Sub-Service Type</Label>
                                <Input
                                    name="subTitle"
                                    value={formData.subTitle}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Marriage Consultation"
                                />
                                {formErrors.subTitle && <p className="text-xs text-red-600 mt-1">{formErrors.subTitle}</p>}
                            </div>

                            <div>
                                <Label>Price (INR)</Label>
                                <Input
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    onBlur={handlePriceBlur}
                                />
                                {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Short description..."
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, isActive: !!val }))}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Saving..." : (editingItem ? "Update" : "Create")}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
                    <div className="p-4 border-b bg-gray-50/50">
                        <div className="text-sm font-medium text-gray-700">Service Offerings</div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : appointmentTypes.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No types found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointmentTypes.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{item.title}</div>
                                                <div className="text-xs text-indigo-600">{item.subTitle}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">
                                                {item.description || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{formatPrice(item.price)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {item.isActive ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={deletingIds[item.id]}
                                                    >
                                                        {deletingIds[item.id] ? "..." : "Delete"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentTypes;