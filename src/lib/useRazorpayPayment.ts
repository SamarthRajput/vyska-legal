/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type PaymentFor = 'SERVICE' | 'APPOINTMENT';

interface PaymentOptions {
    paymentFor: PaymentFor;
    serviceId?: string;
    agenda?: string;
    slotId?: string;
    appointmentTypeId?: string;
    description?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function useRazorpayPayment() {
    const [isProcessing, setIsProcessing] = useState(false);

    const startPayment = async ({
        paymentFor,
        serviceId,
        agenda,
        slotId,
        appointmentTypeId,
        description,
        onSuccess,
        onError,
    }: PaymentOptions) => {
        try {
            setIsProcessing(true);

            // Create order on the server
            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentFor,
                    serviceId,
                    agenda,
                    slotId,
                    appointmentTypeId,
                    description,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Order creation failed');

            // Initialize Razorpay payment
            // if (!window.Razorpay) throw new Error('Razorpay SDK not loaded');
            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'Vyska Legal',
                description: description || 'Payment',
                order_id: data.orderId,
                handler: async function (response: any) {
                    try {
                        // Verify payment on the server
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            toast.success('Payment successful!');
                            onSuccess?.(verifyData);
                        } else {
                            toast.error(verifyData.message);
                            throw new Error(verifyData.message);
                        }
                    } catch (err) {
                        console.error('Verification failed:', err);
                        onError?.(err);
                    }
                }, modal: {
                    ondismiss: async function () {
                        // When user closes Razorpay without paying
                        toast.info('Payment cancelled by user.');
                        try {
                            await fetch('/api/cancel-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orderId: data.orderId, reason: 'User closed the payment modal', metadata: {
                                        paymentFor, serviceId, agenda, slotId, appointmentTypeId, description
                                    }
                                }),
                            });
                        } catch (err) {
                            console.error('Error cancelling payment:', err);
                        }
                    },
                },
                theme: { color: '#2563eb' },
            };

            const razor = new window.Razorpay(options);
            razor.on('payment.failed', async function (response: any) {
                toast.error('Payment failed. Please try again.');
                const { code, description, reason, source, step, metadata } = response.error;
                toast.error(`Payment failed`, {
                    description: `Error Code: ${code} ${description || reason || 'Payment failed'}`,
                });
                try {
                    await fetch('/api/cancel-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: response.error.metadata.order_id,
                            reason: description || reason || 'Payment failed',
                            metadata,
                        }),
                    });
                } catch (err) {
                    console.error('Error reporting failed payment:', err);
                }

                onError?.(new Error(response.error.description || 'Payment failed'));
            });

            razor.open();
        } catch (error) {
            console.error('Payment Error:', error);
            onError?.(error instanceof Error ? error : new Error('Payment failed'));
        } finally {
            setIsProcessing(false);
        }
    };

    return { startPayment, isProcessing };
}
