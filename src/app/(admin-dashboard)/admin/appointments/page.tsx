"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Appointment {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    userName: string;
    userEmail: string;
    userPhone: string | null;
    slotId: string;
    userId: string | null;
}

interface AppointmentSlot {
    id: string;
    date: string;
    timeSlot: string;
    isBooked: boolean;
    createdAt: string;
    updatedAt: string;
    Appointment: Appointment[];
}

// Generate slots between start and end time with given duration (minutes) only for 24 hours irrespective of date 
const generateTimeSlots = (start: string, end: string, duration: number) => {
    const slots: string[] = [];
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);
    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    while (current < endTime) {
        const next = new Date(current.getTime() + duration * 60 * 1000);
        slots.push(
            `${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")}-${next.getHours().toString().padStart(2, "0")}:${next.getMinutes().toString().padStart(2, "0")}`
        );
        current = next;
    }
    return slots;
};

const Appointment = () => {
    const [slots, setSlots] = useState<AppointmentSlot[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [slotDuration, setSlotDuration] = useState(30); // 30 mins default
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const [bookingSlot, setBookingSlot] = useState<AppointmentSlot | null>(null);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhone, setUserPhone] = useState("");

    // Fetch slots from API
    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/slots");
            const data = await res.json();
            setSlots(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch slots");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    // Generate clickable time slots
    const handleGenerateSlots = () => {
        if (!startDate || !endDate) return toast.error("Select start and end date");
        const slotsGenerated: string[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dailySlots = generateTimeSlots("09:00", "17:00", slotDuration); // 9AM-5PM
            dailySlots.forEach((slot) => slotsGenerated.push(slot));
        }

        setAvailableSlots(slotsGenerated);
        setSelectedSlots(new Set());
    };

    const toggleSlot = (slot: string) => {
        const newSet = new Set(selectedSlots);
        if (newSet.has(slot)) newSet.delete(slot);
        else newSet.add(slot);
        setSelectedSlots(newSet);
    };

    const handleCreateSlots = async () => {
        if (!startDate || !endDate || selectedSlots.size === 0) {
            return toast.error("Select date(s) and slots");
        }

        try {
            const res = await fetch("/api/admin/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    timeSlots: Array.from(selectedSlots),
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`${data.created} slots created`);
                setSelectedSlots(new Set());
                setAvailableSlots([]);
                setStartDate("");
                setEndDate("");
                fetchSlots();
            } else {
                toast.error(data.error || "Failed to create slots");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    const handleBookSlot = async () => {
        if (!bookingSlot || !userName || !userEmail) return toast.error("Fill required fields");

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
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Appointment booked successfully");
                setBookingSlot(null);
                setUserName("");
                setUserEmail("");
                setUserPhone("");
                fetchSlots();
            } else {
                toast.error(data.error || "Failed to book appointment");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Appointment Slots</h1>

            {/* Bulk Slot Generation */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                >
                    <option value={30}>30 mins</option>
                    <option value={60}>1 hour</option>
                </select>
                <button
                    onClick={handleGenerateSlots}
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                    Generate Slots
                </button>
                <button
                    onClick={handleCreateSlots}
                    className="bg-green-600 text-white px-4 py-1 rounded"
                >
                    Create Selected Slots
                </button>
            </div>

            {/* Selectable Slots */}
            {availableSlots.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {availableSlots.map((slot) => (
                        <button
                            key={slot}
                            className={`px-2 py-1 border rounded ${selectedSlots.has(slot) ? "bg-green-500 text-white" : "bg-white"
                                }`}
                            onClick={() => toggleSlot(slot)}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            )}

            {/* Existing Slots Table */}
            <table className="w-full border-collapse border mb-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1">Time Slot</th>
                        <th className="border px-2 py-1">Booked?</th>
                        <th className="border px-2 py-1">Appointments</th>
                        <th className="border px-2 py-1">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center p-2">Loading...</td>
                        </tr>
                    ) : slots.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center p-2">No slots found</td>
                        </tr>
                    ) : (
                        slots.map((slot) => (
                            <tr key={slot.id}>
                                <td className="border px-2 py-1">{new Date(slot.date).toLocaleDateString()}</td>
                                <td className="border px-2 py-1">{slot.timeSlot}</td>
                                <td className="border px-2 py-1">{slot.isBooked ? "Yes" : "No"}</td>
                                <td className="border px-2 py-1">
                                    {slot.Appointment.length > 0
                                        ? slot.Appointment.map((a) => `${a.userName} (${a.status})`).join(", ")
                                        : "-"}
                                </td>
                                <td className="border px-2 py-1">
                                    {!slot.isBooked && (
                                        <button
                                            onClick={() => setBookingSlot(slot)}
                                            className="bg-green-500 text-white px-2 py-1 rounded"
                                        >
                                            Book
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Booking Modal */}
            {bookingSlot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            Book Appointment ({new Date(bookingSlot.date).toLocaleDateString()} - {bookingSlot.timeSlot})
                        </h2>
                        <input
                            type="text"
                            placeholder="User Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="border px-2 py-1 w-full mb-2 rounded"
                        />
                        <input
                            type="email"
                            placeholder="User Email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="border px-2 py-1 w-full mb-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="User Phone (optional)"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="border px-2 py-1 w-full mb-4 rounded"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setBookingSlot(null)} className="px-4 py-1 border rounded">Cancel</button>
                            <button onClick={handleBookSlot} className="px-4 py-1 bg-blue-600 text-white rounded">Book</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointment;
