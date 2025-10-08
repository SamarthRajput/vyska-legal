'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Pencil, Minus, Cross, X } from 'lucide-react';

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
    const [loading, setLoading] = useState<boolean>(false);
    const [formVisible, setFormVisible] = useState<boolean>(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        biography: '',
        photoUrl: '',
    });

    // Fetch all team members
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

    // Add or update a team member
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        }
    };

    // Delete team member
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;
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
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Manage Team Members</h1>
                <Button
                    onClick={() => setFormVisible(!formVisible)}
                    variant={formVisible ? 'destructive' : 'default'}
                >
                    {formVisible ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {formVisible ? 'Close' : 'Add Member'}
                </Button>
            </div>

            {formVisible && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>
                            {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Role</label>
                                <Input
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Biography</label>
                                <Textarea
                                    value={formData.biography}
                                    onChange={(e) =>
                                        setFormData({ ...formData, biography: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Photo URL</label>
                                <Input
                                    value={formData.photoUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, photoUrl: e.target.value })
                                    }
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" className="mt-2">
                                    {editingMember ? 'Update Member' : 'Add Member'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : teamMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                    No team members found.
                </p>
            ) : (
                <div className="grid md:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                        <Card key={member.id} className="relative group">
                            <CardContent className="p-4">
                                {member.photoUrl && (
                                    <img
                                        src={member.photoUrl}
                                        alt={member.name}
                                        className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
                                    />
                                )}
                                <h3 className="text-lg font-semibold text-center">
                                    {member.name}
                                </h3>
                                <p className="text-center text-gray-600 text-sm mb-2">
                                    {member.role}
                                </p>
                                {member.biography && (
                                    <p className="text-sm text-gray-500 text-center line-clamp-3">
                                        {member.biography}
                                    </p>
                                )}
                                <div className="flex justify-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition">
                                    <Button
                                        variant="outline"
                                        size="icon"
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
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(member.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageTeamMembers;
