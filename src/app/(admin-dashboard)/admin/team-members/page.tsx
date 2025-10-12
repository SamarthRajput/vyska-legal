/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Pencil, X } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    biography: string | null;
    photoUrl: string | null;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
}

const ManageTeamMembers = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [formVisible, setFormVisible] = useState<boolean>(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        biography: '',
        photoUrl: '',
    });

    const formRef = useRef<HTMLDivElement | null>(null);

    const fetchTeamMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/team-member');
            if (!response.ok) throw new Error('Failed to fetch team members');
            const data = await response.json();
            setTeamMembers(data);
        } catch (error) {
            toast.error('Error fetching team members', {
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = editingMember ? 'PUT' : 'POST';
            const body = editingMember
                ? { ...formData, id: editingMember.id }
                : formData;

            const res = await fetch('/api/admin/team-member', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save team member');
            toast.success(editingMember ? 'Team Member updated' : 'Team Member added');
            setFormData({ name: '', role: '', biography: '', photoUrl: '' });
            setFormVisible(false);
            setEditingMember(null);
            fetchTeamMembers();
        } catch (error) {
            toast.error('Error saving team member', {
                description: (error as Error).message,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/team-member?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete team member');
            toast.success('Team Member deleted');
            fetchTeamMembers();
        } catch (error) {
            toast.error('Error deleting team member', {
                description: (error as Error).message,
            });
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        if (formVisible && editingMember && formRef.current) {
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [formVisible, editingMember]);

    const TeamMemberSkeleton = () => (
        <Card
            className="
                relative transition-shadow duration-200
                border border-gray-200 flex flex-col h-full bg-white animate-pulse
            "
        >
            <CardContent className="p-6 flex flex-col items-center h-full">
                <div className="w-24 h-24 mb-4 rounded-full bg-gray-200" />
                <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
                <div className="h-3 w-40 bg-gray-100 rounded mb-1" />
                <div className="h-3 w-36 bg-gray-100 rounded mb-1" />
                <div className="h-3 w-28 bg-gray-100 rounded mb-4" />
                <div className="flex justify-center gap-3 mt-auto">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-2 sm:p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <Button
                    onClick={() => {
                        setFormVisible(!formVisible);
                        if (!formVisible) setEditingMember(null);
                        if (!formVisible) setFormData({ name: '', role: '', biography: '', photoUrl: '' });
                    }}
                    variant={formVisible ? 'destructive' : 'default'}
                    className="w-full sm:w-auto"
                    title={formVisible ? "Close form" : "Add a new team member"}
                    aria-label={formVisible ? "Close form" : "Add Member"}
                >
                    {formVisible ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {formVisible ? 'Close' : 'Add Member'}
                </Button>
            </div>

            {formVisible && (
                <div ref={formRef}>
                    <Card className="mb-8 shadow-xl border border-gray-200 max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                aria-busy={submitting}
                            >
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Input
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        required
                                        placeholder="e.g. Senior Advocate"
                                    />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-sm font-medium">Biography</label>
                                    <Textarea
                                        value={formData.biography}
                                        onChange={(e) =>
                                            setFormData({ ...formData, biography: e.target.value })
                                        }
                                        rows={3}
                                        placeholder="Short biography (optional)"
                                    />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-sm font-medium">Photo URL</label>
                                    <Input
                                        value={formData.photoUrl}
                                        onChange={(e) =>
                                            setFormData({ ...formData, photoUrl: e.target.value })
                                        }
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        className="mt-2 min-w-[140px]"
                                        disabled={submitting}
                                        aria-busy={submitting}
                                        title={editingMember ? "Update this member" : "Add this member"}
                                    >
                                        {submitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                        )}
                                        {editingMember ? 'Update Member' : 'Add Member'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {loading ? (
                <div
                    className="
                        grid
                        gap-6
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                        auto-rows-fr
                    "
                    style={{ gridAutoRows: '1fr' }}
                    aria-busy="true"
                    aria-label="Loading team members"
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <TeamMemberSkeleton key={i} />
                    ))}
                </div>
            ) : teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500" aria-live="polite">
                    <svg width="48" height="48" fill="none" className="mb-4 opacity-60">
                        <circle cx="24" cy="24" r="22" stroke="#d1d5db" strokeWidth="2" />
                        <path d="M16 32c0-4 8-4 8-4s8 0 8 4" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="24" cy="20" r="4" stroke="#d1d5db" strokeWidth="2" />
                    </svg>
                    <p className="text-center text-lg">No team members found.</p>
                </div>
            ) : (
                <div
                    className="
                        grid
                        gap-6
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                        auto-rows-fr
                    "
                    style={{ gridAutoRows: '1fr' }}
                    aria-live="polite"
                >
                    {teamMembers.map((member) => (
                        <Card
                            key={member.id}
                            className="
                                relative group transition-shadow duration-200
                                hover:shadow-2xl border border-gray-200
                                flex flex-col h-full
                                bg-white
                            "
                            aria-label={`Team member card for ${member.name}`}
                        >
                            <CardContent className="p-6 flex flex-col items-center h-full">
                                <div
                                    className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm"
                                    title={member.name}
                                    aria-label={`Photo of ${member.name}`}
                                >
                                    {member.photoUrl ? (
                                        <img
                                            src={member.photoUrl}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                            onError={e => (e.currentTarget.style.display = 'none')}
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-3xl font-bold">
                                            {member.name?.[0] || "?"}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-center mb-1 break-words" title={member.name}>
                                    {member.name}
                                </h3>
                                <p className="text-center text-primary font-medium text-sm mb-2" title={member.role}>
                                    {member.role}
                                </p>
                                {member.biography && (
                                    <p className="text-sm text-gray-500 text-center mb-4 line-clamp-3" title={member.biography}>
                                        {member.biography}
                                    </p>
                                )}
                                <div
                                    className="
                                        flex justify-center gap-3 mt-auto
                                        opacity-100 sm:opacity-0 group-hover:opacity-100
                                        transition-opacity duration-200
                                        absolute sm:static bottom-4 left-0 right-0
                                        sm:relative
                                        bg-white/90 sm:bg-transparent
                                        py-2 sm:py-0
                                        rounded-b-lg sm:rounded-none
                                        border-t sm:border-none
                                        border-gray-100
                                        z-10
                                    "
                                >
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="hover:bg-primary/10"
                                        aria-label={`Edit ${member.name}`}
                                        title={`Edit ${member.name}`}
                                        onClick={() => {
                                            setEditingMember(member);
                                            setFormData({
                                                name: member.name,
                                                role: member.role,
                                                biography: member.biography || '',
                                                photoUrl: member.photoUrl || '',
                                            });
                                            setFormVisible(true);
                                        }}
                                        disabled={deletingId === member.id}
                                    >
                                        {submitting && editingMember?.id === member.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        ) : (
                                            <Pencil className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        aria-label={`Delete ${member.name}`}
                                        title={`Delete ${member.name}`}
                                        onClick={() => handleDelete(member.id)}
                                        disabled={deletingId === member.id}
                                        aria-busy={deletingId === member.id}
                                    >
                                        {deletingId === member.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <div className="mt-8 text-center text-xs text-gray-400">
                Note: All these are static data and added/managed by admin. They will be shown on the About page.
            </div>
        </div>
    );
};

export default ManageTeamMembers;
