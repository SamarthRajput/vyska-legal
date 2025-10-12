"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X, ChevronLeft, ChevronRight, Filter, SortAsc, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import getExcerpt from '@/lib/getExcerpt';
import MarkdownRender from '@/components/MarkdownRender';
import Pagination from '@/components/Pagination';

interface Author {
    name: string;
    id: string;
    clerkId: string;
    email: string;
    role: 'user' | 'admin';
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

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

const PAGE = () => {
    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [pagination, setPagination] = React.useState<Pagination | null>(null);
    const [authors, setAuthors] = React.useState<Author[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState<string>('');
    const [filter, setFilter] = React.useState<string>('all');
    const [sortBy, setSortBy] = React.useState<string>('createdAt');
    const [page, setPage] = React.useState<number>(1);
    const [limit, setLimit] = React.useState<number>(10);
    const [authorId, setAuthorId] = React.useState<string>('all');
    const [rejectionReason, setRejectionReason] = React.useState<string>('');
    const [selectedBlog, setSelectedBlog] = React.useState<Blog | null>(null);
    const [statusUpdating, setStatusUpdating] = React.useState<boolean>(false);
    const [deleting, setDeleting] = React.useState<boolean>(false);
    const [showDetailDialog, setShowDetailDialog] = React.useState<boolean>(false);
    const [showRejectDialog, setShowRejectDialog] = React.useState<boolean>(false);

    React.useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/blogs?page=${page}&limit=${limit}&sortBy=${sortBy}&filter=${filter}&search=${search}&authorId=${authorId === 'all' ? '' : authorId}`);
                const data = await response.json();
                setBlogs(data.data);
                setPagination(data.pagination);
                setAuthors(data.authors);
                setError(null);
            } catch (error) {
                setError('Failed to fetch blogs');
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [page, limit, sortBy, filter, search, authorId]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            setDeleting(true);
            const response = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
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

    const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', rejectionReason?: string) => {
        try {
            setStatusUpdating(true);
            const response = await fetch(`/api/admin/blogs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rejectionReason }),
            });
            const data = await response.json();
            if (response.ok) {
                setBlogs((prev) =>
                    prev.map((blog) =>
                        blog.id === id ? { ...blog, status: status, rejectionReason } : blog
                    )
                );
                if (selectedBlog?.id === id) {
                    setSelectedBlog({ ...selectedBlog, status: status, rejectionReason });
                }
                toast.success(`Blog ${status.toLowerCase()} successfully`);
                setShowRejectDialog(false);
                setRejectionReason('');
            }
            else {
                toast.error(data.error || `Failed to update blog status`);
            }
        } catch (error) {
            toast.error(`Failed to update blog status`);
        }
        finally {
            setStatusUpdating(false);
        }
    };

    const handleEdit = (id: string) => {
        window.location.href = `/blogs/edit/${id}`;
    }

    const openDetailView = (blog: Blog) => {
        setSelectedBlog(blog);
        setShowDetailDialog(true);
    };

    const openRejectDialog = (blog: Blog) => {
        setSelectedBlog(blog);
        setShowRejectDialog(true);
    };

    const getStatusBadge = (status: Blog['status']) => {
        const variants: Record<Blog['status'], { variant: "default" | "secondary" | "destructive" | "outline", label: string, icon: React.ReactNode }> = {
            APPROVED: { variant: "default", label: "Approved", icon: <CheckCircle className="h-3 w-3" /> },
            PENDING: { variant: "secondary", label: "Pending", icon: <Clock className="h-3 w-3" /> },
            REJECTED: { variant: "destructive", label: "Rejected", icon: <XCircle className="h-3 w-3" /> },
            DRAFT: { variant: "outline", label: "Draft", icon: <Edit className="h-3 w-3" /> }
        };
        const config = variants[status];
        if (!config) {
            return <Badge variant="default">Unknown</Badge>;
        }
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

    const hasActiveFilters = search !== '' || filter !== 'all' || authorId !== 'all';

    const clearAllFilters = () => {
        setSearch('');
        setFilter('all');
        setAuthorId('all');
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
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
                            <SelectTrigger className="w-[140px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[140px]">
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

                        <Select value={authorId} onValueChange={setAuthorId}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="All Authors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Authors</SelectItem>
                                {authors.map((author) => (
                                    <SelectItem key={author.id} value={author.id}>
                                        {author.name}
                                    </SelectItem>
                                ))}
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
                        {authorId !== 'all' && (
                            <Badge variant="secondary" className="gap-1">
                                {authors.find((author) => author.id === authorId)?.name}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setAuthorId("all")} />
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <p className="text-muted-foreground text-lg">No blogs found</p>
                        {hasActiveFilters && (
                            <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                                Clear filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-xl line-clamp-2">{blog.title}</CardTitle>
                                    {getStatusBadge(blog.status)}
                                </div>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={blog.author.profilePicture || undefined} />
                                        <AvatarFallback className="text-xs">{getInitials(blog.author.name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{blog.author.name}</span>
                                    <Badge variant="outline" className="text-xs">{blog.author.role}</Badge>
                                </CardDescription>
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
                            <CardFooter className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => openDetailView(blog)}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-8 relative mx-2 animate-fadeIn border border-gray-200 max-h-[90vh] overflow-y-auto flex flex-col">
                        <button
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => setShowDetailDialog(false)}
                            aria-label="Close modal"
                            title="Close"
                        >
                            ×
                        </button>
                        <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                            {selectedBlog.title}
                            <span className="ml-auto">{getStatusBadge(selectedBlog.status)}</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={selectedBlog.author.profilePicture || undefined} />
                                <AvatarFallback>{getInitials(selectedBlog.author.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold text-foreground">{selectedBlog.author.name}</div>
                                <div className="text-xs sm:text-sm flex flex-wrap items-center gap-2">
                                    <span className="break-all">{selectedBlog.author.email}</span>
                                    <Badge variant="outline" className="text-xs">{selectedBlog.author.role}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                            <div>
                                <span className="font-semibold text-foreground">Created:</span> {formatDate(selectedBlog.createdAt)}
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Updated:</span> {formatDate(selectedBlog.updatedAt)}
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Author ID:</span> <span className="break-all">{selectedBlog.authorId}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Blog ID:</span> <span className="break-all">{selectedBlog.id}</span>
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
                                className="flex-1 sm:flex-initial"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(selectedBlog.id)}
                                disabled={deleting}
                                className="flex-1 sm:flex-initial"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                            {selectedBlog.status !== 'APPROVED' && (
                                <Button
                                    variant="default"
                                    onClick={() => handleStatusChange(selectedBlog.id, 'APPROVED')}
                                    disabled={statusUpdating}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            )}
                            {selectedBlog.status !== 'REJECTED' && (
                                <Button
                                    variant="destructive"
                                    onClick={() => openRejectDialog(selectedBlog)}
                                    disabled={statusUpdating}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            )}
                            {selectedBlog.status !== 'PENDING' && (
                                <Button
                                    variant="secondary"
                                    onClick={() => handleStatusChange(selectedBlog.id, 'PENDING')}
                                    disabled={statusUpdating}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Set Pending
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="w-full max-w-md px-2 sm:px-6 py-4 sm:py-8">
                    <DialogHeader>
                        <DialogTitle>Reject Blog Post</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this blog post. This will be visible to the author.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2 sm:py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Enter the reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedBlog && handleStatusChange(selectedBlog.id, 'REJECTED', rejectionReason)}
                            disabled={!rejectionReason.trim() || statusUpdating}
                            className="w-full sm:w-auto"
                        >
                            {statusUpdating ? 'Rejecting...' : 'Reject Blog'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PAGE;