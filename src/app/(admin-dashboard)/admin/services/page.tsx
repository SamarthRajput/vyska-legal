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

interface Service {
    id: string;
    title: string;
    description: string;
    order: number;
    isActive: boolean;
}

export default function ServicesAdminPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Service | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        order: 0,
        isActive: true,
    });

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/admin/services");
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            setServices(data);
        } catch (error) {
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingItem
                ? `/api/admin/services/${editingItem.id}`
                : "/api/admin/services";

            const method = editingItem ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Operation failed");

            toast.success(editingItem ? "Service updated" : "Service created");
            setIsDialogOpen(false);
            fetchServices();
            resetForm();
        } catch (error) {
            toast.error((error as Error).message || "Failed to save service");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this service?")) return;
        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Service deleted");
            fetchServices();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleToggleActive = async (item: Service) => {
        try {
            const res = await fetch(`/api/admin/services/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !item.isActive }),
            });
            if (!res.ok) throw new Error("Failed");

            setServices(services.map(t => t.id === item.id ? { ...t, isActive: !t.isActive } : t));
            toast.success(`Service ${!item.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            title: "",
            description: "",
            order: 0,
            isActive: true,
        });
    };

    const openEdit = (item: Service) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            order: item.order,
            isActive: item.isActive,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Services (Practice Areas)</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Service
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Service" : "Add New Service"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Corporate Law"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    className="h-32"
                                    placeholder="Short description of the practice area"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : (editingItem ? "Update" : "Create")}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : services.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">No services found.</TableCell>
                            </TableRow>
                        ) : (
                            services.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.order}</TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell className="max-w-md truncate" title={item.description}>{item.description}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant={item.isActive ? "default" : "secondary"}
                                            size="sm"
                                            className={`h-6 text-xs ${item.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                                            onClick={() => handleToggleActive(item)}
                                        >
                                            {item.isActive ? "Active" : "Inactive"}
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
        </div>
    );
}
