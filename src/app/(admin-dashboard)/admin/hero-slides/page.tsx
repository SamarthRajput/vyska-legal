"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface HeroSlide {
    id: string;
    title: string;
    highlight?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl: string;
    order: number;
    type?: string;
    bgColor?: string;
    isActive: boolean;
}

const GRADIENT_OPTIONS = [
    { label: "Classic Blue", value: "from-blue-900 to-slate-900" },
    { label: "Deep Slate", value: "from-slate-900 to-gray-800" },
    { label: "Royal Indigo", value: "from-indigo-900 to-slate-900" },
    { label: "Midnight Purple", value: "from-purple-900 to-gray-900" },
    { label: "Emerald Dark", value: "from-emerald-900 to-slate-900" },
    { label: "Rich Red", value: "from-red-900 to-slate-900" },
];

export default function HeroSlidesPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        highlight: "",
        description: "",
        buttonText: "",
        buttonLink: "",
        imageUrl: "",
        order: 0,
        isActive: true,
        type: "split",
        bgColor: GRADIENT_OPTIONS[0].value,
    });

    const fetchSlides = async () => {
        try {
            const res = await fetch("/api/admin/hero-slides");
            if (!res.ok) throw new Error("Failed to fetch slides");
            const data = await res.json();
            setSlides(data);
        } catch (error) {
            toast.error("Failed to load hero slides");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingSlide
                ? `/api/admin/hero-slides/${editingSlide.id}`
                : "/api/admin/hero-slides";

            const method = editingSlide ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Operation failed");
            }

            toast.success(editingSlide ? "Slide updated active" : "Slide created");
            setIsDialogOpen(false);
            fetchSlides();
            resetForm();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this slide?")) return;
        try {
            const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Slide deleted");
            fetchSlides();
        } catch (error) {
            toast.error("Failed to delete slide");
        }
    };

    const handleToggleActive = async (slide: HeroSlide) => {
        try {
            const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !slide.isActive }),
            });
            if (!res.ok) throw new Error("Failed to toggle status");

            setSlides(slides.map(s => s.id === slide.id ? { ...s, isActive: !s.isActive } : s));
            toast.success(`Slide ${!slide.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    const resetForm = () => {
        setEditingSlide(null);
        setFormData({
            title: "",
            highlight: "",
            description: "",
            buttonText: "",
            buttonLink: "",
            imageUrl: "",
            order: 0,
            isActive: true,
            type: "split",
            bgColor: GRADIENT_OPTIONS[0].value,
        });
    };

    const openEdit = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setFormData({
            title: slide.title,
            highlight: slide.highlight || "",
            description: slide.description || "",
            buttonText: slide.buttonText || "",
            buttonLink: slide.buttonLink || "",
            imageUrl: slide.imageUrl,
            order: slide.order,
            isActive: slide.isActive,
            type: slide.type || "split",
            bgColor: slide.bgColor || GRADIENT_OPTIONS[0].value,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Hero Slides</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Slide
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSlide ? "Edit Slide" : "Add New Slide"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Section 1: Content */}
                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">Text Content</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Main Headline"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="highlight">Highlight Text</Label>
                                    <Input
                                        id="highlight"
                                        value={formData.highlight}
                                        onChange={e => setFormData({ ...formData, highlight: e.target.value })}
                                        placeholder="Text to highlight in blue/white"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Subtext description..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Media & Style */}
                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">Appearance & Media</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="imageUrl">Image URL <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        required
                                        placeholder="/images/hero-1.jpg or External URL"
                                    />
                                    {formData.imageUrl && (
                                        <div className="mt-2 relative h-32 w-full bg-gray-100 rounded-md overflow-hidden border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="type">Layout Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select layout" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="split">Split (Text Left, Image Right)</SelectItem>
                                            <SelectItem value="fullBackground">Full Background Image</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="bgColor">Background Theme</Label>
                                    <Select
                                        value={formData.bgColor}
                                        onValueChange={(value) => setFormData({ ...formData, bgColor: value })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRADIENT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${option.value}`} />
                                                        <span>{option.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className={`mt-2 h-8 w-full rounded md bg-gradient-to-br ${formData.bgColor || 'bg-gray-200'}`} />
                                </div>
                            </div>
                        </div>


                        {/* Section 3: Actions & Settings */}
                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">Actions & Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="buttonText">Button Text</Label>
                                    <Input
                                        id="buttonText"
                                        value={formData.buttonText}
                                        onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                                        placeholder="e.g. Get Started"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="buttonLink">Button Link</Label>
                                    <Input
                                        id="buttonLink"
                                        value={formData.buttonLink}
                                        onChange={e => setFormData({ ...formData, buttonLink: e.target.value })}
                                        placeholder="e.g. /contact"
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
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingSlide ? "Update Slide" : "Create Slide"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Preview</TableHead>
                            <TableHead>Info</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : slides.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">No slides found. Create one!</TableCell>
                            </TableRow>
                        ) : (
                            slides.map((slide) => (
                                <TableRow key={slide.id}>
                                    <TableCell>{slide.order}</TableCell>
                                    <TableCell>
                                        <div className="h-12 w-20 relative rounded overflow-hidden bg-gray-100 border group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-contain" />
                                            {slide.type === 'fullBackground' && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Full BG
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate max-w-[200px]">{slide.title}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{slide.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant={slide.isActive ? "default" : "secondary"}
                                            size="sm"
                                            className={`h-6 text-xs w-20 ${slide.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                                            onClick={() => handleToggleActive(slide)}
                                        >
                                            {slide.isActive ? "Active" : "Inactive"}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(slide.id)}>
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
