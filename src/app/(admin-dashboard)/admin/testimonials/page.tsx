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

interface Testimonial {
    id: string;
    name: string;
    caseType: string;
    message: string;
    imageUrl?: string;
    order: number;
    isActive: boolean;
}

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        caseType: "",
        message: "",
        imageUrl: "",
        order: 0,
        isActive: true,
    });

    const fetchTestimonials = async () => {
        try {
            const res = await fetch("/api/admin/testimonials");
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            setTestimonials(data);
        } catch (error) {
            toast.error("Failed to load testimonials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingItem
                ? `/api/admin/testimonials/${editingItem.id}`
                : "/api/admin/testimonials";

            const method = editingItem ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Operation failed");

            toast.success(editingItem ? "Testimonial updated" : "Testimonial created");
            setIsDialogOpen(false);
            fetchTestimonials();
            resetForm();
        } catch (error) {
            toast.error((error as Error).message || "Failed to save testimonial");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this testimonial?")) return;
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Testimonial deleted");
            fetchTestimonials();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleToggleActive = async (item: Testimonial) => {
        try {
            const res = await fetch(`/api/admin/testimonials/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !item.isActive }),
            });
            if (!res.ok) throw new Error("Failed");

            setTestimonials(testimonials.map(t => t.id === item.id ? { ...t, isActive: !t.isActive } : t));
            toast.success(`Testimonial ${!item.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            name: "",
            caseType: "",
            message: "",
            imageUrl: "",
            order: 0,
            isActive: true,
        });
    };

    const openEdit = (item: Testimonial) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            caseType: item.caseType,
            message: item.message,
            imageUrl: item.imageUrl || "",
            order: item.order,
            isActive: item.isActive,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Client Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caseType">Case Type <span className="text-red-500">*</span></Label>
                                <Input
                                    id="caseType"
                                    value={formData.caseType}
                                    onChange={e => setFormData({ ...formData, caseType: e.target.value })}
                                    required
                                    placeholder="e.g. Family Law"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    className="h-32"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="imageUrl">Client Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
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
                            <TableHead>Client</TableHead>
                            <TableHead>Case Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : testimonials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">No testimonials found.</TableCell>
                            </TableRow>
                        ) : (
                            testimonials.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.order}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {item.imageUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                                            )}
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.caseType}</TableCell>
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
