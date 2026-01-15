"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Linkedin, Twitter, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
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

interface TeamMember {
    id: string;
    name: string;
    role: string;
    biography: string | null;
    photoUrl: string | null;
    linkedin: string | null;
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    createdAt: string;
}

export default function ManageTeamMembers() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TeamMember | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        biography: "",
        photoUrl: "",
        linkedin: "",
        twitter: "",
        instagram: "",
        facebook: "",
    });

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/admin/team-member");
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            setMembers(data);
        } catch (error) {
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = "/api/admin/team-member";
            const method = editingItem ? "PUT" : "POST";

            const body = editingItem
                ? { ...formData, id: editingItem.id }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Operation failed");

            toast.success(editingItem ? "Member updated" : "Member added");
            setIsDialogOpen(false);
            fetchMembers();
            resetForm();
        } catch (error) {
            toast.error((error as Error).message || "Failed to save member");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this team member?")) return;
        try {
            const res = await fetch(`/api/admin/team-member?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Member deleted");
            fetchMembers();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            name: "",
            role: "",
            biography: "",
            photoUrl: "",
            linkedin: "",
            twitter: "",
            instagram: "",
            facebook: "",
        });
    };

    const openEdit = (item: TeamMember) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            role: item.role,
            biography: item.biography || "",
            photoUrl: item.photoUrl || "",
            linkedin: item.linkedin || "",
            twitter: item.twitter || "",
            instagram: item.instagram || "",
            facebook: item.facebook || "",
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                                <Input
                                    id="role"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    placeholder="e.g. Senior Partner"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="biography">Biography</Label>
                                <Textarea
                                    id="biography"
                                    value={formData.biography}
                                    onChange={e => setFormData({ ...formData, biography: e.target.value })}
                                    className="h-24"
                                    placeholder="Brief professional background"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <ImageUpload
                                    label="Photo"
                                    value={formData.photoUrl}
                                    onChange={(url) => setFormData({ ...formData, photoUrl: url || "" })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="linkedin" className="flex items-center gap-2"><Linkedin className="w-3 h-3" /> LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    value={formData.linkedin}
                                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                    placeholder="Profile URL"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter" className="flex items-center gap-2"><Twitter className="w-3 h-3" /> Twitter/X</Label>
                                <Input
                                    id="twitter"
                                    value={formData.twitter}
                                    onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                                    placeholder="Profile URL"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="w-3 h-3" /> Instagram</Label>
                                <Input
                                    id="instagram"
                                    value={formData.instagram}
                                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                    placeholder="Profile URL"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook" className="flex items-center gap-2"><Facebook className="w-3 h-3" /> Facebook</Label>
                                <Input
                                    id="facebook"
                                    value={formData.facebook}
                                    onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                                    placeholder="Profile URL"
                                />
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
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="hidden md:table-cell">Biography</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">No team members found.</TableCell>
                            </TableRow>
                        ) : (
                            members.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {item.photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={item.photoUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                                    {item.name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.role}</TableCell>
                                    <TableCell className="max-w-xs truncate hidden md:table-cell text-muted-foreground" title={item.biography || ""}>
                                        {item.biography}
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
