"use client";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

interface Appointment {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: AppointmentStatus;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  agenda: string | null;
  slotId: string;
  userId: string | null;
  slot: Slots;
}

interface Slots {
  id: string;
  date: string;
  timeSlot: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

const SkeletonCard = () => (
  <li className="border rounded-lg p-4 shadow-sm flex flex-col gap-2 bg-white animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-4 w-16 bg-gray-200 rounded" />
    </div>
    <div className="space-y-2 mt-2">
      <div className="h-3 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
      <div className="h-3 w-40 bg-gray-200 rounded" />
    </div>
    <div className="flex gap-2 mt-2">
      <div className="h-8 w-16 bg-gray-200 rounded" />
      <div className="h-8 w-20 bg-gray-200 rounded" />
    </div>
  </li>
);

const ErrorModal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    role="alertdialog"
    aria-modal="true"
    tabIndex={-1}
  >
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
      <span className="text-red-600 text-2xl mb-2">⚠️</span>
      <div className="text-red-700 font-semibold mb-4 text-center">{message}</div>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        onClick={onClose}
        autoFocus
      >
        Close
      </button>
    </div>
  </div>
);

const CancelConfirmationModal = ({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    role="alertdialog"
    aria-modal="true"
    tabIndex={-1}
  >
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
      <span className="text-red-600 text-2xl mb-2">⚠️</span>
      <div className="text-red-700 font-semibold mb-4 text-center">
        Are you sure you want to cancel this appointment?
      </div>
      <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 rounded px-3 py-2 text-center">
        <strong>Note:</strong> If you cancel, you will need to book a new appointment and our admin team will need to approve it again.
      </div>
      <div className="flex gap-2 w-full">
        <button
          className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          onClick={onCancel}
          disabled={loading}
        >
          No, Go Back
        </button>
        <button
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={onConfirm}
          disabled={loading}
          autoFocus
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

const BookAppointments = () => {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = React.useState<Slots[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = React.useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [cancelId, setCancelId] = React.useState<string | null>(null);
  const router = useRouter();

  // Focus management for modals
  const rescheduleModalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/appointments");
        const data = await res.json();
        if (res.ok) {
          setAppointments(data.appointments);
        } else {
          setError(data.error || "Failed to fetch appointments");
        }
      } catch (err) {
        setError("Failed to fetch appointments");
      }
      setLoading(false);
    };
    fetchAppointments();
  }, []);

  React.useEffect(() => {
    if (showRescheduleModal && rescheduleModalRef.current) {
      rescheduleModalRef.current.focus();
    }
  }, [showRescheduleModal]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/slots?limit=1000&show=available&when=upcoming"
      );
      const data = await res.json();
      if (res.ok) {
        setAvailableSlots(data.slots);
      } else {
        setError(data.error || "Failed to fetch available slots");
      }
    } catch (err) {
      setError("Failed to fetch available slots");
    }
    setLoading(false);
  };

  const cancelAppointment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Appointment cancelled");
        setAppointments((prev) => prev.filter((appt) => appt.id !== id));
      } else {
        toast.error(data.error || data.message || "Failed to cancel appointment");
        setError(data.error || "Failed to cancel appointment");
      }
    } catch (err) {
      setError("Failed to cancel appointment");
    }
    setLoading(false);
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    newSlotId: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, newSlotId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Appointment rescheduled");
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId
              ? { ...appt, slotId: newSlotId, slot: { ...appt.slot, id: newSlotId } }
              : appt
          )
        );
      } else {
        toast.error(data.error || data.message || "Failed to reschedule");
        setError(data.error || "Failed to reschedule");
      }
    } catch (err) {
      setError("Failed to reschedule");
    }
    setLoading(false);
  };

  const handleReschedule = async (appointmentId: string) => {
    setRescheduleId(appointmentId);
    setShowRescheduleModal(true);
    await fetchAvailableSlots();
  };

  const handleConfirmReschedule = async (slotId: string) => {
    if (rescheduleId) {
      await updateAppointmentStatus(rescheduleId, slotId);
      setShowRescheduleModal(false);
      setRescheduleId(null);
    }
  };

  const handleCancelClick = (id: string) => {
    setCancelId(id);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (cancelId) {
      await cancelAppointment(cancelId);
      setShowCancelModal(false);
      setCancelId(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelId(null);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isPastAppointment = (date: string, timeSlot: string) => {
    // date: "YYYY-MM-DD", timeSlot: "hh:mm-hh:mm"
    try {
      const [start, end] = timeSlot.split("-");
      const [endHour, endMinute] = end.split(":").map(Number);
      const appointmentEnd = new Date(date);
      appointmentEnd.setHours(endHour, endMinute, 0, 0);
      return appointmentEnd < new Date();
    } catch {
      return false;
    }
  };

  // Prefetch /book-appointments on hover/focus
  const handlePrefetch = React.useCallback(() => {
    router.prefetch?.("/book-appointments");
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 sm:px-4">
      {/* CTA Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-green-50 border border-green-200 rounded-lg p-4 shadow">
        <div>
          <h2 className="text-xl font-bold text-green-900 mb-1">Manage Your Appointments</h2>
          <p className="text-green-800 text-sm">
            View, reschedule, or cancel your appointments. Need a new one? Book below!
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-5 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={() => router.push("/user/blogs")}
            onMouseEnter={handlePrefetch}
            onFocus={handlePrefetch}
            type="button"
          >
            Manage Blogs
          </button>
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => router.push("/book-appointments")}
            onMouseEnter={handlePrefetch}
            onFocus={handlePrefetch}
            type="button"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" aria-hidden="true" />{" "}
              Book New Appointment
            </div>
          </button>
        </div>
      </div>

      {loading && (
        <ul className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      )}

      {/* Error Modal */}
      {error && (
        <ErrorModal
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Appointments List */}
      {!loading && !error && (
        <>
          {appointments.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No appointments found.
            </div>
          ) : (
            <ul className="space-y-4">
              {appointments.map((appointment) => {
                const past = isPastAppointment(appointment.slot?.date, appointment.slot?.timeSlot);
                return (
                  <li
                    key={appointment.id}
                    className="border rounded-lg p-4 shadow-sm flex flex-col gap-2 bg-white transition hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-semibold text-base text-gray-800">
                          {appointment.userName}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 break-all">
                          {appointment.userEmail}
                        </span>
                      </div>
                      {past ? (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium capitalize bg-gray-200 text-gray-700"
                          title="Status: completed"
                        >
                          completed
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium capitalize ${appointment.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                            }`}
                          title={`Status: ${appointment.status.toLowerCase()}`}
                        >
                          {appointment.status.toLowerCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-1">
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(appointment.slot?.date)}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span>{" "}
                        {appointment.slot?.timeSlot}
                      </div>
                      {appointment.userPhone && (
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          {appointment.userPhone}
                        </div>
                      )}
                    </div>
                    {/* Agenda always on a new line with different bg color */}
                    {appointment.agenda && (
                      <div className="mt-2 px-3 py-2 rounded bg-blue-50 text-blue-800 text-sm w-fit">
                        <span className="font-medium">Agenda:</span>{" "}
                        {appointment.agenda}
                      </div>
                    )}
                    {!past && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition focus:outline-none focus:ring-2 focus:ring-red-300"
                          onClick={() => handleCancelClick(appointment.id)}
                          disabled={loading}
                          title="Cancel this appointment"
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                          onClick={() => handleReschedule(appointment.id)}
                          disabled={loading}
                          title="Reschedule this appointment"
                        >
                          Reschedule
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md outline-none"
            ref={rescheduleModalRef}
            tabIndex={0}
          >
            <h3 className="text-lg font-bold mb-4 text-center">
              Select a new slot
            </h3>
            {/* Note about status change */}
            <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 rounded px-3 py-2 text-center">
              <strong>Note:</strong> If you reschedule, your approved appointment will change to <span className="font-semibold">pending</span> and our admin team will review it.
            </div>
            {loading ? (
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-gray-500 text-center">
                No available slots.
              </div>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <span className="font-medium">
                        {formatDate(slot.date)}
                      </span>
                      <span className="ml-2">{slot.timeSlot}</span>
                    </div>
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-300"
                      onClick={() => handleConfirmReschedule(slot.id)}
                      disabled={loading}
                      title="Select this slot"
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition w-full"
              onClick={() => {
                setShowRescheduleModal(false);
                setRescheduleId(null);
              }}
              disabled={loading}
              title="Cancel rescheduling"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <CancelConfirmationModal
          onConfirm={handleCancelConfirm}
          onCancel={handleCancelModalClose}
          loading={loading}
        />
      )}
    </div>
  );
};

export default BookAppointments;
