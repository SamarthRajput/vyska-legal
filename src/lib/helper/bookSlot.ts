import { prisma } from "@/lib/prisma";

interface CreateAppointmentArgs {
    agenda?: string;
    slotId: string;
    userId: string;
    phone?: string;
    appointmentTypeId: string;
    createPayment?: boolean;
}

export async function createAppointmentAndBookSlot({
    agenda,
    slotId,
    userId,
    phone,
    appointmentTypeId,
    createPayment = false
}: CreateAppointmentArgs) {
    return prisma.$transaction(async (tx) => {
        // Check slot availability
        const slot = await tx.appointmentSlot.findUnique({ where: { id: slotId } });
        if (!slot) throw { status: 404, message: "Slot not found" };
        if (slot.isBooked) throw { status: 400, message: "Slot already booked" };

        // Get user
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw { status: 404, message: "User not found" };

        // Create appointment
        const appointment = await tx.appointment.create({
            data: {
                userName: user.name,
                userEmail: user.email,
                userPhone: phone || null,
                agenda,
                userId,
                appointmentTypeId,
                slotId,
                status: "PENDING",
            },
            include: { appointmentType: true },
        });

        // Mark slot as booked
        await tx.appointmentSlot.update({
            where: { id: slotId },
            data: { isBooked: true },
        });

        let payment = null;

        // Create payment for this appointment
        if (createPayment) {
            payment = await tx.payment.create({
                data: {
                    orderId: "", // to be updated after creating Razorpay order
                    amount: appointment.appointmentType.price,
                    currency: "INR",
                    status: "PENDING",
                    paymentFor: "APPOINTMENT",
                    userId,
                    appointmentId: appointment.id,
                },
            });
        }

        return { appointment, payment };
    });
}
