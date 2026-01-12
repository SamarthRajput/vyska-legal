/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
import Link from "next/link";


export default function UserOverviewPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/overview")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load user data");
        setError("Failed to load user data");
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonDashboard />;
  if (!data)
    return (
      <div className="flex flex-col items-center justify-center mt-16">
        <p className="text-lg font-semibold text-red-500">Dashboard Data Unavailable</p>
        <p className="text-gray-500">{error || "Please refresh the page."}</p>
      </div>
    );

  const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#F43F5E"];

  return (
    <div className="p-2 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Blogs" value={data.blogs.total} color="from-indigo-100 to-indigo-50" />
        <SummaryCard title="Approved Blogs" value={data.blogs.approved} color="from-green-100 to-green-50" />
        <SummaryCard title="Pending Blogs" value={data.blogs.pending} color="from-yellow-100 to-yellow-50" />
        <SummaryCard title="Rejected Blogs" value={data.blogs.rejected} color="from-red-100 to-red-50" />
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <CardContainer>
          <h2 className="font-semibold mb-2 text-gray-700">Blog Status Overview</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={[
                { status: "APPROVED", count: data.blogs.approved },
                { status: "PENDING", count: data.blogs.pending },
                { status: "REJECTED", count: data.blogs.rejected },
                { status: "DRAFT", count: data.blogs.draft },
              ]}
            >
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContainer>
        <CardContainer>
          <h2 className="font-semibold mb-2 text-gray-700">Appointments Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.appointments.byStatus}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="_count.status" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContainer>
      </div>

      <CardContainer>
        <div className="flex flex-row justify-between items-center mb-2">
          <h2 className="font-semibold text-gray-700">Upcoming Appointments</h2>
          <ViewMoreLink href="/user/manage-appointments" />
        </div>
        <RecentTable
          headers={["Date", "Time", "Type", "Status"]}
          rows={data.appointments.upcoming.map((a: any, i: number) => [
            <span key={i + "-date"} className="font-medium text-gray-700">{new Date(a.slot.date).toLocaleDateString()}</span>,
            a.slot.timeSlot,
            a.appointmentType.title,
            <StatusBadge key={i} status={a.status} />,
          ])}
        />
      </CardContainer>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <CardContainer>
          <h2 className="font-semibold mb-2 text-gray-700">Payments by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.payments.byStatus.map((p: any) => ({
                  name: p.status,
                  value: p._count.status,
                }))}
                dataKey="value"
                label
                outerRadius={90}
              >
                {COLORS.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContainer>
        <CardContainer>
          <div className="flex flex-col justify-center items-center h-full gap-2">
            <span className="text-lg text-gray-500 font-semibold">Total Spent</span>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center"
            >
              <span className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-600 via-violet-500 to-indigo-400 text-transparent bg-clip-text">
                ₹{Number(data.payments.totalSpent).toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">Money spent so far</span>
            </motion.div>
          </div>
        </CardContainer>
      </div>

      <CardContainer>
        <div className="flex flex-row justify-between items-center mb-2">
          <h2 className="font-semibold text-gray-700">Recent Payments</h2>
        </div>
        <RecentTable
          headers={["Amount", "Status", "For", "Created At"]}
          rows={data.payments.recent.map((p: any, i: number) => [
            <span className="font-semibold text-indigo-700" key={i + "-amt"}>₹{Number(p.amount).toLocaleString()}</span>,
            <StatusBadge key={i} status={p.status} />,
            p.paymentFor,
            new Date(p.createdAt).toLocaleString(),
          ])}
        />
      </CardContainer>
    </div>
  );
}

const SummaryCard = ({
  title,
  value,
  icon,
  color = "from-gray-100 to-gray-50",
}: {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className={`shadow-xl rounded-3xl bg-gradient-to-br ${color} border border-indigo-100 px-6 py-6 flex flex-col items-center gap-2 min-h-[145px]`}>
      <div className="mb-2">{icon}</div>
      <div className="text-3xl md:text-4xl font-bold text-indigo-700 tracking-tight">{value}</div>
      <div className="text-sm text-gray-500 font-semibold">{title}</div>
    </div>
  </motion.div>
);

const CardContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-3xl shadow-lg bg-white/70 border border-indigo-100 p-6 min-h-[280px]">{children}</div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let color = "bg-gray-200 text-gray-700";
  if (status === "PENDING") color = "bg-yellow-100 text-yellow-700";
  if (["APPROVED", "SUCCESS", "CONFIRMED"].includes(status))
    color = "bg-green-100 text-green-700";
  if (["REJECTED", "FAILED", "CANCELLED"].includes(status))
    color = "bg-red-100 text-red-700";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${color} border`}>
      {status}
    </span>
  );
};

const ViewMoreLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-xs text-violet-700 hover:underline font-medium">
    View more &rarr;
  </Link>
);

const RecentTable = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: (React.ReactNode | string | number | null)[][];
}) => (
  <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white/90">
    <table className="w-full text-left text-sm bg-transparent">
      <thead className="bg-gray-50 text-gray-700">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="p-3 font-semibold whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="p-4 text-center text-gray-400">
              No data available
            </td>
          </tr>
        ) : (
          rows.map((r, i) => (
            <tr key={i} className="border-b hover:bg-indigo-50 transition-colors">
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

const SkeletonDashboard = () => (
  <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-8">
    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6" />
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-3xl h-36" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl h-64" />
      ))}
    </div>
  </div>
);
