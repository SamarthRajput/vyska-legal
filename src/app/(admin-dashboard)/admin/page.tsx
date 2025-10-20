/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Legend,
} from "recharts";
import { AdminOverview } from "./AdminOverview";
import Link from "next/link";

export default function AdminPage() {
    const [data, setData] = useState<AdminOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/overview")
            .then((res) => res.json())
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load admin data. Please try again later.");
                toast.error("Failed to load admin data");
                setLoading(false);
            });
    }, []);

    if (loading) return <SkeletonDashboard />;

    if (!data)
        return (
            <div className="flex flex-col items-center justify-center mt-16">
                <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold text-red-500 mb-2">Dashboard Data Unavailable</p>
                <p className="text-gray-500">{error || "Something went wrong. Please refresh the page."}</p>
            </div>
        );

    const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];

    return (
        <div className="p-2 sm:p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-7">
                <SummaryCard title="Total Users" value={data.users.total} icon="users" />
                <SummaryCard title="Total Blogs" value={data.blogs.total} icon="blog" />
                <SummaryCard title="Appointments" value={data.appointments.total} icon="calendar" />
                <SummaryCard title="Contacts" value={data.contacts.total} icon="mail" />
                <SummaryCard title="Services" value={data.services.total} icon="service" />
                <SummaryCard title="Team Members" value={data.teamMembers.total} icon="team" />
                <SummaryCard title="Payments Counts" value={`₹${Number(data.payments.total)}`} icon="service" />
                <SummaryCard title="Total Payments" value={`₹${Number(data.payments.revenue.)}`} icon="service" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Users Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Admins", value: data.users.admins },
                                        { name: "Normal Users", value: data.users.normal },
                                    ]}
                                    dataKey="value"
                                    outerRadius={100}
                                    label
                                >
                                    {COLORS.map((c, i) => (
                                        <Cell key={i} fill={c} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Blog Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.blogs.byStatus}>
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="_count.status" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Appointments by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.appointments.byStatus}>
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="_count.status" fill="#22C55E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Contacts</CardTitle>
                        <ViewMoreLink href="/admin/contact-us" />
                    </CardHeader>
                    <CardContent>
                        <RecentTable
                            headers={["Name", "Email", "Subject", "Status"]}
                            rows={data.contacts.recent.map((c, idx) => [
                                <UserCell name={c.name} email={c.email} key={c.email || idx + "-user"} />,
                                c.email,
                                c.subject.trim().length > 30 ? c.subject.trim().slice(0, 30) + "..." : c.subject.trim(),
                                <StatusBadge status={c.status} key={c.email || idx + "-status"} />,
                            ])}
                        />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Blogs</CardTitle>
                    <ViewMoreLink href="/admin/blogs" />
                </CardHeader>
                <CardContent>
                    <RecentTable
                        headers={["Title", "Author", "Status", "Created At"]}
                        rows={data.blogs.recent.map((b, idx) => [
                            b.title,
                            <AuthorCell author={b.author} key={b.author?.id || idx + "-author"} />,
                            <StatusBadge status={b.status} key={b.id || idx + "-status"} />,
                            new Date(b.createdAt).toLocaleDateString(),
                        ])}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <ViewMoreLink href="/admin/appointments" />
                </CardHeader>
                <CardContent>
                    <RecentTable
                        headers={["Name", "Email", "Date", "Time", "Status"]}
                        rows={data.appointments.upcoming.map((a, idx) => [
                            <UserCell name={a.userName} email={a.userEmail} key={a.id || idx + "-user"} />,
                            a.userEmail,
                            new Date(a.slot.date).toLocaleDateString(),
                            a.slot.timeSlot,
                            <StatusBadge status={a.status} key={a.id || idx + "-status"} />,
                        ])}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Services</CardTitle>
                    <ViewMoreLink href="/admin/services" />
                </CardHeader>
                <CardContent>
                    <RecentTable
                        headers={["Title", "Description", "Price", "Created At"]}
                        rows={data.services.recent.map((s, idx) => [
                            <ServiceCell service={s} key={s.id || idx + "-service"} />,
                            s.description,
                            s.price !== null ? `₹${s.price}` : "-",
                            new Date(s.createdAt).toLocaleDateString(),
                        ])}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Team Members</CardTitle>
                    <ViewMoreLink href="/admin/team-members" />
                </CardHeader>
                <CardContent>
                    <RecentTable
                        headers={["Photo", "Name", "Role", "Created At"]}
                        rows={data.teamMembers.recent.map((m, idx) => [
                            <TeamPhotoCell photoUrl={m.photoUrl} name={m.name} key={m.id || idx + "-photo"} />,
                            m.name,
                            m.role,
                            new Date(m.createdAt).toLocaleDateString(),
                        ])}
                    />
                </CardContent>
            </Card>
            {/* new payment charts row  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Payments by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.payments.byStatus}>
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="_count.status" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Revenue by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data.payments.revenueByType.map((r) => ({
                                        name: r.paymentFor,
                                        value: Number(r._sum?.amount ?? 0),
                                    }))}
                                    dataKey="value"
                                    outerRadius={100}
                                    label
                                >
                                    {["#06B6D4", "#34D399", "#F59E0B", "#EF4444"].map((c, i) => (
                                        <Cell key={i} fill={c} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₹${Number(value).toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-sm text-gray-600">Total Revenue: <span className="font-semibold">₹{Number(data.payments.revenue).toLocaleString()}</span></div>
                    </CardContent>
                </Card>
            </div>

            {/* new , recent payment table  */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Payments</CardTitle>
                    <ViewMoreLink href="/admin/transactions" />
                </CardHeader>
                <CardContent>
                    <RecentTable
                        headers={["Payment ID", "User", "Amount", "Status", "For", "Method", "Created At"]}
                        rows={data.payments.recent.map((p, idx) => [
                            p.orderId ?? p.paymentId ?? p.id,
                            p.user ? <AuthorCell author={p.user} key={p.id + "-user"} /> : (p.userId ?? "-"),
                            <AmountCell amount={p.amount} currency={p.currency} key={p.id + "-amount"} />,
                            <StatusBadge status={p.status} key={p.id + "-status"} />,
                            <PaymentForBadge forType={p.paymentFor} key={p.id + "-for"} />,
                            p.method ?? "-",
                            new Date(p.createdAt).toLocaleString(),
                        ])}
                    />
                </CardContent>
            </Card>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow">
                <h2 className="text-xl font-semibold text-indigo-700">Want to grow your team or services?</h2>
                <p className="text-gray-600 text-center max-w-md">
                    Invite new team members or add more services to expand your platform and reach more users.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/admin/team-members?action=invite"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                        title="Invite a new team member"
                    >
                        Invite Team Member
                    </Link>
                    <Link
                        href="/admin/services?action=new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        title="Add a new service"
                    >
                        Add New Service
                    </Link>
                </div>
            </div>
        </div>
    );
}

const SummaryCard = ({
    title,
    value,
    icon,
}: {
    title: string;
    value: number | string;
    icon?: "users" | "blog" | "calendar" | "mail" | "service" | "team";
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:shadow-xl transition" title={title}>
            <CardHeader className="pb-1 flex flex-row items-center gap-2">
                {icon && <SummaryIcon icon={icon} />}
                <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-gray-800" title={String(value)}>{value}</p>
            </CardContent>
        </Card>
    </motion.div>
);

const SummaryIcon = ({ icon }: { icon: string }) => {
    if (icon === "users")
        return (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-2" title="Users">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0zm6 4v6m0 0a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6a2 2 0 012-2h4a2 2 0 012 2z" />
                </svg>
            </span>
        );
    if (icon === "blog")
        return (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 mr-2" title="Blogs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h6a2 2 0 012 2v12a2 2 0 01-2 2z" />
                </svg>
            </span>
        );
    if (icon === "calendar")
        return (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 mr-2" title="Appointments">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </span>
        );
    if (icon === "mail")
        return (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 mr-2" title="Contacts">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm2 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                </svg>
            </span>
        );
    if (icon === "service")
        return (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-2" title="Services">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h6M9 17H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v2" />
                </svg>
            </span>
        );
    if (icon === "team")
        return (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-2" title="Team Members">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </span>
        );
    return null;
};

const StatusBadge = ({ status }: { status: string }) => {
    let color = "bg-gray-200 text-gray-700";
    if (status === "PENDING") color = "bg-yellow-100 text-yellow-700";
    if (status === "APPROVED" || status === "ACTIVE") color = "bg-green-100 text-green-700";
    if (status === "REJECTED" || status === "INACTIVE") color = "bg-red-100 text-red-700";
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`} title={status}>
            {status}
        </span>
    );
};

const AuthorCell = ({ author }: { author: any }) => (
    <div className="flex items-center gap-2 min-w-[160px]" title={author?.name || "Author"}>
        {author?.profilePicture && (
            <img src={author.profilePicture} alt={author.name} className="w-8 h-8 rounded-full object-cover border" title={author.name} />
        )}
        <div>
            <div className="font-medium text-gray-800">{author?.name || "-"}</div>
            {author?.email && (
                <div className="text-xs text-gray-500">{author.email}</div>
            )}
            {author?.role && (
                <span className="text-xs text-indigo-600 font-semibold">{author.role}</span>
            )}
        </div>
    </div>
);

const UserCell = ({ name, email }: { name: string; email?: string }) => (
    <div className="flex flex-col" title={name + (email ? ` (${email})` : "")}>
        <span className="font-medium text-gray-800">{name}</span>
        {email && <span className="text-xs text-gray-500">{email}</span>}
    </div>
);

const ServiceCell = ({ service }: { service: any }) => (
    <div className="flex items-center gap-2 min-w-[120px]" title={service.title}>
        {service.iconUrl && (
            <img src={service.iconUrl} alt={service.title} className="w-8 h-8 rounded object-cover border" title={service.title} />
        )}
        <span className="font-medium text-gray-800">{service.title}</span>
    </div>
);

const TeamPhotoCell = ({ photoUrl, name }: { photoUrl: string | null; name: string }) => (
    <div className="flex items-center gap-2 min-w-[80px]" title={name}>
        {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-8 h-8 rounded-full object-cover border" title={name} />
        ) : (
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">{name[0]}</span>
        )}
    </div>
);

const RecentTable = ({
    headers,
    rows,
}: {
    headers: string[];
    rows: (React.ReactNode | string | number | null)[][];
}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border rounded-lg bg-white">
            <thead className="bg-gray-50 text-gray-700">
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} className="p-3 font-semibold whitespace-nowrap" title={h}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length === 0 ? (
                    <tr>
                        <td colSpan={headers.length} className="p-4 text-center text-gray-400">No data available</td>
                    </tr>
                ) : (
                    rows.map((r, i) => (
                        <tr
                            key={i}
                            className="border-b hover:bg-gray-50 transition-colors"
                        >
                            {r.map((col, j) => (
                                <td key={j} className="p-3 text-gray-700 whitespace-nowrap">
                                    {col ?? "-"}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const ViewMoreLink = ({ href }: { href: string }) => (
    <a
        href={href}
        className="text-xs text-blue-600 hover:underline cursor-pointer"
        tabIndex={0}
        title="View more"
    >
        View more
    </a>
);

const SkeletonDashboard = () => (
    <div className="p-4 max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-24" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72" />
            ))}
        </div>
        <div className="bg-gray-100 rounded-xl h-72" />
        <div className="bg-gray-100 rounded-xl h-72" />
    </div>
);

//  helper components for payments rendering
const AmountCell = ({ amount, currency }: { amount: string | number; currency: string }) => {
    const num = typeof amount === "string" ? parseFloat(amount) : Number(amount || 0);
    return (
        <div title={`${currency} ${num}`}>
            <span className="font-medium text-gray-800">₹{num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            <div className="text-xs text-gray-500">{currency}</div>
        </div>
    );
};

const PaymentForBadge = ({ forType }: { forType: string }) => {
    const classes = "px-2 py-1 rounded text-xs font-semibold ";
    let color = "bg-gray-100 text-gray-700";
    if (forType === "APPOINTMENT") color = "bg-indigo-100 text-indigo-700";
    if (forType === "SERVICE") color = "bg-blue-100 text-blue-700";
    return <span className={`${classes}${color}`}>{forType}</span>;
};