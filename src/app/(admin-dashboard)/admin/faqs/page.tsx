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

interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
}

export default function FAQsPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQ | null>(null);

    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        order: 0,
        isActive: true,
    });

    const fetchFaqs = async () => {
        try {
            const res = await fetch("/api/admin/faqs");
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            setFaqs(data);
        } catch (error) {
            toast.error("Failed to load FAQs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingItem
                ? `/api/admin/faqs/${editingItem.id}`
                : "/api/admin/faqs";

            const method = editingItem ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Operation failed");

            toast.success(editingItem ? "FAQ updated" : "FAQ created");
            setIsDialogOpen(false);
            fetchFaqs();
            resetForm();
        } catch (error) {
            toast.error((error as Error).message || "Failed to save FAQ");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this FAQ?")) return;
        try {
            const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("FAQ deleted");
            fetchFaqs();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleToggleActive = async (item: FAQ) => {
        try {
            const res = await fetch(`/api/admin/faqs/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !item.isActive }),
            });
            if (!res.ok) throw new Error("Failed");

            setFaqs(faqs.map(f => f.id === item.id ? { ...f, isActive: !f.isActive } : f));
            toast.success(`FAQ ${!item.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            question: "",
            answer: "",
            order: 0,
            isActive: true,
        });
    };

    const openEdit = (item: FAQ) => {
        setEditingItem(item);
        setFormData({
            question: item.question,
            answer: item.answer,
            order: item.order,
            isActive: item.isActive,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add FAQ
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="question">Question <span className="text-red-500">*</span></Label>
                                <Input
                                    id="question"
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="answer">Answer <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="answer"
                                    value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                    required
                                    className="h-32"
                                />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="space-y-2 w-32">
                                    <Label htmlFor="order">Display Order</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Checkbox
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
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
                            <TableHead>Question</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : faqs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">No FAQs found.</TableCell>
                            </TableRow>
                        ) : (
                            faqs.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.order}</TableCell>
                                    <TableCell className="font-medium max-w-md truncate">{item.question}</TableCell>
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
