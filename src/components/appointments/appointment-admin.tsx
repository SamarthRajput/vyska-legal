/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { mutate } from "swr"
import { format, startOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Pagination from "../Pagination"

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED"

interface Appointment {
    id: string
    createdAt: string
    updatedAt: string
    status: AppointmentStatus
    userName: string
    userEmail: string
    userPhone: string | null
    slotId: string
    userId: string | null
}
interface AppointmentSlot {
    id: string
    date: string
    timeSlot: string
    isBooked: boolean
    createdAt: string
    updatedAt: string
    Appointment: Appointment[]
}

function generateTimeRanges(start: string, end: string, durationMinutes: number) {
    const out: string[] = []
    const [sh, sm] = start.split(":").map(Number)
    const [eh, em] = end.split(":").map(Number)
    let cur = new Date()
    cur.setHours(sh, sm, 0, 0)
    const endDate = new Date()
    endDate.setHours(eh, em, 0, 0)
    while (cur < endDate) {
        const next = new Date(cur.getTime() + durationMinutes * 60 * 1000)
        out.push(
            `${cur.getHours().toString().padStart(2, "0")}:${cur.getMinutes().toString().padStart(2, "0")}-${next
                .getHours()
                .toString()
                .padStart(2, "0")}:${next.getMinutes().toString().padStart(2, "0")}`,
        )
        cur = next
    }
    return out
}

function TableSkeletonRows({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <TableCell key={j}>
                            <div className="h-4 w-full rounded bg-muted animate-pulse" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}

export default function AppointmentAdmin() {
    const [data, setData] = React.useState<{ slots: AppointmentSlot[] }>({ slots: [] })
    const [isLoading, setIsLoading] = React.useState(true)
    const [deletingId, setDeletingId] = React.useState<string | null>(null)
    const [insertingId, setInsertingId] = React.useState<string | null>(null)
    const [startDate, setStartDate] = React.useState("")
    const [endDate, setEndDate] = React.useState("")
    const [duration, setDuration] = React.useState<number>(30)
    const [dayStart, setDayStart] = React.useState("09:00")
    const [dayEnd, setDayEnd] = React.useState("17:00")
    const [generated, setGenerated] = React.useState<string[]>([])
    const [selected, setSelected] = React.useState<Set<string>>(new Set())
    const [groupBy, setGroupBy] = React.useState<"date" | "week">("date")
    const [showFilter, setShowFilter] = React.useState<"all" | "booked" | "available">("all")
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
    const [whenFilter, setWhenFilter] = React.useState<"all" | "upcoming" | "past">("all")
    const [pagination, setPagination] = React.useState({ page: 1, limit: 50, total: 0 })
    const [bookingSlot, setBookingSlot] = React.useState<AppointmentSlot | null>(null)
    const [userName, setUserName] = React.useState("")
    const [userEmail, setUserEmail] = React.useState("")
    const [userPhone, setUserPhone] = React.useState("")
    const [actionLoading, setActionLoading] = React.useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/slots?page=${pagination.page}&limit=${pagination.limit}&when=${whenFilter}&show=${showFilter}`)
            if (!response.ok) {
                throw new Error("Failed to fetch slots")
            }
            const data = await response.json()
            setData(data)
            setPagination(data.pagination)
        } catch (error: any) {
            toast.error("Failed to fetch slots", {
                description: error?.message || "An error occurred while fetching slots.",
                action: {
                    label: "Retry",
                    onClick: fetchData,
                },
            })
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [pagination.page, pagination.limit, whenFilter, showFilter])

    const byId = React.useMemo(() => new Map((data.slots ?? []).map((s) => [s.id, s])), [data.slots])

    const getSlotStartDate = (slot: AppointmentSlot) => {
        const [start] = slot.timeSlot.split("-")
        const [h, m] = start.split(":").map(Number)
        const d = new Date(slot.date)
        d.setHours(h, m ?? 0, 0, 0)
        return d
    }

    const groupedPage = React.useMemo(() => {
        const map = new Map<string, { label: string; items: AppointmentSlot[] }>()
        for (const s of (data.slots ?? [])) {
            const d = new Date(s.date)
            if (groupBy === "date") {
                const key = format(d, "PPP")
                const group = map.get(key) ?? { label: key, items: [] }
                group.items.push(s)
                map.set(key, group)
            } else {
                const sw = startOfWeek(d, { weekStartsOn: 1 })
                const key = `w-${sw.toISOString().slice(0, 10)}`
                const label = `Week of ${format(sw, "PPP")}`
                const group = map.get(key) ?? { label, items: [] }
                group.items.push(s)
                map.set(key, group)
            }
        }
        return Array.from(map.values())
    }, [groupBy, data.slots])

    React.useEffect(() => {
        setPagination((p) => ({ ...p, page: 1 }))
    }, [showFilter, whenFilter, groupBy, pagination.limit])

    const toggleSelect = (slot: string) => {
        setSelected((prev) => {
            const s = new Set(prev)
            s.has(slot) ? s.delete(slot) : s.add(slot)
            return s
        })
    }

    const createSelected = async () => {
        if (!startDate || !endDate || selected.size === 0) {
            toast.error("Nothing to create", {
                description: "Pick a date range and at least one time slot.",
            })
            return
        }
        setActionLoading(true)
        toast.info("Creating slots...", { duration: 2000 })
        try {
            const res = await fetch("/api/admin/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    timeSlots: Array.from(selected),
                }),
            })
            const dataRes = await res.json()
            setActionLoading(false)
            if (res.ok) {
                toast.dismiss()
                toast.success("Slots created", {
                    description: `${dataRes.created} new slot(s) added.`,
                })
                setGenerated([])
                setSelected(new Set())
                setStartDate("")
                setEndDate("")
                fetchData()
            } else {
                toast.error("Create failed", {
                    description: dataRes.error || "Server error",
                })
            }
        } catch (error: any) {
            setActionLoading(false)
            toast.error("Create failed", {
                description: error?.message || "Server error",
            })
        }
    }

    const bookNow = async () => {
        if (!bookingSlot || !userName || !userEmail) {
            toast.error("Missing info", {
                description: "Name and email are required.",
            })
            return
        }
        setActionLoading(true)
        try {
            const res = await fetch("/api/admin/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName,
                    userEmail,
                    userPhone,
                    slotId: bookingSlot.id,
                }),
            })
            const data = await res.json()
            setActionLoading(false)
            if (res.ok) {
                toast.success("Booked", {
                    description: "Appointment booked successfully.",
                })
                setBookingSlot(null)
                setUserName("")
                setUserEmail("")
                setUserPhone("")
                mutate("/api/admin/slots")
            } else {
                toast.error("Booking failed", {
                    description: data.error || "Server error",
                })
            }
        } catch (error: any) {
            setActionLoading(false)
            toast.error("Booking failed", {
                description: error?.message || "Server error",
            })
        }
    }

    const cancelAppointment = async (id: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/appointments?id=${id}`, { method: "DELETE" })
            const data = await res.json()
            setActionLoading(false)
            if (res.ok) {
                toast.success("Cancelled", {
                    description: "Appointment cancelled.",
                })
                mutate("/api/admin/slots")
            } else {
                toast.error("Cancel failed", {
                    description: data.error || "Server error",
                })
            }
        } catch (error: any) {
            setActionLoading(false)
            toast.error("Cancel failed", {
                description: error?.message || "Server error",
            })
        }
    }

    const updateStatus = async (id: string, status: AppointmentStatus, reason?: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/appointments`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentId: id, status, reason }),
            })
            const data = await res.json()
            setActionLoading(false)
            if (res.ok) {
                toast.success("Updated", {
                    description: "Appointment updated successfully.",
                })
                if (status === "CANCELLED") {
                    toast.info("Cancelled Reason", {
                        description: `Reason: ${reason || "No reason provided"}`,
                        duration: 5000,
                    })
                }
                mutate("/api/admin/slots")
            } else {
                toast.error("Update failed", {
                    description: data.error || "Server error",
                })
            }
        } catch (error: any) {
            setActionLoading(false)
            toast.error("Update failed", {
                description: error?.message || "Server error",
            })
        }
    }

    const toggleRow = (id: string) => {
        const slot = byId.get(id)
        if (!slot || slot.isBooked) return
        setSelectedRows((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const deleteSlot = async (id: string) => {
        const slot = byId.get(id)
        if (!slot) return
        if (slot.isBooked) {
            toast.error("Cannot delete", {
                description: "Booked slots cannot be deleted.",
            })
            return
        }
        try {
            setActionLoading(true)
            setDeletingId(id)
            toast.info("Deleting slot...", { duration: 2000 })
            const res = await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE" })
            const dataRes = await res.json().catch(() => ({}))
            toast.dismiss()
            setActionLoading(false)
            if (res.ok) {
                toast.success("Deleted", {
                    description: "Slot removed.",
                })
                setData((prev) => ({
                    ...prev,
                    slots: prev.slots.filter((s) => s.id !== id)
                }))
                setSelectedRows((prev) => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                })
                fetchData()
            } else {
                toast.error("Delete failed", {
                    description: dataRes.error || "Server error",
                })
            }
        } catch (error: any) {
            setActionLoading(false)
            toast.error("Delete failed", {
                description: error?.message || "Server error",
            })
        } finally {
            setDeletingId(null)
        }
    }

    const deleteSelected = async () => {
        if (selectedRows.size === 0) return
        setActionLoading(true)
        let deleted = 0
        try {
            const ids = Array.from(selectedRows)
            for (const id of ids) {
                const slot = byId.get(id)
                if (!slot || slot.isBooked) continue
                const res = await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE" })
                if (res.ok) deleted++
            }
            toast.success("Bulk delete complete", {
                description: `${deleted} slot(s) deleted.`,
            })
            setData((prev) => ({
                ...prev,
                slots: prev.slots.filter((s) => !selectedRows.has(s.id))
            }))
            setSelectedRows(new Set())
            setActionLoading(false)
            fetchData()
        } catch (error: any) {
            setActionLoading(false)
            toast.error("Bulk delete failed", {
                description: error?.message || "Server error",
            })
        }
    }

    const toggleGroup = (items: AppointmentSlot[]) => {
        const ids = items.filter((s) => !s.isBooked).map((s) => s.id)
        if (ids.length === 0) return
        setSelectedRows((prev) => {
            const next = new Set(prev)
            const allSelected = ids.every((id) => next.has(id))
            if (allSelected) {
                ids.forEach((id) => next.delete(id))
            } else {
                ids.forEach((id) => next.add(id))
            }
            return next
        })
    }

    const onGenerate = () => {
        if (!startDate || !endDate) {
            toast.error("Missing dates", {
                description: "Select start and end dates first.",
            })
            return
        }
        const ranges = generateTimeRanges(dayStart, dayEnd, duration)
        setGenerated(ranges)
        setSelected(new Set())
    }

    return (
        <div className="w-full flex flex-col gap-6 px-2 sm:px-4 md:px-8 py-4 overflow-x-auto">
            {actionLoading && (
                <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
                    <Spinner className="w-10 h-10" />
                </div>
            )}

            <Card className="w-full shadow-none border mb-0 p-0">
                <CardHeader className="pb-1 px-2 sm:px-4 pt-3">
                    <CardTitle className="text-lg sm:text-xl font-semibold">Bulk Slot Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-2 sm:p-4 pt-2">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Start date</Label>
                            <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date">End date</Label>
                            <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Slot duration</Label>
                            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 mins</SelectItem>
                                    <SelectItem value="30">30 mins</SelectItem>
                                    <SelectItem value="60">60 mins</SelectItem>
                                    <SelectItem value="90">90 mins</SelectItem>
                                    <SelectItem value="120">120 mins</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Day start</Label>
                            <Input type="time" value={dayStart} onChange={(e) => setDayStart(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Day end</Label>
                            <Input type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <Button
                            onClick={onGenerate}
                            variant="default"
                            size="sm"
                            className="min-w-[110px]"
                            title="Preview time slots for a single day"
                            aria-label="Generate slots"
                        >
                            Generate slots
                        </Button>
                        <Button
                            onClick={createSelected}
                            variant="secondary"
                            size="sm"
                            disabled={selected.size === 0 || actionLoading}
                            className="min-w-[140px] flex items-center gap-2"
                            title={selected.size === 0 ? "Select at least one slot" : "Create selected slots"}
                            aria-label="Create selected slots"
                        >
                            {actionLoading && <Spinner className="w-4 h-4" />}
                            Create selected (
                            {selected.size} slot{selected.size > 1 ? "s" : ""}
                            {startDate && endDate && startDate !== endDate && selected.size > 0
                                ? ` for ${Math.max(
                                    0,
                                    Math.ceil(
                                        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    ) + 1
                                )
                                } days)`
                                : ")"}
                        </Button>
                    </div>
                    {generated.length > 0 && (
                        <>
                            <Separator />
                            <p className="text-xs text-muted-foreground">
                                Showing time slots for a single day. When you Create selected, these times will be created for each date
                                in the selected date range.
                            </p>
                            <div className="w-full overflow-x-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2 min-w-[320px]">
                                    {generated.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => toggleSelect(slot)}
                                            className={cn(
                                                "rounded-md border px-2 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60",
                                                selected.has(slot) ? "bg-primary text-primary-foreground shadow" : "bg-card hover:bg-muted"
                                            )}
                                            aria-pressed={selected.has(slot)}
                                            title={selected.has(slot) ? "Deselect slot" : "Select slot"}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card className="w-full shadow-none border mt-0 p-0">
                <CardHeader className="pb-1 px-2 sm:px-4 pt-3">
                    <CardTitle className="text-lg sm:text-xl font-semibold">Manage Existing Slots</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 pt-2">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-medium">Existing Slots</h2>
                                    <Badge variant="secondary">{data.slots?.length ?? 0} total</Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-2 w-full">
                                    <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 min-w-[180px]">
                                        <div className="flex flex-col justify-end gap-1 w-full max-w-xs">
                                            <Label className="text-sm">Group by</Label>
                                            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "date" | "week")}>
                                                <SelectTrigger className="h-9 w-full min-w-[160px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="date">Date</SelectItem>
                                                    <SelectItem value="week">Week</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col justify-end gap-1 w-full max-w-xs">
                                            <Label className="text-sm">Filter</Label>
                                            <Select value={showFilter} onValueChange={(v) => setShowFilter(v as "all" | "booked" | "available")}>
                                                <SelectTrigger className="h-9 w-full min-w-[160px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="booked">Booked only</SelectItem>
                                                    <SelectItem value="available">Available only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col justify-end gap-1 w-full max-w-xs">
                                            <Label className="text-sm">When</Label>
                                            <Select value={whenFilter} onValueChange={(v) => setWhenFilter(v as "all" | "upcoming" | "past")}>
                                                <SelectTrigger className="h-9 w-full min-w-[160px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                                    <SelectItem value="past">Past</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-end gap-2 flex-wrap mt-2 sm:mt-0">
                                        <Separator orientation="vertical" className="hidden sm:block h-6" />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={selectedRows.size === 0 || actionLoading}
                                            onClick={deleteSelected}
                                            className="min-w-[120px] flex items-center gap-2"
                                        >
                                            {actionLoading && <Spinner className="w-4 h-4" />}
                                            {actionLoading ? "Deleting..." : `Delete selected (${selectedRows.size})`}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedRows(new Set())}
                                            disabled={selectedRows.size === 0}
                                        >
                                            Clear selection
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border mt-2 overflow-x-auto">
                                <Table className="min-w-[600px] w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[36px]">Select</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Booked</TableHead>
                                            <TableHead className="hidden md:table-cell">Appointments</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableSkeletonRows rows={pagination.limit} cols={6} />
                                        ) : groupedPage.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                                                    No slots found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            groupedPage.map((g) => (
                                                <React.Fragment key={g.label}>
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="bg-muted/50 text-sm font-medium">
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-3">
                                                                <div>
                                                                    {g.label}{" "}
                                                                    <span className="text-muted-foreground font-normal">· {g.items.length} slots</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 sm:gap-2">
                                                                    <Checkbox
                                                                        checked={
                                                                            g.items.filter((s) => !s.isBooked).every((s) => selectedRows.has(s.id)) &&
                                                                            g.items.some((s) => !s.isBooked)
                                                                        }
                                                                        onCheckedChange={() => toggleGroup(g.items)}
                                                                    />
                                                                    <span className="text-xs text-muted-foreground">Select group</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {g.items.map((slot) => (
                                                        <TableRow key={slot.id} className="transition-opacity duration-300 hover:bg-muted/40">
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selectedRows.has(slot.id)}
                                                                    onCheckedChange={() => toggleRow(slot.id)}
                                                                    disabled={slot.isBooked}
                                                                />
                                                            </TableCell>
                                                            <TableCell title={format(new Date(slot.date), "PPP")}>{format(new Date(slot.date), "PPP")}</TableCell>
                                                            <TableCell title={slot.timeSlot}>{slot.timeSlot}</TableCell>
                                                            <TableCell>
                                                                {slot.isBooked
                                                                    ? <Badge variant="default">Yes</Badge>
                                                                    : <Badge variant="outline">No</Badge>
                                                                }
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell max-w-[360px]">
                                                                {slot.Appointment.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                                                        {slot.Appointment.map((a) => (
                                                                            <Badge
                                                                                key={a.id}
                                                                                variant="secondary"
                                                                                className="font-normal"
                                                                            >
                                                                                {a.userName} · {a.status.toLowerCase()}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {!slot.isBooked ? (
                                                                    <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => setBookingSlot(slot)}
                                                                            disabled={actionLoading}
                                                                            className="transition-colors hover:bg-primary/80"
                                                                        >
                                                                            Book
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => deleteSlot(slot.id)}
                                                                            disabled={actionLoading}
                                                                            className="transition-colors hover:bg-destructive/80"
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2">
                                                                        {slot.Appointment.map((a) => (
                                                                            <div key={a.id} className="flex items-center gap-1 sm:gap-2">
                                                                                <Select
                                                                                    value={a.status}
                                                                                    onValueChange={(v) => updateStatus(a.id, v as AppointmentStatus)}
                                                                                >
                                                                                    <SelectTrigger className="h-8 w-[130px]">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    onClick={() => cancelAppointment(a.id)}
                                                                                    disabled={actionLoading}
                                                                                    className="transition-colors hover:bg-destructive/80"
                                                                                >
                                                                                    Cancel
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="w-full flex justify-center">
                                <Pagination
                                    pagination={{
                                        page: pagination.page,
                                        totalPages: Math.ceil(pagination.total / pagination.limit),
                                        total: pagination.total,
                                    }}
                                    limit={pagination.limit}
                                    setLimit={(v) => setPagination((p) => ({ ...p, limit: v }))}
                                    handlePageChange={(v) => setPagination((p) => ({ ...p, page: v }))}
                                />
                            </div>
                        </div>
                        {bookingSlot && (
                            <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-40">
                                <Dialog open={!!bookingSlot} onOpenChange={(open) => !open && setBookingSlot(null)}>
                                    <DialogContent className="max-w-[95vw] sm:max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Book appointment</DialogTitle>
                                            <DialogDescription>
                                                {bookingSlot ? `${format(new Date(bookingSlot.date), "PPP")} · ${bookingSlot.timeSlot}` : ""}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-2 sm:gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={userName}
                                                    onChange={(e) => setUserName(e.target.value)}
                                                    placeholder="Jane Doe"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={userEmail}
                                                    onChange={(e) => setUserEmail(e.target.value)}
                                                    placeholder="jane@example.com"
                                                />
                                                <div className="mb-2 text-xs text-muted-foreground">
                                                    An email confirmation will be sent to the user.
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="phone">Phone (optional)</Label>
                                                <Input
                                                    id="phone"
                                                    value={userPhone}
                                                    onChange={(e) => setUserPhone(e.target.value)}
                                                    placeholder="+1 555 555 5555"
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2 flex flex-col-reverse sm:flex-row sm:justify-end">
                                            <Button variant="ghost" onClick={() => setBookingSlot(null)}>
                                                Close
                                            </Button>
                                            <Button onClick={bookNow} disabled={actionLoading}>
                                                {actionLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                                                {actionLoading ? "Booking..." : "Book now"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
