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

    const startPayment = ({
        paymentFor,
        serviceId,
        agenda,
        slotId,
        appointmentTypeId,
        description,
        onSuccess,
        onError,
    }: PaymentOptions): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            let settled = false;
            const safeResolve = (val?: any) => { if (!settled) { settled = true; resolve(val); } };
            const safeReject = (err?: any) => { if (!settled) { settled = true; reject(err); } };

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
                                safeResolve(verifyData);
                            } else {
                                const err = new Error(verifyData.message || 'Verification failed');
                                toast.error(verifyData.message || 'Verification failed');
                                onError?.(err);
                                safeReject(err);
                            }
                        } catch (err) {
                            console.error('Verification failed:', err);
                            onError?.(err);
                            safeReject(err);
                        }
                    }, modal: {
                        ondismiss: async function () {
                            // When user closes Razorpay without paying
                            const err = new Error('Payment cancelled by user');
                            // toast.info('Payment cancelled by user.');

                            // Notify consumer via callback
                            try { onError?.(err); } catch (e) { /* swallow */ }

                            // Reject the startPayment promise so callers can await and react
                            safeReject(err);

                            // Dispatch a window event for any other listeners in the app
                            try {
                                window.dispatchEvent(new CustomEvent('razorpay-payment-cancelled', {
                                    detail: {
                                        orderId: data.orderId,
                                        reason: 'User closed the payment modal',
                                        metadata: { paymentFor, serviceId, agenda, slotId, appointmentTypeId, description },
                                    },
                                }));
                            } catch (e) {
                                console.error('Event dispatch failed:', e);
                            }

                            // Inform server about cancellation to free the slots
                            try {
                                await fetch('/api/cancel-payment', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        orderId: data.orderId,
                                        reason: 'User closed the payment modal',
                                        metadata: { paymentFor, serviceId, agenda, slotId, appointmentTypeId, description },
                                    }),
                                });
                            } catch (err) {
                                console.error('Error cancelling payment:', err);
                            } finally {
                                setIsProcessing(false);
                            }
                        },
                    },
                    theme: { color: '#2563eb' },
                };

                const razor = new window.Razorpay(options);
                razor.on('payment.failed', async function (response: any) {
                    const { code, description, reason, metadata } = response.error || {};
                    toast.error('Payment failed. Please try again.');
                    toast.error(`Payment failed`, {
                        description: `Error Code: ${code} ${description || reason || 'Payment failed'}`,
                    });

                    const err = new Error(response.error?.description || description || reason || 'Payment failed');
                    try {
                        await fetch('/api/cancel-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: response.error?.metadata?.order_id || data.orderId,
                                reason: description || reason || 'Payment failed',
                                metadata,
                            }),
                        });
                    } catch (err2) {
                        console.error('Error reporting failed payment:', err2);
                    }

                    onError?.(err);
                    safeReject(err);
                });

                razor.open();
            } catch (error) {
                console.error('Payment Error:', error);
                const err = error instanceof Error ? error : new Error('Payment failed');
                onError?.(err);
                safeReject(err);
            } finally {
                // If not settled already (e.g., ondismiss handled it), clear processing state
                if (!settled) setIsProcessing(false);
            }
        });
    };

    return { startPayment, isProcessing };
}
