import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET(request: NextRequest) {
    try {
        // Get current logged-in user
        const user = await getUser();
        if (!user || user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: 'Access Denied. Admins only.' },
                { status: 403 }
            );
        }

        // --- Users Overview ---
        const totalUsers = await prisma.user.count();
        const adminUsers = await prisma.user.count({ where: { role: UserRole.ADMIN } });
        const normalUsers = totalUsers - adminUsers;

        // --- Blogs Overview ---
        const totalBlogs = await prisma.blog.count();
        const blogsByStatus = await prisma.blog.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        const recentBlogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { author: true },
        });

        // --- Appointments Overview ---
        const totalAppointments = await prisma.appointment.count();
        const appointmentsByStatus = await prisma.appointment.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        const upcomingAppointments = await prisma.appointment.findMany({
            where: { slot: { date: { gte: new Date() } } },
            orderBy: { slot: { date: 'asc' } },
            take: 5,
            include: { slot: true },
        });

        // --- Services ---
        const totalServices = await prisma.service.count();
        const recentServices = await prisma.service.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // --- Research Papers ---
        const totalResearchPapers = await prisma.research.count();
        const recentResearchPapers = await prisma.research.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { createdBy: true },
        });

        // --- Team Members ---
        const totalTeamMembers = await prisma.teamMember.count();
        const recentTeamMembers = await prisma.teamMember.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // --- Contact / Messages ---
        const totalContacts = await prisma.contact.count();
        const contactsByStatus = await prisma.contact.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        const recentContacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const totalPayments = await prisma.payment.count();

        // Count by status
        const paymentsByStatus = await prisma.payment.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        // Total revenue (only successful payments)
        const successfulPayments = await prisma.payment.findMany({
            where: { status: PaymentStatus.SUCCESS },
            select: { amount: true },
        });
        const totalRevenue = successfulPayments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
        );

        // Optional: Revenue by type (service / appointment)
        const revenueByType = await prisma.payment.groupBy({
            by: ['paymentFor'],
            where: { status: PaymentStatus.SUCCESS },
            _sum: { amount: true },
        });

        // Recent 5 payments
        const recentPayments = await prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                user: true,
                service: true,
                appointment: { include: { appointmentType: true } },
            },
        });

        return NextResponse.json({
            users: {
                total: totalUsers,
                admins: adminUsers,
                normal: normalUsers,
            },
            blogs: {
                total: totalBlogs,
                byStatus: blogsByStatus,
                recent: recentBlogs,
            },
            appointments: {
                total: totalAppointments,
                byStatus: appointmentsByStatus,
                upcoming: upcomingAppointments,
            },
            services: {
                total: totalServices,
                recent: recentServices,
            },
            research: {
                total: totalResearchPapers,
                recent: recentResearchPapers,
            },
            teamMembers: {
                total: totalTeamMembers,
                recent: recentTeamMembers,
            },
            contacts: {
                total: totalContacts,
                byStatus: contactsByStatus,
                recent: recentContacts,
            },
            payments: {
                total: totalPayments,
                byStatus: paymentsByStatus,
                revenue: totalRevenue,
                revenueByType: revenueByType,
                recent: recentPayments,
            },
        });
    } catch (error) {
        console.error('Admin Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
