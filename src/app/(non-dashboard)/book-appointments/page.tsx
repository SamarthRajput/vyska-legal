"use client"

import React from "react"
import useSWR, { mutate } from "swr"
import { toast } from "sonner"
import { format } from "date-fns"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import MarkedCalendar from "./Calander"

type Slots = {
    id: string
    date: string
    timeSlot: string
    isBooked: boolean
    createdAt: string
    updatedAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function toYMD(d: Date) {
    const y = d.getFullYear()
    const m = `${d.getMonth() + 1}`.padStart(2, "0")
    const day = `${d.getDate()}`.padStart(2, "0")
    return `${y}-${m}-${day}`
}

function buildAvailabilitySet(slots: Slots[]) {
    const set = new Set<string>()
    for (const s of slots) {
        if (!s.isBooked) set.add(s.date)
    }
    return set
}

function AvailabilityDot({ available }: { available: boolean }) {
    if (!available) return null
    return (
        <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary"
            title="Available slot"
        />
    )
}

function CalendarSkeleton() {
    return (
        <div className="w-full animate-pulse space-y-2" aria-busy="true" aria-label="Loading calendar">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-2" />
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-8 w-8 bg-muted rounded" />
                ))}
            </div>
        </div>
    )
}

function SlotsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3" aria-busy="true" aria-label="Loading slots">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
            ))}
        </div>
    )
}

function ErrorAlert({ message }: { message: string }) {
    return (
        <div
            className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-destructive text-sm mt-4"
            role="alert"
            aria-live="assertive"
            title="Error"
        >
            <svg width="20" height="20" fill="none" className="text-destructive shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{message}</span>
        </div>
    )
}

export default function BookAppointmentsPage() {
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
    const selectedYMD = toYMD(selectedDate)
    const [selectedSlotId, setSelectedSlotId] = React.useState<string>("")
    const [agenda, setAgenda] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [submitting, setSubmitting] = React.useState(false)
    const [daySlots, setDaySlots] = React.useState<Slots[]>([])

    const {
        data: availabilityData,
        isLoading: availabilityLoading,
        error: availabilityError,
    } = useSWR<{ slots: Slots[] }>("/api/slots?limit=1000&show=available&when=upcoming", fetcher, {
        revalidateOnFocus: false,
    })

    const availabilitySet = React.useMemo(() => buildAvailabilitySet(availabilityData?.slots ?? []), [availabilityData])

    const {
        data: daySlotsData,
        isLoading: daySlotsLoading,
        error: daySlotsError,
    } = useSWR<{ slots: Slots[]; pagination?: { total?: number } }>(
        selectedYMD ? `/api/slots?limit=1000&show=available&when=upcoming&date=${selectedYMD}` : null,
        fetcher,
        { revalidateOnFocus: false },
    )
    React.useEffect(() => {
        setDaySlots(daySlotsData?.slots ?? [])
        setSelectedSlotId("")
    }, [daySlotsData])

    const handleSelectSlot = (slotId: string) => {
        setSelectedSlotId(slotId)
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSlotId || !agenda) {
            toast.error("Please select a slot and add your agenda")
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slotId: selectedSlotId, agenda, phone }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data?.error || "Failed to book appointment")
            } else {
                toast.success("Appointment booked successfully")
                setAgenda("")
                setPhone("")
                setSelectedSlotId("")
                mutate("/api/slots?limit=1000&show=available&when=upcoming")
                mutate(`/api/slots?limit=1000&show=available&when=upcoming&date=${selectedYMD}`)
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to book appointment")
        } finally {
            setSubmitting(false)
        }
    }

    const hasError = availabilityError || daySlotsError
    const errorMessage =
        availabilityError?.message ||
        daySlotsError?.message ||
        (typeof hasError === "string" ? hasError : "Failed to load data. Please refresh the page.")

    return (
        <main className="mx-auto max-w-6xl p-4 sm:p-6">
            <header className="mb-6">
                <h1 className="text-balance text-center text-3xl font-bold" title="Book an Appointment">Book an Appointment</h1>
                <p className="mt-2 text-center text-muted-foreground">
                    Choose a date with availability, pick a time, and confirm your booking.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="min-h-[420px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg" title="Select a date">Select a date</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center">
                        {availabilityLoading ? (
                            <CalendarSkeleton />
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(d) => d && setSelectedDate(d)}
                                    components={{
                                        DayButton: (props) => {
                                            const d = props.day.date
                                            const ymd = toYMD(d)
                                            const available = availabilitySet.has(ymd)
                                            return (
                                                <div className="relative">
                                                    <CalendarDayButton {...props} title={available ? "Available" : "Unavailable"} aria-label={available ? "Available" : "Unavailable"} />
                                                    <AvailabilityDot available={available} />
                                                </div>
                                            )
                                        },
                                    }}
                                    className="rounded-md border shadow-sm"
                                    aria-label="Calendar"
                                    title="Calendar"
                                />
                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" title="Available slot" aria-hidden="true" />
                                    <span>Indicates available slots</span>
                                </div>
                            </div>
                        )}
                        {hasError && <ErrorAlert message={errorMessage} />}
                    </CardContent>
                </Card>

                <Card className="min-h-[420px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg" title={`Available slots for ${format(selectedDate, "PPP")}`}>{`Available slots for ${format(selectedDate, "PPP")}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                        <div>
                            {daySlotsLoading ? (
                                <SlotsSkeleton />
                            ) : daySlots.length === 0 ? (
                                <p className="text-sm text-muted-foreground" aria-live="polite">No available slots for this date.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3" role="list" aria-label="Available time slots">
                                    {daySlots.map((slot) => {
                                        const isSelected = selectedSlotId === slot.id
                                        return (
                                            <Button
                                                key={slot.id}
                                                type="button"
                                                variant={isSelected ? "default" : "outline"}
                                                onClick={() => handleSelectSlot(slot.id)}
                                                className={cn(
                                                    "justify-center whitespace-nowrap",
                                                    isSelected && "ring-2 ring-ring"
                                                )}
                                                disabled={slot.isBooked}
                                                aria-pressed={isSelected}
                                                aria-label={`Select ${slot.timeSlot}`}
                                                title={`Select ${slot.timeSlot}${slot.isBooked ? " (Booked)" : ""}`}
                                            >
                                                {slot.timeSlot}
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <form onSubmit={onSubmit} className="space-y-3 mt-2 flex-1 flex flex-col justify-end" aria-label="Booking form" title="Booking form">
                            <div className="grid gap-2">
                                <label htmlFor="agenda" className="text-sm font-medium">
                                    Agenda
                                </label>
                                <Textarea
                                    id="agenda"
                                    name="agenda"
                                    placeholder="Agenda (required)"
                                    value={agenda}
                                    onChange={(e) => setAgenda(e.target.value)}
                                    required
                                    aria-required="true"
                                    aria-label="Agenda"
                                    title="Agenda"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="phone" className="text-sm font-medium">
                                    Phone (optional)
                                </label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Include country code if applicable"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    aria-label="Phone"
                                    title="Phone"
                                />
                            </div>

                            <CardFooter className="p-0">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={!selectedSlotId || submitting}
                                    aria-disabled={!selectedSlotId || submitting}
                                    aria-label="Confirm Booking"
                                    title="Confirm Booking"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 animate-spin" aria-hidden="true" /> Booking…
                                        </>
                                    ) : (
                                        "Confirm Booking"
                                    )}
                                </Button>
                            </CardFooter>

                            {!selectedSlotId && (
                                <p className="text-xs text-muted-foreground" aria-live="polite">Select a time slot above to enable booking.</p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
