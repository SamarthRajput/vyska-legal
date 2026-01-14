import { z } from "zod";

export const createAppointmentSchema = z.object({
    agenda: z.string().max(500, "Agenda must be 500 characters or less").optional(),
    slotId: z.string().min(1, "Slot ID is required"),
    appointmentTypeId: z.string().min(1, "Appointment Type ID is required"),
    userId: z.string().min(1, "User ID is required"),
    phone: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
    appointmentId: z.string().min(1, "Appointment ID is required"),
    newSlotId: z.string().optional(),
});

export const deleteAppointmentSchema = z.object({
    id: z.string().min(1, "Appointment ID is required"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
