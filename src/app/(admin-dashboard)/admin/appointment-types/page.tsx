"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface AppointmentType {
    description: string | null;
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    price: number;
    isActive: boolean;
}

export default function AppointmentTypesPage() {
    const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AppointmentType | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const fetchAppointmentTypes = async () => {
        setLoading(true);
        try {
            // Using activeOnly=false to see all for admin
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
            toast.error('Server error while fetching appointment types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointmentTypes();
    }, []);

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            title: "",
            description: "",
            price: "",
            isActive: true,
        });
        setFormErrors({});
    };

    const openCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEdit = (item: AppointmentType) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || "",
            price: (Number(item.price || 0)).toFixed(2),
            isActive: item.isActive,
        });
        setFormErrors({});
        setIsDialogOpen(true);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.title || formData.title.trim().length === 0) {
            errors.title = 'Title is required';
        }
        const rawPrice = (formData.price || '').toString().trim().replace(',', '.');
        if (rawPrice.length > 0) {
            const parsed = Number(rawPrice);
            if (isNaN(parsed)) {
                errors.price = 'Price must be a number';
            } else if (parsed < 0) {
                errors.price = 'Price cannot be negative';
            } else {
                const parts = rawPrice.split('.');
                if (parts[1] && parts[1].length > 2) {
                    errors.price = 'Maximum two decimal places allowed';
                }
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix validation errors");
            return;
        }

        setSubmitting(true);
        try {
            const isEdit = !!editingItem;
            const method = isEdit ? 'PUT' : 'POST';
            const normalizedPrice = Math.round(Number((formData.price || '0').toString().replace(',', '.')) * 100) / 100;

            const payload: any = {
                title: formData.title.trim(),
                description: formData.description,
                price: normalizedPrice,
                isActive: Boolean(formData.isActive),
            };
            if (isEdit && editingItem) payload.id = editingItem.id;

            const response = await fetch('/api/appointment-type', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.success) {
                toast.success(isEdit ? "Appointment type updated" : "Appointment type created");
                setIsDialogOpen(false);
                fetchAppointmentTypes(); // Refresh list
            } else {
                toast.error(data.error || 'Operation failed');
            }
        } catch (error) {
            toast.error('Server error while saving');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = confirm('Are you sure you want to delete this appointment type? This will archive it.');
        if (!ok) return;

        try {
            const response = await fetch('/api/appointment-type', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Appointment type deleted');
                fetchAppointmentTypes();
            } else {
                if (data.usedByBookings) {
                    toast.error('Cannot delete: type used by bookings. Archive instead.');
                } else {
                    toast.error(data.error || 'Delete failed');
                }
            }
        } catch (error) {
            toast.error('Server error while deleting');
        }
    };

    const handleToggleActive = async (item: AppointmentType) => {
        try {
            const payload = {
                id: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                isActive: !item.isActive,
            };

            const response = await fetch('/api/appointment-type', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Appointment type ${!item.isActive ? 'activated' : 'archived'}`);
                setAppointmentTypes(prev => prev.map(a => a.id === item.id ? { ...a, isActive: !item.isActive } : a));
            } else {
                toast.error(data.error || "Failed to update status");
            }

        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const formatPrice = (n: number) => {
        const num = Number(n ?? 0);
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Appointment Types</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your service offerings and pricing</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Type
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Appointment Type" : "Create Appointment Type"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                                }}
                                required
                                placeholder="e.g. Consultation"
                            />
                            {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price (INR)</Label>
                            <Input
                                id="price"
                                value={formData.price}
                                onChange={e => {
                                    setFormData({ ...formData, price: e.target.value });
                                    if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                                }}
                                onBlur={() => {
                                    const raw = (formData.price || '').replace(',', '.');
                                    const parsed = parseFloat(raw || '0');
                                    const rounded = isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
                                    setFormData(prev => ({ ...prev, price: rounded.toFixed(2) }));
                                }}
                                placeholder="0.00"
                            />
                            {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short description..."
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
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

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : appointmentTypes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">No appointment types found.</TableCell>
                            </TableRow>
                        ) : (
                            appointmentTypes.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-xs truncate" title={item.description || ""}>
                                        {item.description || <span className="text-gray-400">—</span>}
                                    </TableCell>
                                    <TableCell>{formatPrice(item.price)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant={item.isActive ? "default" : "secondary"}
                                            size="sm"
                                            className={`h-6 text-xs ${item.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                                            onClick={() => handleToggleActive(item)}
                                        >
                                            {item.isActive ? "Active" : "Archived"}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4 text-xs text-gray-500">
                <strong>Note:</strong> Types used in bookings cannot be fully deleted; they will be archived instead.
            </div>
        </div>
    );
}