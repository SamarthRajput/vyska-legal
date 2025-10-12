// Enums for status (adjust as per your actual enums)
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";
type BlogStatus = "APPROVED" | "REJECTED" | "PENDING";
type UserRole = "ADMIN" | "USER";
export interface AdminOverview {
    users: {
        total: number;
        admins: number;
        normal: number;
    };
    appointments: {
        total: number;
        byStatus: {
            status: AppointmentStatus;
            _count: { status: number };
        }[];
        upcoming: {
            id: string;
            createdAt: string;
            updatedAt: string;
            status: AppointmentStatus;
            userName: string;
            userEmail: string;
            userPhone: string | null;
            slotId: string;
            userId: string | null;
            slot: {
                id: string;
                createdAt: string;
                updatedAt: string;
                date: string;
                timeSlot: string;
                isBooked: boolean;
            };
        }[];
    };
    services: {
        total: number;
        recent: {
            id: string;
            createdAt: string;
            updatedAt: string;
            title: string;
            description: string;
            price: number | null;
            iconUrl: string | null;
        }[];
    };
    teamMembers: {
        total: number;
        recent: {
            name: string;
            id: string;
            role: string;
            createdAt: string;
            updatedAt: string;
            createdById: string | null;
            biography: string | null;
            photoUrl: string | null;
            linkedin: string | null;
            twitter: string | null;
            instagram: string | null;
            facebook: string | null;
        }[];
    };
    contacts: {
        total: number;
        byStatus: {
            status: ContactStatus;
            _count: { status: number };
        }[];
        recent: {
            name: string;
            id: string;
            email: string;
            createdAt: string;
            updatedAt: string;
            status: ContactStatus;
            phone: string | null;
            subject: string;
            message: string;
            reply: string | null;
            repliedById: string | null;
        }[];
    };
    blogs: {
        total: number;
        byStatus: {
            status: BlogStatus;
            _count: { status: number };
        }[];
        recent: {
            id: string;
            createdAt: string;
            updatedAt: string;
            title: string;
            content: string;
            status: BlogStatus;
            authorId: string;
            rejectionReason: string | null;
            author: {
                name: string;
                id: string;
                clerkId: string;
                email: string;
                role: UserRole;
                profilePicture: string | null;
                createdAt: string;
                updatedAt: string;
            };
        }[];
    };
}