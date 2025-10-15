'use client';
import { useRazorpayPayment } from '@/lib/useRazorpayPayment';

export default function ServicePayButton({ serviceId, amount, description, className }: { serviceId: string, amount: number, description: string, className?: string }) {
    const { startPayment, isProcessing } = useRazorpayPayment();

    const handlePay = () => {
        startPayment({
            amount,
            paymentFor: 'SERVICE',
            serviceId,
            description,
            onSuccess: () => alert('Service payment successful!'),
            onError: (err) => alert('Payment failed: ' + err.message),
        });
    };

    return (
        <button
            disabled={isProcessing}
            onClick={handlePay}
            className={`bg-green-600 text-white px-4 py-2 rounded ${className}`}
        >
            {isProcessing ? 'Processing...' : 'Book Service Now'}
        </button>
    );
}
