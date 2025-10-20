"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X, Filter, SortAsc, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import getExcerpt from '@/lib/getExcerpt';
import MarkdownRender from '@/components/blog/MarkdownRender';
import Pagination from '@/components/Pagination';
import { useRouter } from 'next/navigation';

interface Author {
    name: string;
    id: string;
    clerkId: string;
    email: string;
    role: 'USER' | 'ADMIN';
    profilePicture: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface Blog {
    author: Author;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string | null;
    authorId: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

const MyBlogs = () => {
    const router = useRouter();
    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [pagination, setPagination] = React.useState<PaginationData | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState<string>('');
    const [filter, setFilter] = React.useState<string>('all');
    const [sortBy, setSortBy] = React.useState<string>('createdAt');
    const [page, setPage] = React.useState<number>(1);
    const [limit, setLimit] = React.useState<number>(10);
    const [selectedBlog, setSelectedBlog] = React.useState<Blog | null>(null);
    const [statusUpdating, setStatusUpdating] = React.useState<boolean>(false);
    const [deleting, setDeleting] = React.useState<boolean>(false);
    const [showDetailDialog, setShowDetailDialog] = React.useState<boolean>(false);

    React.useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/user/blogs?page=${page}&limit=${limit}&sortBy=${sortBy}&filter=${filter}&search=${search}`);
                const data = await response.json();
                
                if (response.ok) {
                    setBlogs(data.data);
                    setPagination(data.pagination);
                    setError(null);
                } else {
                    setError(data.error || 'Failed to fetch blogs');
                }
            } catch (error) {
                setError('Failed to fetch blogs');
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [page, limit, sortBy, filter, search]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            setDeleting(true);
            const response = await fetch(`/api/user/blogs/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (response.ok) {
                setBlogs((prev) => prev.filter((blog) => blog.id !== id));
                toast.success("Blog deleted successfully");
                setShowDetailDialog(false);
            } else {
                toast.error(data.error || "Failed to delete blog");
            }
        } catch (error) {
            toast.error("Failed to delete blog");
        } finally {
            setDeleting(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'DRAFT' | 'PENDING') => {
        try {
            setStatusUpdating(true);
            const response = await fetch(`/api/user/blogs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await response.json();
            if (response.ok) {
                setBlogs((prev) =>
                    prev.map((blog) =>
                        blog.id === id ? { ...blog, status: status } : blog
                    )
                );
                if (selectedBlog?.id === id) {
                    setSelectedBlog({ ...selectedBlog, status: status });
                }
                toast.success(`Blog status updated to ${status.toLowerCase()} successfully`);
            } else {
                toast.error(data.error || `Failed to update blog status`);
            }
        } catch (error) {
            toast.error(`Failed to update blog status`);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/blog/edit/${id}`);
    };


    const handleCreateBlog = () => {
        router.push('/blog/write');
    };

    const openDetailView = (blog: Blog) => {
        setSelectedBlog(blog);
        setShowDetailDialog(true);
    };

    const getStatusBadge = (status: Blog['status']) => {
        const variants: Record<Blog['status'], { variant: "default" | "secondary" | "destructive" | "outline", label: string, icon: React.ReactNode }> = {
            APPROVED: { variant: "default", label: "Approved", icon: <CheckCircle className="h-3 w-3" /> },
            PENDING: { variant: "secondary", label: "Pending", icon: <Clock className="h-3 w-3" /> },
            REJECTED: { variant: "destructive", label: "Rejected", icon: <XCircle className="h-3 w-3" /> },
            DRAFT: { variant: "outline", label: "Draft", icon: <Edit className="h-3 w-3" /> }
        };
        const config = variants[status];
        return (
            <Badge variant={config.variant} className="gap-1">
                {config.icon}
                {config.label}
            </Badge>
        );
    };


    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };


    const hasActiveFilters = search !== '' || filter !== 'all';

    const clearAllFilters = () => {
        setSearch('');
        setFilter('all');
    };

    return (
        <div className="container mx-auto py-4 sm:py-8 px-4 max-w-7xl">
            {/* Header Section with Create Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Button 
                    onClick={handleCreateBlog}
                    size="default"
                    className="w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Blog
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search blogs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <SortAsc className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">Newest</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="updatedAt">Updated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {search && (
                            <Badge variant="secondary" className="gap-1">
                                {search}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                            </Badge>
                        )}
                        {filter !== "all" && (
                            <Badge variant="secondary" className="gap-1">
                                {filter}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilter("all")} />
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : !blogs.length ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <p className="text-muted-foreground text-base sm:text-lg mb-4">No blogs found</p>
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearAllFilters}>
                                Clear filters
                            </Button>
                        ) : (
                            <Button onClick={handleCreateBlog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Blog
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg sm:text-xl line-clamp-2">{blog.title}</CardTitle>
                                    {getStatusBadge(blog.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {getExcerpt(blog.content, 100)}
                                </p>
                                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                                    <div>Created: {formatDate(blog.createdAt)}</div>
                                    <div>Updated: {formatDate(blog.updatedAt)}</div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:flex-1"
                                    onClick={() => openDetailView(blog)}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full sm:flex-1"
                                    onClick={() => handleEdit(blog.id)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Pagination
                pagination={pagination}
                limit={limit}
                setLimit={(v) => { setLimit(v); setPage(1); }}
                pageSizes={[5, 10, 20, 50]}
                handlePageChange={(page) => setPage(page)}
            />

            {/* Detail View Modal */}
            {selectedBlog && showDetailDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-8 relative animate-fadeIn border border-gray-200 max-h-[90vh] overflow-y-auto flex flex-col">
                        <button
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => setShowDetailDialog(false)}
                            aria-label="Close modal"
                            title="Close"
                        >
                            ×
                        </button>
                        <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-start gap-2 flex-wrap pr-8">
                            <span className="flex-1">{selectedBlog.title}</span>
                            {getStatusBadge(selectedBlog.status)}
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                            <div>
                                <span className="font-semibold text-foreground">Created:</span> {formatDate(selectedBlog.createdAt)}
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Updated:</span> {formatDate(selectedBlog.updatedAt)}
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="font-semibold text-base sm:text-lg mb-2">Content</h3>
                            <div className="prose prose-sm max-w-none bg-muted/30 p-2 sm:p-4 rounded-lg overflow-x-auto">
                                <MarkdownRender content={selectedBlog.content} />
                            </div>
                        </div>
                        
                        {selectedBlog.status === 'REJECTED' && selectedBlog.rejectionReason && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Rejection Reason:</strong> {selectedBlog.rejectionReason}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => handleEdit(selectedBlog.id)}
                                className="w-full sm:flex-1"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(selectedBlog.id)}
                                disabled={deleting}
                                className="w-full sm:flex-1"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                            {selectedBlog.status === 'DRAFT' && (
                                <Button
                                    variant="default"
                                    onClick={() => handleStatusChange(selectedBlog.id, 'PENDING')}
                                    disabled={statusUpdating}
                                    className="w-full sm:flex-1"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Review
                                </Button>
                            )}
                            {selectedBlog.status === 'PENDING' && (
                                <Button
                                    variant="secondary"
                                    onClick={() => handleStatusChange(selectedBlog.id, 'DRAFT')}
                                    disabled={statusUpdating}
                                    className="w-full sm:flex-1"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Move to Draft
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBlogs;