/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useRazorpayPayment } from '@/lib/useRazorpayPayment';
import { toast } from 'sonner';

export default function AppointmentPayButton({
    appointmentTypeId, slotId, agenda, description, className, disabled, onError, onSuccess
}: {
    appointmentTypeId: string,
    slotId: string, agenda: string | null,
    description: string, className?: string,
    disabled: boolean,
    onError?: (error: any) => void,
    onSuccess?: (data: any) => void,
}) {
    const { startPayment, isProcessing } = useRazorpayPayment();

    const handlePay = () => {
        if (disabled) {
            toast.error("Please select an appointment type and slot before booking.");
            return;
        }
        if (!appointmentTypeId || !slotId) {
            toast.error("Appointment type or slot is missing.");
            return;
        }
        if (description.length > 255) {
            toast.error("Description is too long. Please limit to 255 characters.");
            return;
        }

        startPayment({
            paymentFor: 'APPOINTMENT',
            appointmentTypeId,
            agenda: agenda ? agenda : 'No message provided',
            slotId,
            description,
            onSuccess: onSuccess,
            onError: onError,
        });
    };

    return (
        <button
            onClick={handlePay}
            className={`bg-blue-600 text-white px-4 py-2 rounded ${className} cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {isProcessing ? 'Processing...' : 'Book Appointment & Pay'}
        </button>
    );
}
