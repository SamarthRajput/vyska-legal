"use client"

import * as React from "react"
import useSWR, { mutate } from "swr"
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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Generate time ranges (e.g., 09:00-09:30) for a single day window
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

export default function AppointmentAdmin() {
    // data
    const { data: slots, isLoading } = useSWR<AppointmentSlot[]>("/api/admin/slots", fetcher)

    // slot generation state
    const [startDate, setStartDate] = React.useState("")
    const [endDate, setEndDate] = React.useState("")
    const [duration, setDuration] = React.useState<number>(30)
    const [dayStart, setDayStart] = React.useState("09:00")
    const [dayEnd, setDayEnd] = React.useState("17:00")
    const [generated, setGenerated] = React.useState<string[]>([])
    const [selected, setSelected] = React.useState<Set<string>>(new Set())

    // group/filter/selection state
    const [groupBy, setGroupBy] = React.useState<"date" | "week">("date")
    const [showFilter, setShowFilter] = React.useState<"all" | "booked" | "available">("all")
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())

    // new state for time-based filter and pagination
    const [whenFilter, setWhenFilter] = React.useState<"all" | "upcoming" | "past">("all")
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(20)

    const [bookingSlot, setBookingSlot] = React.useState<AppointmentSlot | null>(null)
    const [userName, setUserName] = React.useState("")
    const [userEmail, setUserEmail] = React.useState("")
    const [userPhone, setUserPhone] = React.useState("")

    const byId = React.useMemo(() => new Map((slots ?? []).map((s) => [s.id, s])), [slots])

    const getSlotStartDate = (slot: AppointmentSlot) => {
        // timeSlot format: "HH:MM-HH:MM"
        const [start] = slot.timeSlot.split("-")
        const [h, m] = start.split(":").map(Number)
        const d = new Date(slot.date)
        d.setHours(h, m ?? 0, 0, 0)
        return d
    }

    const filteredSlots = React.useMemo(() => {
        let arr = slots ?? []
        if (showFilter === "booked") arr = arr.filter((s) => s.isBooked)
        if (showFilter === "available") arr = arr.filter((s) => !s.isBooked)

        if (whenFilter !== "all") {
            const now = new Date()
            if (whenFilter === "upcoming") {
                arr = arr.filter((s) => getSlotStartDate(s) >= now)
            } else if (whenFilter === "past") {
                arr = arr.filter((s) => getSlotStartDate(s) < now)
            }
        }

        // sort by date then time start
        arr = [...arr].sort((a, b) => getSlotStartDate(a).getTime() - getSlotStartDate(b).getTime())
        return arr
    }, [slots, showFilter, whenFilter])

    const totalCount = filteredSlots.length
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const currentPage = Math.min(page, totalPages)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pageSlots = React.useMemo(
        () => filteredSlots.slice(startIndex, endIndex),
        [filteredSlots, startIndex, endIndex],
    )

    const groupedPage = React.useMemo(() => {
        const map = new Map<string, { label: string; items: AppointmentSlot[] }>()
        for (const s of pageSlots) {
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
    }, [pageSlots, groupBy])

    React.useEffect(() => {
        setPage(1)
    }, [showFilter, whenFilter, groupBy, pageSize])

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
        const res = await fetch("/api/admin/slots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                startDate,
                endDate,
                timeSlots: Array.from(selected),
            }),
        })
        const data = await res.json()
        if (res.ok) {
            toast.success("Slots created", {
                description: `${data.created} new slot(s) added.`,
            })
            setGenerated([])
            setSelected(new Set())
            setStartDate("")
            setEndDate("")
            mutate("/api/admin/slots")
        } else {
            toast.error("Create failed", {
                description: data.error || "Server error",
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
    }

    const cancelAppointment = async (id: string) => {
        const res = await fetch(`/api/admin/appointments?id=${id}`, { method: "DELETE" })
        const data = await res.json()
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
    }

    const updateStatus = async (id: string, status: AppointmentStatus, reason?: string) => {
        const res = await fetch(`/api/admin/appointments`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointmentId: id, status, reason }),
        })
        const data = await res.json()
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
    }

    const toggleRow = (id: string) => {
        const slot = byId.get(id)
        // Only allow selecting unbooked slots
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
        const res = await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE" })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
            toast.success("Deleted", {
                description: "Slot removed.",
            })
            setSelectedRows((prev) => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
            mutate("/api/admin/slots")
        } else {
            toast.error("Delete failed", {
                description: data.error || "Server error",
            })
        }
    }

    const deleteSelected = async () => {
        if (selectedRows.size === 0) return
        const ids = Array.from(selectedRows)
        let deleted = 0
        for (const id of ids) {
            const slot = byId.get(id)
            if (!slot || slot.isBooked) continue
            const res = await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE" })
            if (res.ok) deleted++
        }
        toast.success("Bulk delete complete", {
            description: `${deleted} slot(s) deleted.`,
        })
        setSelectedRows(new Set())
        mutate("/api/admin/slots")
    }

    const toggleGroup = (items: AppointmentSlot[]) => {
        // select/deselect only unbooked slots in this group
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
        // Generate only once for a single day preview
        const ranges = generateTimeRanges(dayStart, dayEnd, duration)
        setGenerated(ranges)
        setSelected(new Set())
    }

    return (
        <div className="space-y-8">
            {/* Slot generation */}
            <Card className="border-muted">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Bulk Slot Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={onGenerate} variant="default">
                            Generate slots
                        </Button>
                        <Button onClick={createSelected} variant="secondary" disabled={selected.size === 0}>
                            Create selected ({selected.size})
                        </Button>
                    </div>

                    {generated.length > 0 && (
                        <>
                            <Separator />
                            <p className="text-xs text-muted-foreground">
                                Showing time slots for a single day. When you Create selected, these times will be created for each date
                                in the selected date range.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                                {generated.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => toggleSelect(slot)}
                                        className={cn(
                                            "rounded-md border px-2 py-1 text-sm transition-colors",
                                            selected.has(slot) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                                        )}
                                        aria-pressed={selected.has(slot)}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Existing slots */}
            <div className="space-y-3">
                {/* Change to vertical stack */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-medium">Existing Slots</h2>
                        <Badge variant="secondary">{slots?.length ?? 0} total</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm">Group by</Label>
                            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "date" | "week")}>
                                <SelectTrigger className="h-8 w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="week">Week</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm">Filter</Label>
                            <Select value={showFilter} onValueChange={(v) => setShowFilter(v as "all" | "booked" | "available")}>
                                <SelectTrigger className="h-8 w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="booked">Booked only</SelectItem>
                                    <SelectItem value="available">Available only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm">When</Label>
                            <Select value={whenFilter} onValueChange={(v) => setWhenFilter(v as "all" | "upcoming" | "past")}>
                                <SelectTrigger className="h-8 w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="past">Past</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator orientation="vertical" className="hidden sm:block h-6" />
                        <div className="flex items-center gap-2">
                            <Label className="text-sm">Page size</Label>
                            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                <SelectTrigger className="h-8 w-[110px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={selectedRows.size === 0}
                            onClick={deleteSelected}
                            title={selectedRows.size === 0 ? "No slots selected" : "Delete selected"}
                        >
                            Delete selected ({selectedRows.size})
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

                    <div className="rounded-md border mt-2 overflow-x-auto">
                        <Table className="min-w-[720px]">
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
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <div className="flex items-center gap-2 py-6">
                                                <Spinner className="h-4 w-4" />
                                                <span className="text-sm text-muted-foreground">Loading slots…</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
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
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            {g.label}{" "}
                                                            <span className="text-muted-foreground font-normal">· {g.items.length} slots</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                aria-label="Select unbooked in group"
                                                                // checked state: all unbooked selected
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
                                                <TableRow key={slot.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedRows.has(slot.id)}
                                                            onCheckedChange={() => toggleRow(slot.id)}
                                                            disabled={slot.isBooked}
                                                            aria-label="Select slot"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{format(new Date(slot.date), "PPP")}</TableCell>
                                                    <TableCell>{slot.timeSlot}</TableCell>
                                                    <TableCell>
                                                        {slot.isBooked ? <Badge variant="default">Yes</Badge> : <Badge variant="outline">No</Badge>}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell max-w-[360px]">
                                                        {slot.Appointment.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {slot.Appointment.map((a) => (
                                                                    <Badge key={a.id} variant="secondary" className="font-normal">
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
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" onClick={() => setBookingSlot(slot)}>
                                                                    Book
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => deleteSlot(slot.id)}>
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end gap-2">
                                                                {slot.Appointment.map((a) => (
                                                                    <div key={a.id} className="flex items-center gap-2">
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
                                                                        <Button variant="destructive" size="sm" onClick={() => cancelAppointment(a.id)}>
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

                    {/* Pagination controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            Showing {totalCount === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, totalCount)} of {totalCount}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={currentPage === 1}>
                                First
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                Last
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Booking dialog */}
                <Dialog open={!!bookingSlot} onOpenChange={(open) => !open && setBookingSlot(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Book appointment</DialogTitle>
                            <DialogDescription>
                                {bookingSlot ? `${format(new Date(bookingSlot.date), "PPP")} · ${bookingSlot.timeSlot}` : ""}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (optional)</Label>
                                <Input
                                    id="phone"
                                    value={userPhone}
                                    onChange={(e) => setUserPhone(e.target.value)}
                                    placeholder="+1 555 555 5555"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="ghost" onClick={() => setBookingSlot(null)}>
                                Close
                            </Button>
                            <Button onClick={bookNow}>Book</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
