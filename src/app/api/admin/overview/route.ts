import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
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

        // --- Activity Logs (Optional) ---
        // If you implement an activity table, fetch latest activities here

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
        });
    } catch (error) {
        console.error('Admin Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
