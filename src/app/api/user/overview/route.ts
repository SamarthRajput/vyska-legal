import { NextRequest, NextResponse } from 'next/server';
import { BlogStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET(request: NextRequest) {
    try {
        // Get logged-in user
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const userId = user.id;

        // --- BLOG OVERVIEW ---
        const totalBlogs = await prisma.blog.count({ where: { authorId: userId } });
        const approvedBlogs = await prisma.blog.count({ where: { authorId: userId, status: BlogStatus.APPROVED } });
        const pendingBlogs = await prisma.blog.count({ where: { authorId: userId, status: BlogStatus.PENDING } });
        const rejectedBlogs = await prisma.blog.count({ where: { authorId: userId, status: BlogStatus.REJECTED } });
        const draftBlogs = await prisma.blog.count({ where: { authorId: userId, status: BlogStatus.DRAFT } });

        const recentBlogs = await prisma.blog.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // --- APPOINTMENT OVERVIEW ---
        const totalAppointments = await prisma.appointment.count({ where: { userId } });
        const appointmentsByStatus = await prisma.appointment.groupBy({
            by: ['status'],
            where: { userId },
            _count: { status: true },
        });

        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                userId,
                slot: { date: { gte: new Date() } },
            },
            orderBy: { slot: { date: 'asc' } },
            include: {
                slot: true,
                appointmentType: true,
            },
            take: 5,
        });

        // --- PAYMENTS OVERVIEW ---
        const totalPayments = await prisma.payment.count({ where: { userId } });

        const totalSpent = await prisma.payment.aggregate({
            where: { userId, status: PaymentStatus.SUCCESS },
            _sum: { amount: true },
        });

        const paymentsByStatus = await prisma.payment.groupBy({
            by: ['status'],
            where: { userId },
            _count: { status: true },
        });

        const recentPayments = await prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                service: true,
                appointment: { include: { appointmentType: true } },
            },
            take: 5,
        });

        // --- RETURN OVERVIEW JSON ---
        return NextResponse.json({
            blogs: {
                total: totalBlogs,
                approved: approvedBlogs,
                pending: pendingBlogs,
                rejected: rejectedBlogs,
                draft: draftBlogs,
                recent: recentBlogs,
            },
            appointments: {
                total: totalAppointments,
                byStatus: appointmentsByStatus,
                upcoming: upcomingAppointments,
            },
            payments: {
                total: totalPayments,
                byStatus: paymentsByStatus,
                totalSpent: Number(totalSpent._sum.amount || 0),
                recent: recentPayments,
            },
        });
    } catch (error) {
        console.error('User Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
