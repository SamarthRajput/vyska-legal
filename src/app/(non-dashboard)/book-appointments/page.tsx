/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useRazorpayPayment } from "@/lib/useRazorpayPayment"

type Slots = {
    id: string
    date: string
    timeSlot: string
    isBooked: boolean
    createdAt: string
    updatedAt: string
}
interface AppointmentTypes {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    subTitle: string | null;
    description: string | null;
    price: number | { toNumber: () => number };
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
    const [appointmentType, setAppointmentType] = React.useState<AppointmentTypes[] | null>(null)
    const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = React.useState<string>("")
    const selectedYMD = toYMD(selectedDate)
    const [selectedSlotId, setSelectedSlotId] = React.useState<string>("")
    const [agenda, setAgenda] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [daySlots, setDaySlots] = React.useState<Slots[]>([])
    const [paymentStatus, setPaymentStatus] = React.useState<"idle" | "processing" | "success" | "error">("idle")
    const [paymentErrorMsg, setPaymentErrorMsg] = React.useState<string>("")
    const [timeLeftInRedirect, setTimeLeftInRedirect] = React.useState<number>(5)
    const router = useRouter()

    const { startPayment, isProcessing } = useRazorpayPayment();
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
        const fetchAppointmentTypes = async () => {
            try {
                const res = await fetch("/api/appointment-type?activeOnly=true");
                const data = await res.json();
                if (res.ok && data.appointmentTypes && data.appointmentTypes.length > 0) {
                    setAppointmentType(data.appointmentTypes);
                }
            } catch (error) {
                toast.error("Failed to fetch Service Types");
                console.error("Failed to fetch Service Types:", error);
            }
        };
        fetchAppointmentTypes();
    }, []);

    React.useEffect(() => {
        setDaySlots(daySlotsData?.slots ?? [])
        setSelectedSlotId("")
    }, [daySlotsData])

    const handleSelectSlot = (slotId: string) => {
        setSelectedSlotId(slotId)
    }

    const handleDateSelect = (d: Date | undefined) => {
        if (d) {
            setSelectedDate(d)
            setSelectedSlotId("")
        }
    }

    const handlePay = () => {
        if (!selectedAppointmentTypeId || !selectedSlotId) {
            toast.error("Service Type or slot is missing.");
            return;
        }
        setPaymentStatus("processing")
        startPayment({
            paymentFor: 'APPOINTMENT',
            appointmentTypeId: selectedAppointmentTypeId,
            agenda: agenda ? agenda : 'No message provided',
            slotId: selectedSlotId,
            description: `Payment for appointment on ${format(selectedDate, "PPP")}`,
            onSuccess: handlePaymentSuccess,
            onError: handlePaymentError,
        });
    };

    const handlePaymentSuccess = () => {
        setPaymentStatus("success")
        toast.success("Appointment booked successfully!");
        // Reset form
        setSelectedSlotId("")
        setAgenda("")
        setPhone("")
        setTimeLeftInRedirect(5);
        // Start countdown and redirect after 5 seconds
        let seconds = 5;
        const interval = setInterval(() => {
            seconds -= 1;
            setTimeLeftInRedirect(seconds);
            if (seconds <= 0) {
                clearInterval(interval);
                router.push("/user/manage-appointments");
            }
        }, 1000);
    };

    const handlePaymentError = (error: any) => {
        setPaymentStatus("error")
        setPaymentErrorMsg(error?.message || "Payment failed, please try again.")
        console.error("Payment Error:", error);
        toast.info("Payment was not completed.");
        toast.error(error?.message || "Payment failed, please try again.");
    }

    const hasError = availabilityError || daySlotsError
    const errorMessage =
        availabilityError?.message ||
        daySlotsError?.message ||
        (typeof hasError === "string" ? hasError : "Failed to load data. Please refresh the page.")

    return (
        <main className="mx-auto max-w-6xl p-4 sm:p-6 relative">
            {/* Overlay for payment processing */}
            {paymentStatus === "processing" && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center bg-white rounded-lg shadow-lg px-6 py-8 max-w-xs w-full mx-2">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-lg font-medium text-blue-700 text-center">Processing your payment...</span>
                        <span className="text-sm text-muted-foreground mt-2 text-center">Please do not close or refresh this page.</span>
                    </div>
                </div>
            )}
            {/* Overlay for payment success */}
            {paymentStatus === "success" && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center bg-white rounded-lg shadow-lg px-6 py-8 max-w-xs w-full mx-2">
                        <svg className="h-12 w-12 text-green-600 mb-4" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-lg font-semibold text-green-700 text-center">Appointment booked successfully!</span>
                        <span className="text-sm text-muted-foreground mt-2 text-center">Redirecting to your appointments in {timeLeftInRedirect} seconds...</span>
                    </div>
                </div>
            )}
            {/* Overlay for payment error */}
            {paymentStatus === "error" && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center bg-white rounded-lg shadow-lg px-6 py-8 max-w-xs w-full mx-2">
                        <svg className="h-12 w-12 text-red-600 mb-4" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-lg font-semibold text-red-700 text-center">Payment failed</span>
                        <span className="text-sm text-muted-foreground mt-2 text-center">{paymentErrorMsg}</span>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => setPaymentStatus("idle")}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
            
            <div className={paymentStatus !== "idle" ? "pointer-events-none opacity-50 select-none" : ""}>
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
                                        onSelect={handleDateSelect}
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
                                    {/* <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" title="Available slot" aria-hidden="true" />
                                        <span>Indicates available slots</span>
                                    </div> */}
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

                            <div className="grid gap-2">
                                <label htmlFor="appointmentType" className="text-sm font-medium">
                                    Service Type
                                </label>
                                <select
                                    id="appointmentType"
                                    name="appointmentType"
                                    className="border rounded px-3 py-2"
                                    value={selectedAppointmentTypeId}
                                    onChange={(e) => setSelectedAppointmentTypeId(e.target.value)}
                                    required
                                    aria-required="true"
                                    aria-label="Service Type"
                                    title="Service Type"
                                >
                                    <option value="" disabled>
                                        {appointmentType && appointmentType.length > 0
                                            ? "Select Service Type"
                                            : "Loading types..."}
                                    </option>
                                    {appointmentType &&
                                        appointmentType.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.title}
                                                {type.subTitle && ` → ${type.subTitle}`}
                                                {type.price ? ` (₹${typeof type.price === "object" ? type.price.toNumber() : type.price})` : ""}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div
                                className="space-y-3 mt-2 flex-1 flex flex-col justify-end"
                                aria-label="Booking form"
                                title="Booking form"
                            >
                                <div className="grid gap-2">
                                    <label htmlFor="agenda" className="text-sm font-medium">
                                        Any Message (Optional)
                                    </label>
                                    <Textarea
                                        id="agenda"
                                        name="agenda"
                                        placeholder="Any Message (Optional)"
                                        value={agenda}
                                        onChange={(e) => setAgenda(e.target.value)}
                                        aria-required="true"
                                        aria-label="Any Message"
                                        title="Any Message"
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
                                    <button
                                        onClick={handlePay}
                                        className={`bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full`}
                                        disabled={
                                            isProcessing ||
                                            paymentStatus === "processing" ||
                                            paymentStatus === "success" ||
                                            paymentStatus === "error" ||
                                            !selectedSlotId ||
                                            !selectedAppointmentTypeId
                                        }
                                    >
                                        {paymentStatus === "processing" || isProcessing
                                            ? 'Processing...'
                                            : 'Book Appointment & Pay'}
                                    </button>
                                </CardFooter>

                                {(!selectedSlotId || !selectedAppointmentTypeId) && (
                                    <p className="text-xs text-muted-foreground" aria-live="polite">
                                        {!selectedSlotId
                                            ? "Select a time slot above to enable booking."
                                            : "Select an Service Type to enable booking."
                                        }
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
