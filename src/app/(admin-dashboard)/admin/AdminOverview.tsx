/* eslint-disable @typescript-eslint/no-explicit-any */
// Enums for status (adjust as per your actual enums)
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";
type BlogStatus = "APPROVED" | "REJECTED" | "PENDING";
type UserRole = "ADMIN" | "USER";
// payment related types
type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
type PaymentFor = "APPOINTMENT" | "SERVICE" | "SUBSCRIPTION" | "OTHER";


interface User {
    name: string;
    id: string;
    clerkId: string;
    email: string;
    role: UserRole;
    profilePicture: string | null;
    createdAt: string;
    updatedAt: string;
};

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
            author: User
        }[];
    };
    payments: {
        total: number;
        byStatus: {
            status: PaymentStatus;
            _count: { status: number };
        }[];
        revenue: number;
        revenueByType: {
            _sum: { amount: string | number };
            paymentFor: PaymentFor;
        }[];
        recent: {
            id: string;
            orderId?: string | null;
            paymentId?: string | null;
            signature?: string | null;
            amount: string | number;
            currency: string;
            status: PaymentStatus;
            paymentFor: PaymentFor;
            method: string | null;
            description: string | null;
            createdAt: string;
            updatedAt: string;
            userId?: string | null;
            serviceId?: string | null;
            appointmentId?: string | null;
            user?: User | null;
            service?: any | null;
            appointment?: {
                id: string;
                userName: string;
                userEmail: string;
                userPhone: string | null;
                status: AppointmentStatus;
                agenda?: string | null;
                meetUrl?: string | null;
                maxReschedules?: number;
                rescheduleCount?: number;
                createdAt: string;
                updatedAt: string;
                slotId: string | null;
                userId: string | null;
                appointmentTypeId?: string;
                appointmentType?: {
                    id: string;
                    title: string;
                    description: string;
                    price: string | number;
                    isActive: boolean;
                    createdAt: string;
                    updatedAt: string;
                } | null;
            } | null;
        }[];
    };
}

export interface PaymentsData {
    total: number;
    byStatus: { [status: string]: number } | { status: string; _count?: { status: number } }[];
    revenue: number;
    revenueByType: { [type: string]: number } | { _sum: { amount: string | number }; paymentFor: PaymentFor }[];
    recent: {
        id: string;
        amount: number | string;
        status: string;
        method: string | null;
        date?: string | Date;
        userId?: string;
        type?: string;
    }[];
}