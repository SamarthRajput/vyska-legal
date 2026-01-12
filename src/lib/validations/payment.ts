import { z } from "zod";

export const createOrderSchema = z.object({
    paymentFor: z.enum(["APPOINTMENT", "SERVICE"]),
    serviceId: z.string().optional(),
    description: z.string().optional(),
    agenda: z.string().optional(),
    slotId: z.string().optional(),
    appointmentTypeId: z.string().optional(),
}).refine((data) => {
    if (data.paymentFor === "APPOINTMENT") {
        return !!data.slotId && !!data.appointmentTypeId;
    }
    return true;
}, {
    message: "slotId and appointmentTypeId are required for APPOINTMENT payments",
    path: ["slotId"],
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
